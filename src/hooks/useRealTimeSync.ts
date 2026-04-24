import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  WebSocketMessage, 
  WebSocketMessageType, 
  RealTimeSyncConfig, 
  SyncOperation 
} from '@/types/websocket';
import { useWebSocket } from './useWebSocket';
import { createWebSocketLogger } from '@/utils/websocketHelpers';

interface UseRealTimeSyncOptions {
  entityType: string;
  entityId?: string;
  config?: Partial<RealTimeSyncConfig>;
  enableConflictResolution?: boolean;
  syncInterval?: number;
}

interface SyncState {
  isSyncing: boolean;
  lastSync: number;
  pendingOperations: SyncOperation[];
  conflicts: Array<{
    operation: SyncOperation;
    remoteData: any;
    localData: any;
  }>;
}

export function useRealTimeSync<T = any>(options: UseRealTimeSyncOptions) {
  const {
    entityType,
    entityId,
    config: userConfig = {},
    enableConflictResolution = true,
    syncInterval = 5000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSync: 0,
    pendingOperations: [],
    conflicts: []
  });
  const [error, setError] = useState<string | null>(null);

  const config: RealTimeSyncConfig = {
    enabled: true,
    syncInterval,
    conflictResolution: 'merge',
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000
    },
    ...userConfig
  };

  const { subscribe, unsubscribe, sendMessage, isConnected, connectionState } = useWebSocket();
  const loggerRef = useRef(createWebSocketLogger(true));
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const operationIdCounter = useRef(0);

  // Generate unique operation ID
  const generateOperationId = useCallback(() => {
    return `op_${++operationIdCounter.current}_${Date.now()}`;
  }, []);

  // Create sync operation
  const createSyncOperation = useCallback((
    type: 'create' | 'update' | 'delete',
    operationData: any
  ): SyncOperation => {
    return {
      id: generateOperationId(),
      type,
      entity: entityType,
      entityId: entityId || '',
      data: operationData,
      timestamp: Date.now(),
      status: 'pending'
    };
  }, [entityType, entityId, generateOperationId]);

  // Handle conflict resolution
  const resolveConflict = useCallback((
    operation: SyncOperation,
    remoteData: any,
    localData: any
  ): T => {
    switch (config.conflictResolution) {
      case 'local':
        loggerRef.current.log('Conflict resolved: using local data', { operationId: operation.id });
        return localData;
      
      case 'remote':
        loggerRef.current.log('Conflict resolved: using remote data', { operationId: operation.id });
        return remoteData;
      
      case 'merge':
        // Simple merge strategy - can be customized
        const merged = { ...remoteData, ...localData };
        loggerRef.current.log('Conflict resolved: merged data', { 
          operationId: operation.id, 
          merged 
        });
        return merged;
      
      default:
        return localData;
    }
  }, [config.conflictResolution]);

  // Process pending operations
  const processPendingOperations = useCallback(async () => {
    if (!isConnected || syncState.pendingOperations.length === 0) {
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true }));

    for (const operation of syncState.pendingOperations) {
      try {
        // Send operation to server
        sendMessage({
          type: WebSocketMessageType.COLLABORATION_UPDATE,
          payload: {
            operation,
            entityType,
            entityId
          }
        });

        // Mark as synced
        setSyncState(prev => ({
          ...prev,
          pendingOperations: prev.pendingOperations.filter(op => op.id !== operation.id)
        }));

        loggerRef.current.log('Operation synced', { operationId: operation.id });

      } catch (err) {
        loggerRef.current.error('Failed to sync operation', { operationId: operation.id, error: err });
        
        // Implement retry logic
        if (operation.status === 'pending') {
          const retryDelay = config.retryPolicy?.initialDelay || 1000;
          setTimeout(() => {
            // Retry operation
            setSyncState(prev => ({
              ...prev,
              pendingOperations: [...prev.pendingOperations, operation]
            }));
          }, retryDelay);
        }
      }
    }

    setSyncState(prev => ({ 
      ...prev, 
      isSyncing: false,
      lastSync: Date.now()
    }));
  }, [isConnected, syncState.pendingOperations, sendMessage, entityType, entityId, config.retryPolicy]);

  // Handle incoming sync messages
  const handleSyncMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === WebSocketMessageType.COLLABORATION_UPDATE) {
      const { operation, remoteData } = message.payload;
      
      if (operation.entity === entityType && 
          (!entityId || operation.entityId === entityId)) {
        
        // Check for conflicts
        const localOperation = syncState.pendingOperations.find(
          op => op.entityId === operation.entityId && op.type === operation.type
        );

        if (localOperation && enableConflictResolution) {
          // Conflict detected
          const resolvedData = resolveConflict(localOperation, remoteData, data);
          setData(resolvedData);
          
          setSyncState(prev => ({
            ...prev,
            conflicts: [...prev.conflicts, {
              operation: localOperation,
              remoteData,
              localData: data
            }]
          }));

          // Remove conflicting operation
          setSyncState(prev => ({
            ...prev,
            pendingOperations: prev.pendingOperations.filter(op => op.id !== localOperation.id)
          }));

        } else {
          // No conflict, apply remote changes
          setData(remoteData);
        }

        loggerRef.current.log('Sync message processed', { operationId: operation.id });
      }
    }
  }, [entityType, entityId, syncState.pendingOperations, enableConflictResolution, resolveConflict, data]);

  // Subscribe to sync messages
  useEffect(() => {
    if (!isConnected || !config.enabled) {
      return;
    }

    const subscriptionId = subscribe({
      type: WebSocketMessageType.COLLABORATION_UPDATE,
      filters: { entityType, ...(entityId && { entityId }) },
      callback: handleSyncMessage
    });

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [isConnected, config.enabled, entityType, entityId, subscribe, unsubscribe, handleSyncMessage]);

  // Auto-sync timer
  useEffect(() => {
    if (config.enabled && config.syncInterval && config.syncInterval > 0) {
      syncTimerRef.current = setInterval(() => {
        processPendingOperations();
      }, config.syncInterval);

      return () => {
        if (syncTimerRef.current) {
          clearInterval(syncTimerRef.current);
        }
      };
    }
  }, [config.enabled, config.syncInterval, processPendingOperations]);

  // Public API methods
  const create = useCallback((newData: T) => {
    const operation = createSyncOperation('create', newData);
    
    setSyncState(prev => ({
      ...prev,
      pendingOperations: [...prev.pendingOperations, operation]
    }));

    setData(newData);
    loggerRef.current.log('Create operation queued', { operationId: operation.id });
  }, [createSyncOperation]);

  const update = useCallback((updates: Partial<T>) => {
    if (!data) {
      loggerRef.current.warn('Cannot update: no data exists');
      return;
    }

    const updatedData = { ...data, ...updates };
    const operation = createSyncOperation('update', updatedData);
    
    setSyncState(prev => ({
      ...prev,
      pendingOperations: [...prev.pendingOperations, operation]
    }));

    setData(updatedData);
    loggerRef.current.log('Update operation queued', { operationId: operation.id });
  }, [data, createSyncOperation]);

  const remove = useCallback(() => {
    if (!data) {
      loggerRef.current.warn('Cannot delete: no data exists');
      return;
    }

    const operation = createSyncOperation('delete', { id: entityId });
    
    setSyncState(prev => ({
      ...prev,
      pendingOperations: [...prev.pendingOperations, operation]
    }));

    setData(null);
    loggerRef.current.log('Delete operation queued', { operationId: operation.id });
  }, [data, entityId, createSyncOperation]);

  const forceSync = useCallback(() => {
    processPendingOperations();
  }, [processPendingOperations]);

  const clearConflicts = useCallback(() => {
    setSyncState(prev => ({ ...prev, conflicts: [] }));
    loggerRef.current.log('Conflicts cleared');
  }, []);

  const retryFailedOperations = useCallback(() => {
    const failedOps = syncState.pendingOperations.filter(op => op.status === 'failed');
    
    setSyncState(prev => ({
      ...prev,
      pendingOperations: prev.pendingOperations.map(op => 
        op.status === 'failed' ? { ...op, status: 'pending' } : op
      )
    }));

    loggerRef.current.log('Retrying failed operations', { count: failedOps.length });
  }, [syncState.pendingOperations]);

  // Sync status helpers
  const isSynced = syncState.pendingOperations.length === 0 && !syncState.isSyncing;
  const hasConflicts = syncState.conflicts.length > 0;
  const syncProgress = syncState.pendingOperations.length > 0 
    ? (syncState.lastSync / Date.now()) * 100 
    : 100;

  return {
    // Data
    data,
    
    // State
    syncState,
    isSynced,
    hasConflicts,
    syncProgress,
    error,
    
    // Connection status
    isConnected,
    connectionState,
    
    // Operations
    create,
    update,
    remove,
    forceSync,
    
    // Conflict management
    clearConflicts,
    retryFailedOperations,
    
    // Utilities
    generateOperationId
  };
}

// Hook for syncing arrays of entities
export function useRealTimeArraySync<T extends { id: string }>(
  entityType: string,
  options?: Omit<UseRealTimeSyncOptions, 'entityType'>
) {
  const arraySync = useRealTimeSync<T[]>({ entityType, ...options });

  const addItem = useCallback((item: T) => {
    const currentData = arraySync.data || [];
    const updatedData = [...currentData, item];
    arraySync.update(updatedData);
  }, [arraySync]);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    const currentData = arraySync.data || [];
    const updatedData = currentData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    arraySync.update(updatedData);
  }, [arraySync]);

  const removeItem = useCallback((id: string) => {
    const currentData = arraySync.data || [];
    const updatedData = currentData.filter(item => item.id !== id);
    arraySync.update(updatedData);
  }, [arraySync]);

  const getItem = useCallback((id: string): T | undefined => {
    const currentData = arraySync.data || [];
    return currentData.find(item => item.id === id);
  }, [arraySync.data]);

  return {
    ...arraySync,
    addItem,
    updateItem,
    removeItem,
    getItem
  };
}

// Hook for real-time form synchronization
export function useRealTimeFormSync<T extends Record<string, any>>(
  formId: string,
  initialData: T,
  options?: UseRealTimeSyncOptions
) {
  const formSync = useRealTimeSync<T>({ 
    entityType: 'form', 
    entityId: formId, 
    ...options 
  });

  const [formData, setFormData] = useState<T>(initialData);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof T, string>>>({});

  // Update form data when sync data changes
  useEffect(() => {
    if (formSync.data) {
      setFormData(formSync.data);
    }
  }, [formSync.data]);

  const updateField = useCallback((field: keyof T, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    formSync.update(updatedData);
  }, [formData, formSync]);

  const updateFields = useCallback((updates: Partial<T>) => {
    const updatedData = { ...formData, ...updates };
    setFormData(updatedData);
    formSync.update(updatedData);
  }, [formData, formSync]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    formSync.update(initialData);
  }, [initialData, formSync]);

  const validateField = useCallback((field: keyof T, validator: (value: any) => string | null) => {
    const error = validator(formData[field]);
    setFieldErrors(prev => ({ ...prev, [field]: error || undefined }));
    return !error;
  }, [formData]);

  const validateForm = useCallback((validators: Partial<Record<keyof T, (value: any) => string | null>>) => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.entries(validators).forEach(([field, validator]) => {
      if (validator) {
        const error = validator(formData[field as keyof T]);
        if (error) {
          errors[field as keyof T] = error;
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    return isValid;
  }, [formData]);

  return {
    ...formSync,
    formData,
    fieldErrors,
    updateField,
    updateFields,
    resetForm,
    validateField,
    validateForm,
    isDirty: JSON.stringify(formData) !== JSON.stringify(initialData)
  };
}
