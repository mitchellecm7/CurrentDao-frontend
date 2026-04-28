import React, { useState, useEffect, useCallback } from 'react';

interface Shortcut {
  id: string;
  keys: string;
  description: string;
  category: 'navigation' | 'action' | 'search' | 'help';
  action: () => void;
  customizable?: boolean;
}

interface KeyboardShortcutState {
  shortcuts: Shortcut[];
  isEnabled: boolean;
  isModalOpen: boolean;
}

const STORAGE_KEY = 'keyboard-shortcuts-custom';

const defaultShortcuts: Shortcut[] = [
  // Navigation shortcuts
  {
    id: 'goto-trading',
    keys: 'g+t',
    description: 'Go to Trading',
    category: 'navigation',
    action: () => console.log('Navigate to trading'),
    customizable: true
  },
  {
    id: 'goto-dashboard',
    keys: 'g+d',
    description: 'Go to Dashboard',
    category: 'navigation',
    action: () => console.log('Navigate to dashboard'),
    customizable: true
  },
  {
    id: 'goto-portfolio',
    keys: 'g+p',
    description: 'Go to Portfolio',
    category: 'navigation',
    action: () => console.log('Navigate to portfolio'),
    customizable: true
  },
  {
    id: 'goto-search',
    keys: 'g+s',
    description: 'Go to Search',
    category: 'navigation',
    action: () => console.log('Navigate to search'),
    customizable: true
  },
  
  // Action shortcuts
  {
    id: 'new-trade',
    keys: 'n',
    description: 'New Trade',
    category: 'action',
    action: () => console.log('Create new trade'),
    customizable: true
  },
  {
    id: 'vote',
    keys: 'v',
    description: 'Vote on Proposal',
    category: 'action',
    action: () => console.log('Open voting interface'),
    customizable: true
  },
  {
    id: 'search',
    keys: 's',
    description: 'Quick Search',
    category: 'action',
    action: () => console.log('Focus search input'),
    customizable: true
  },
  {
    id: 'refresh',
    keys: 'r',
    description: 'Refresh Data',
    category: 'action',
    action: () => console.log('Refresh current data'),
    customizable: true
  },
  
  // Help shortcuts
  {
    id: 'help',
    keys: '?',
    description: 'Show Help',
    category: 'help',
    action: () => console.log('Show help modal'),
    customizable: false
  },
  {
    id: 'shortcuts',
    keys: 'ctrl+/',
    description: 'Show Keyboard Shortcuts',
    category: 'help',
    action: () => console.log('Show shortcuts modal'),
    customizable: false
  }
];

export const useKeyboardShortcuts = () => {
  const [state, setState] = useState<KeyboardShortcutState>({
    shortcuts: defaultShortcuts,
    isEnabled: true,
    isModalOpen: false
  });

  // Load custom shortcuts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customShortcuts = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          shortcuts: prev.shortcuts.map(shortcut => {
            const custom = customShortcuts.find((c: any) => c.id === shortcut.id);
            return custom ? { ...shortcut, keys: custom.keys } : shortcut;
          })
        }));
      }
    } catch (error) {
      console.error('Failed to load custom shortcuts:', error);
    }
  }, []);

  // Parse key combination
  const parseKeys = useCallback((event: KeyboardEvent): string => {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    // Add the key itself, but exclude modifier keys that are already handled
    const key = event.key.toLowerCase();
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      parts.push(key);
    }
    
    return parts.join('+');
  }, []);

  // Check if element is input-like
  const isInputElement = useCallback((element: Element | null): boolean => {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const contentEditable = element.getAttribute('contenteditable') === 'true';
    
    return inputTypes.includes(tagName) || contentEditable;
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isEnabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    if (isInputElement(event.target as Element)) return;
    
    const pressedKeys = parseKeys(event);
    
    // Find matching shortcut
    const shortcut = state.shortcuts.find(s => s.keys === pressedKeys);
    
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
      
      // Special handling for shortcuts modal
      if (shortcut.id === 'shortcuts') {
        setState(prev => ({ ...prev, isModalOpen: true }));
      }
    }
    
    // ESC to close modal
    if (event.key === 'Escape' && state.isModalOpen) {
      setState(prev => ({ ...prev, isModalOpen: false }));
    }
  }, [state.isEnabled, state.shortcuts, state.isModalOpen, parseKeys, isInputElement]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Update shortcut
  const updateShortcut = useCallback((shortcutId: string, newKeys: string) => {
    setState(prev => {
      const updatedShortcuts = prev.shortcuts.map(shortcut =>
        shortcut.id === shortcutId ? { ...shortcut, keys: newKeys } : shortcut
      );
      
      // Save to localStorage
      const customShortcuts = updatedShortcuts
        .filter(s => s.customizable)
        .map(({ id, keys }) => ({ id, keys }));
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customShortcuts));
      } catch (error) {
        console.error('Failed to save custom shortcuts:', error);
      }
      
      return { ...prev, shortcuts: updatedShortcuts };
    });
  }, []);

  // Reset shortcuts to defaults
  const resetShortcuts = useCallback(() => {
    setState(prev => ({ ...prev, shortcuts: defaultShortcuts }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Toggle shortcuts
  const toggleShortcuts = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  // Open/close modal
  const openModal = useCallback(() => {
    setState(prev => ({ ...prev, isModalOpen: true }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, isModalOpen: false }));
  }, []);

  return {
    shortcuts: state.shortcuts,
    isEnabled: state.isEnabled,
    isModalOpen: state.isModalOpen,
    updateShortcut,
    resetShortcuts,
    toggleShortcuts,
    openModal,
    closeModal
  };
};
