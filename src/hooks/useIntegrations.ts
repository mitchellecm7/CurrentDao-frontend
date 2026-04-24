import { useState, useEffect, useCallback } from 'react';

interface Integration {
  id: string;
  name: string;
  type: 'energy-provider' | 'weather' | 'smart-home' | 'iot-device';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: Date;
  data?: any;
  config: Record<string, any>;
}

interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  errorIntegrations: number;
  dataPointsToday: number;
  lastUpdate: Date;
}

interface UseIntegrationsOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enableMetrics?: boolean;
}

interface UseIntegrationsReturn {
  integrations: Integration[];
  metrics: IntegrationMetrics | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addIntegration: (integration: Omit<Integration, 'id'>) => Promise<void>;
  removeIntegration: (id: string) => Promise<void>;
  updateIntegration: (id: string, updates: Partial<Integration>) => Promise<void>;
  syncIntegration: (id: string) => Promise<void>;
  syncAllIntegrations: () => Promise<void>;
  
  // Getters
  getIntegration: (id: string) => Integration | undefined;
  getIntegrationsByType: (type: Integration['type']) => Integration[];
  getActiveIntegrations: () => Integration[];
  getErrorIntegrations: () => Integration[];
  
  // Utilities
  testConnection: (id: string) => Promise<boolean>;
  exportData: (format: 'json' | 'csv') => Promise<void>;
  importData: (data: any) => Promise<void>;
}

export const useIntegrations = (options: UseIntegrationsOptions = {}): UseIntegrationsReturn => {
  const {
    autoSync = true,
    syncInterval = 60000, // 1 minute
    enableMetrics = true,
  } = options;

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load integrations from storage
  const loadIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const savedIntegrations = localStorage.getItem('integrations');
      if (savedIntegrations) {
        const parsed = JSON.parse(savedIntegrations);
        setIntegrations(parsed.map((integration: any) => ({
          ...integration,
          lastSync: integration.lastSync ? new Date(integration.lastSync) : undefined,
        })));
      }
    } catch (err) {
      setError('Failed to load integrations');
      console.error('Failed to load integrations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save integrations to storage
  const saveIntegrations = useCallback(async (newIntegrations: Integration[]) => {
    try {
      localStorage.setItem('integrations', JSON.stringify(newIntegrations));
      setIntegrations(newIntegrations);
      updateMetrics(newIntegrations);
    } catch (err) {
      setError('Failed to save integrations');
      console.error('Failed to save integrations:', err);
    }
  }, []);

  // Update metrics
  const updateMetrics = useCallback((currentIntegrations: Integration[]) => {
    if (!enableMetrics) return;

    const activeCount = currentIntegrations.filter(i => i.status === 'connected').length;
    const errorCount = currentIntegrations.filter(i => i.status === 'error').length;
    
    // Calculate data points (mock implementation)
    const dataPoints = currentIntegrations.reduce((total, integration) => {
      if (integration.status === 'connected' && integration.data) {
        return total + (integration.data.dataPoints || 0);
      }
      return total;
    }, 0);

    setMetrics({
      totalIntegrations: currentIntegrations.length,
      activeIntegrations: activeCount,
      errorIntegrations: errorCount,
      dataPointsToday: dataPoints,
      lastUpdate: new Date(),
    });
  }, [enableMetrics]);

  // Sync integration
  const syncIntegration = useCallback(async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) {
      throw new Error(`Integration with id ${id} not found`);
    }

    // Update status to syncing
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, status: 'syncing' } : i
    ));

    try {
      // Simulate API call based on integration type
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock data based on integration type
      let mockData: any = {};
      
      switch (integration.type) {
        case 'energy-provider':
          mockData = {
            currentPrice: 0.15 + Math.random() * 0.10,
            consumption: Math.random() * 1000,
            generation: Math.random() * 500,
            dataPoints: Math.floor(Math.random() * 100) + 50,
            lastReading: new Date(),
          };
          break;
        case 'weather':
          mockData = {
            temperature: 15 + Math.random() * 20,
            humidity: 40 + Math.random() * 40,
            windSpeed: Math.random() * 30,
            forecast: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() + i * 86400000),
              high: 20 + Math.random() * 10,
              low: 10 + Math.random() * 10,
            })),
            dataPoints: Math.floor(Math.random() * 50) + 20,
          };
          break;
        case 'smart-home':
          mockData = {
            devices: Math.floor(Math.random() * 20) + 5,
            activeDevices: Math.floor(Math.random() * 10) + 2,
            energyUsage: Math.random() * 500,
            dataPoints: Math.floor(Math.random() * 200) + 100,
          };
          break;
        case 'iot-device':
          mockData = {
            sensors: Math.floor(Math.random() * 50) + 10,
            onlineSensors: Math.floor(Math.random() * 40) + 8,
            dataPoints: Math.floor(Math.random() * 1000) + 500,
            alerts: Math.floor(Math.random() * 5),
          };
          break;
      }

      // Update integration with new data
      const updatedIntegration = {
        ...integration,
        status: 'connected' as const,
        lastSync: new Date(),
        data: mockData,
      };

      setIntegrations(prev => prev.map(i => i.id === id ? updatedIntegration : i));
      updateMetrics([...integrations.filter(i => i.id !== id), updatedIntegration]);
      
    } catch (err) {
      // Update status to error
      setIntegrations(prev => prev.map(i => 
        i.id === id ? { ...i, status: 'error' } : i
      ));
      throw err;
    }
  }, [integrations, updateMetrics]);

  // Sync all integrations
  const syncAllIntegrations = useCallback(async () => {
    const connectedIntegrations = integrations.filter(i => i.status === 'connected');
    
    // Update all to syncing status
    setIntegrations(prev => prev.map(i => 
      connectedIntegrations.some(ci => ci.id === i.id) 
        ? { ...i, status: 'syncing' } 
        : i
    ));

    // Sync in parallel
    try {
      await Promise.all(
        connectedIntegrations.map(integration => syncIntegration(integration.id))
      );
    } catch (err) {
      console.error('Failed to sync some integrations:', err);
    }
  }, [integrations, syncIntegration]);

  // Add integration
  const addIntegration = useCallback(async (integration: Omit<Integration, 'id'>) => {
    const newIntegration: Integration = {
      ...integration,
      id: `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'disconnected',
    };

    await saveIntegrations([...integrations, newIntegration]);
  }, [integrations, saveIntegrations]);

  // Remove integration
  const removeIntegration = useCallback(async (id: string) => {
    const newIntegrations = integrations.filter(i => i.id !== id);
    await saveIntegrations(newIntegrations);
  }, [integrations, saveIntegrations]);

  // Update integration
  const updateIntegration = useCallback(async (id: string, updates: Partial<Integration>) => {
    const newIntegrations = integrations.map(i => 
      i.id === id ? { ...i, ...updates } : i
    );
    await saveIntegrations(newIntegrations);
  }, [integrations, saveIntegrations]);

  // Get integration by ID
  const getIntegration = useCallback((id: string) => {
    return integrations.find(i => i.id === id);
  }, [integrations]);

  // Get integrations by type
  const getIntegrationsByType = useCallback((type: Integration['type']) => {
    return integrations.filter(i => i.type === type);
  }, [integrations]);

  // Get active integrations
  const getActiveIntegrations = useCallback(() => {
    return integrations.filter(i => i.status === 'connected');
  }, [integrations]);

  // Get error integrations
  const getErrorIntegrations = useCallback(() => {
    return integrations.filter(i => i.status === 'error');
  }, [integrations]);

  // Test connection
  const testConnection = useCallback(async (id: string): Promise<boolean> => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) {
      throw new Error(`Integration with id ${id} not found`);
    }

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        await updateIntegration(id, { status: 'connected' });
      } else {
        await updateIntegration(id, { status: 'error' });
      }
      
      return success;
    } catch (err) {
      await updateIntegration(id, { status: 'error' });
      return false;
    }
  }, [integrations, updateIntegration]);

  // Export data
  const exportData = useCallback(async (format: 'json' | 'csv') => {
    try {
      const exportData = {
        integrations,
        metrics,
        exportDate: new Date(),
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `integrations-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert to CSV (simplified)
        const csvHeaders = ['ID', 'Name', 'Type', 'Status', 'Last Sync'];
        const csvRows = integrations.map(i => [
          i.id,
          i.name,
          i.type,
          i.status,
          i.lastSync?.toISOString() || '',
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `integrations-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to export data');
      console.error('Failed to export data:', err);
    }
  }, [integrations, metrics]);

  // Import data
  const importData = useCallback(async (data: any) => {
    try {
      if (data.integrations && Array.isArray(data.integrations)) {
        await saveIntegrations(data.integrations);
      }
    } catch (err) {
      setError('Failed to import data');
      console.error('Failed to import data:', err);
    }
  }, [saveIntegrations]);

  // Initialize
  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  // Auto sync
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      syncAllIntegrations();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, syncAllIntegrations]);

  // Update metrics when integrations change
  useEffect(() => {
    updateMetrics(integrations);
  }, [integrations, updateMetrics]);

  return {
    integrations,
    metrics,
    isLoading,
    error,
    
    addIntegration,
    removeIntegration,
    updateIntegration,
    syncIntegration,
    syncAllIntegrations,
    
    getIntegration,
    getIntegrationsByType,
    getActiveIntegrations,
    getErrorIntegrations,
    
    testConnection,
    exportData,
    importData,
  };
};

export default useIntegrations;
