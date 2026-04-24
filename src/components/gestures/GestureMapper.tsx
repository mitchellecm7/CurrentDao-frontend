/**
 * Gesture Mapper Component
 * Provides custom gesture mapping for user preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, RotateCcw, Play, X, Plus, Trash2 } from 'lucide-react';
import { GestureRecognitionService, GestureEvent } from '../../services/gestures/gesture-recognition';
import { HapticFeedbackService } from '../../services/gestures/haptic-feedback';
import { GestureAccessibilityService } from '../../utils/gestures/accessibility';

interface GestureMapping {
  id: string;
  name: string;
  gestureType: 'swipe' | 'pinch' | 'tap' | 'longpress' | 'pull';
  gestureDirection?: 'up' | 'down' | 'left' | 'right';
  action: string;
  actionType: 'navigation' | 'function' | 'custom';
  enabled: boolean;
  hapticFeedback: boolean;
  voiceCommand?: string;
}

interface GestureMapperProps {
  onMappingChange?: (mappings: GestureMapping[]) => void;
  enabled?: boolean;
  showHints?: boolean;
  className?: string;
}

const DEFAULT_MAPPINGS: GestureMapping[] = [
  {
    id: '1',
    name: 'Navigate Back',
    gestureType: 'swipe',
    gestureDirection: 'right',
    action: 'goBack',
    actionType: 'navigation',
    enabled: true,
    hapticFeedback: true,
    voiceCommand: 'go back'
  },
  {
    id: '2',
    name: 'Navigate Forward',
    gestureType: 'swipe',
    gestureDirection: 'left',
    action: 'goForward',
    actionType: 'navigation',
    enabled: true,
    hapticFeedback: true,
    voiceCommand: 'go forward'
  },
  {
    id: '3',
    name: 'Refresh Content',
    gestureType: 'pull',
    action: 'refresh',
    actionType: 'function',
    enabled: true,
    hapticFeedback: true,
    voiceCommand: 'refresh'
  },
  {
    id: '4',
    name: 'Zoom In',
    gestureType: 'pinch',
    action: 'zoomIn',
    actionType: 'function',
    enabled: true,
    hapticFeedback: true,
    voiceCommand: 'zoom in'
  },
  {
    id: '5',
    name: 'Select Item',
    gestureType: 'tap',
    action: 'select',
    actionType: 'function',
    enabled: true,
    hapticFeedback: true,
    voiceCommand: 'select'
  }
];

const AVAILABLE_ACTIONS = [
  { value: 'goBack', label: 'Go Back', type: 'navigation' },
  { value: 'goForward', label: 'Go Forward', type: 'navigation' },
  { value: 'goUp', label: 'Go Up', type: 'navigation' },
  { value: 'goDown', label: 'Go Down', type: 'navigation' },
  { value: 'refresh', label: 'Refresh', type: 'function' },
  { value: 'zoomIn', label: 'Zoom In', type: 'function' },
  { value: 'zoomOut', label: 'Zoom Out', type: 'function' },
  { value: 'select', label: 'Select', type: 'function' },
  { value: 'menu', label: 'Open Menu', type: 'function' },
  { value: 'close', label: 'Close', type: 'function' },
  { value: 'share', label: 'Share', type: 'function' },
  { value: 'favorite', label: 'Add to Favorites', type: 'function' }
];

export const GestureMapper: React.FC<GestureMapperProps> = ({
  onMappingChange,
  enabled = true,
  showHints = true,
  className = ''
}) => {
  const [mappings, setMappings] = useState<GestureMapping[]>(DEFAULT_MAPPINGS);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMapping, setRecordingMapping] = useState<GestureMapping | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<GestureEvent | null>(null);
  const [editingMapping, setEditingMapping] = useState<GestureMapping | null>(null);
  
  const gestureService = useRef(GestureRecognitionService.getInstance());
  const hapticService = useRef(HapticFeedbackService.getInstance());
  const accessibilityService = useRef(GestureAccessibilityService.getInstance());
  const cleanupGesture = useRef<(() => void) | null>(null);

  // Load saved mappings
  useEffect(() => {
    const saved = localStorage.getItem('gesture-mappings');
    if (saved) {
      try {
        const parsedMappings = JSON.parse(saved);
        setMappings(parsedMappings);
      } catch (error) {
        console.warn('Failed to load gesture mappings:', error);
      }
    }
  }, []);

  // Save mappings when they change
  useEffect(() => {
    localStorage.setItem('gesture-mappings', JSON.stringify(mappings));
    onMappingChange?.(mappings);
  }, [mappings, onMappingChange]);

  // Handle gesture recording
  const startRecording = useCallback((mapping: GestureMapping) => {
    setIsRecording(true);
    setRecordingMapping(mapping);
    setDetectedGesture(null);
    
    if (cleanupGesture.current) {
      cleanupGesture.current();
    }
    
    const element = document.body;
    cleanupGesture.current = gestureService.current.startTracking(element, (gesture) => {
      setDetectedGesture(gesture);
      if (gesture.type === mapping.gestureType) {
        if (mapping.gestureDirection && gesture.direction !== mapping.gestureDirection) {
          return;
        }
        stopRecording();
      }
    });
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingMapping(null);
    if (cleanupGesture.current) {
      cleanupGesture.current();
      cleanupGesture.current = null;
    }
  }, []);

  // Add new mapping
  const addMapping = useCallback(() => {
    const newMapping: GestureMapping = {
      id: Date.now().toString(),
      name: 'New Gesture',
      gestureType: 'tap',
      action: 'select',
      actionType: 'function',
      enabled: true,
      hapticFeedback: true
    };
    setMappings([...mappings, newMapping]);
    setEditingMapping(newMapping);
  }, [mappings]);

  // Update mapping
  const updateMapping = useCallback((id: string, updates: Partial<GestureMapping>) => {
    setMappings(mappings.map(mapping => 
      mapping.id === id ? { ...mapping, ...updates } : mapping
    ));
  }, [mappings]);

  // Delete mapping
  const deleteMapping = useCallback((id: string) => {
    setMappings(mappings.filter(mapping => mapping.id !== id));
  }, [mappings]);

  // Execute mapped action
  const executeAction = useCallback(async (mapping: GestureMapping) => {
    if (!mapping.enabled) return;

    if (mapping.hapticFeedback) {
      await hapticService.current.onGestureSuccess();
    }

    accessibilityService.current.announceGesture(mapping.gestureType, true);

    // Execute the action (this would be connected to your app's action dispatcher)
    console.log('Executing action:', mapping.action);
    
    // Example action execution
    switch (mapping.action) {
      case 'goBack':
        window.history.back();
        break;
      case 'goForward':
        window.history.forward();
        break;
      case 'refresh':
        window.location.reload();
        break;
      case 'zoomIn':
        // Dispatch zoom in event
        document.dispatchEvent(new CustomEvent('gesture-zoom-in'));
        break;
      case 'zoomOut':
        // Dispatch zoom out event
        document.dispatchEvent(new CustomEvent('gesture-zoom-out'));
        break;
      default:
        // Dispatch custom gesture event
        document.dispatchEvent(new CustomEvent('gesture-action', { 
          detail: { action: mapping.action } 
        }));
    }
  }, []);

  // Setup global gesture listener
  useEffect(() => {
    if (!enabled) return;

    const element = document.body;
    const cleanup = gestureService.current.startTracking(element, async (gesture) => {
      // Find matching mapping
      const matchingMapping = mappings.find(mapping => {
        if (!mapping.enabled || mapping.gestureType !== gesture.type) {
          return false;
        }
        
        if (mapping.gestureDirection && gesture.direction !== mapping.gestureDirection) {
          return false;
        }
        
        return true;
      });

      if (matchingMapping) {
        await executeAction(matchingMapping);
      }
    });

    return cleanup;
  }, [enabled, mappings, executeAction]);

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50"
        aria-label="Gesture settings"
      >
        <Settings size={20} />
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Gesture Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close settings"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Add New Mapping */}
              <button
                onClick={addMapping}
                className="w-full mb-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>Add New Gesture</span>
              </button>

              {/* Gesture Mappings List */}
              <div className="space-y-4">
                {mappings.map((mapping) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{mapping.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingMapping(mapping)}
                          className="p-1 hover:bg-gray-200 rounded"
                          aria-label="Edit mapping"
                        >
                          <Settings size={16} />
                        </button>
                        <button
                          onClick={() => deleteMapping(mapping.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-500"
                          aria-label="Delete mapping"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {mapping.gestureType}
                      {mapping.gestureDirection && ` ${mapping.gestureDirection}`}
                      {' → '}
                      {AVAILABLE_ACTIONS.find(a => a.value === mapping.action)?.label || mapping.action}
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={mapping.enabled}
                          onChange={(e) => updateMapping(mapping.id, { enabled: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Enabled</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={mapping.hapticFeedback}
                          onChange={(e) => updateMapping(mapping.id, { hapticFeedback: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Haptic</span>
                      </label>

                      <button
                        onClick={() => startRecording(mapping)}
                        disabled={isRecording}
                        className={`px-3 py-1 rounded text-sm ${
                          isRecording 
                            ? 'bg-red-500 text-white' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isRecording ? 'Recording...' : 'Test'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Reset to Defaults */}
              <button
                onClick={() => {
                  setMappings(DEFAULT_MAPPINGS);
                  hapticService.current.onGestureSuccess();
                }}
                className="w-full mt-6 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center justify-center space-x-2"
              >
                <RotateCcw size={16} />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </motion.div>
              <span className="text-sm">Recording gesture...</span>
              <button
                onClick={stopRecording}
                className="ml-2 text-white hover:text-gray-200"
                aria-label="Stop recording"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Mapping Modal */}
      <AnimatePresence>
        {editingMapping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg p-6 w-96 max-w-full mx-4"
            >
              <h3 className="text-lg font-bold mb-4">Edit Gesture Mapping</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingMapping.name}
                    onChange={(e) => setEditingMapping({ ...editingMapping, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gesture Type
                  </label>
                  <select
                    value={editingMapping.gestureType}
                    onChange={(e) => setEditingMapping({ 
                      ...editingMapping, 
                      gestureType: e.target.value as GestureMapping['gestureType'] 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="tap">Tap</option>
                    <option value="swipe">Swipe</option>
                    <option value="pinch">Pinch</option>
                    <option value="longpress">Long Press</option>
                    <option value="pull">Pull</option>
                  </select>
                </div>

                {editingMapping.gestureType === 'swipe' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Direction
                    </label>
                    <select
                      value={editingMapping.gestureDirection || 'up'}
                      onChange={(e) => setEditingMapping({ 
                        ...editingMapping, 
                        gestureDirection: e.target.value as GestureMapping['gestureDirection'] 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="up">Up</option>
                      <option value="down">Down</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <select
                    value={editingMapping.action}
                    onChange={(e) => {
                      const action = AVAILABLE_ACTIONS.find(a => a.value === e.target.value);
                      setEditingMapping({ 
                        ...editingMapping, 
                        action: e.target.value,
                        actionType: action?.type as 'navigation' | 'function'
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {AVAILABLE_ACTIONS.map(action => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    updateMapping(editingMapping.id, editingMapping);
                    setEditingMapping(null);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingMapping(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestureMapper;
