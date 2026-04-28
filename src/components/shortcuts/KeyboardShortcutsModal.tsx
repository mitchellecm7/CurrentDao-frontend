import React, { useState, useEffect } from 'react';
import { X, Keyboard, Navigation, Plus, Vote, Search, Settings, HelpCircle, Edit } from 'lucide-react';

interface Shortcut {
  id: string;
  keys: string;
  description: string;
  category: 'navigation' | 'action' | 'search' | 'help';
  action: () => void;
  customizable?: boolean;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
  onShortcutUpdate?: (shortcutId: string, newKeys: string) => void;
}

const defaultShortcuts: Shortcut[] = [
  // Navigation shortcuts
  {
    id: 'goto-trading',
    keys: 'g+t',
    description: 'Go to Trading',
    category: 'navigation',
    action: () => console.log('Navigate to trading')
  },
  {
    id: 'goto-dashboard',
    keys: 'g+d',
    description: 'Go to Dashboard',
    category: 'navigation',
    action: () => console.log('Navigate to dashboard')
  },
  {
    id: 'goto-portfolio',
    keys: 'g+p',
    description: 'Go to Portfolio',
    category: 'navigation',
    action: () => console.log('Navigate to portfolio')
  },
  {
    id: 'goto-search',
    keys: 'g+s',
    description: 'Go to Search',
    category: 'navigation',
    action: () => console.log('Navigate to search')
  },
  
  // Action shortcuts
  {
    id: 'new-trade',
    keys: 'n',
    description: 'New Trade',
    category: 'action',
    action: () => console.log('Create new trade')
  },
  {
    id: 'vote',
    keys: 'v',
    description: 'Vote on Proposal',
    category: 'action',
    action: () => console.log('Open voting interface')
  },
  {
    id: 'search',
    keys: 's',
    description: 'Quick Search',
    category: 'action',
    action: () => console.log('Focus search input')
  },
  {
    id: 'refresh',
    keys: 'r',
    description: 'Refresh Data',
    category: 'action',
    action: () => console.log('Refresh current data')
  },
  
  // Help shortcuts
  {
    id: 'help',
    keys: '?',
    description: 'Show Help',
    category: 'help',
    action: () => console.log('Show help modal')
  },
  {
    id: 'shortcuts',
    keys: 'ctrl+/',
    description: 'Show Keyboard Shortcuts',
    category: 'help',
    action: () => console.log('Show shortcuts modal')
  }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = defaultShortcuts,
  onShortcutUpdate
}) => {
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [tempKeys, setTempKeys] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Shortcuts', icon: Keyboard },
    { value: 'navigation', label: 'Navigation', icon: Navigation },
    { value: 'action', label: 'Actions', icon: Plus },
    { value: 'search', label: 'Search', icon: Search },
    { value: 'help', label: 'Help', icon: HelpCircle }
  ];

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditShortcut = (shortcutId: string, currentKeys: string) => {
    setEditingShortcut(shortcutId);
    setTempKeys(currentKeys);
  };

  const handleSaveShortcut = (shortcutId: string) => {
    if (onShortcutUpdate && tempKeys.trim()) {
      onShortcutUpdate(shortcutId, tempKeys.trim());
    }
    setEditingShortcut(null);
    setTempKeys('');
  };

  const handleCancelEdit = () => {
    setEditingShortcut(null);
    setTempKeys('');
  };

  const formatKeys = (keys: string) => {
    return keys.split('+').map(key => 
      key.trim().toUpperCase()
    ).join(' + ');
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categories.find(cat => cat.value === category)?.icon || Keyboard;
    return <IconComponent className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Keyboard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600">Power user navigation and actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  selectedCategory === category.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-3 h-3" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredShortcuts.map(shortcut => (
              <div key={shortcut.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="text-purple-600">
                    {getCategoryIcon(shortcut.category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{shortcut.description}</h4>
                    <p className="text-sm text-gray-500 capitalize">{shortcut.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {editingShortcut === shortcut.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tempKeys}
                        onChange={(e) => setTempKeys(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., ctrl+shift+n"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveShortcut(shortcut.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                        {formatKeys(shortcut.keys)}
                      </kbd>
                      {shortcut.customizable && (
                        <button
                          onClick={() => handleEditShortcut(shortcut.id, shortcut.keys)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Keyboard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No shortcuts found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{filteredShortcuts.length}</span> shortcuts
            </div>
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">ESC</kbd> to close</span>
              <span>Shortcuts work globally except when typing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
