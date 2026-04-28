import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, ChevronDown, ChevronRight, ExternalLink, BookOpen } from 'lucide-react';

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  category: 'feature' | 'bugfix' | 'improvement' | 'security';
  entries: {
    title: string;
    description: string;
    deepLink?: string;
  }[];
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVersion?: string;
}

const sampleChangelogData: ChangelogEntry[] = [
  {
    id: 'v2.1.0',
    version: '2.1.0',
    date: '2024-04-28',
    title: 'Enhanced PWA Experience & Carbon Tracking',
    description: 'Major improvements to Progressive Web App functionality and new carbon credit integration.',
    category: 'feature',
    entries: [
      {
        title: 'Custom PWA Install Banner',
        description: 'Beautiful custom install prompt with dismiss and remind later options',
        deepLink: '/pwa-install'
      },
      {
        title: 'App Icons & Splash Screen',
        description: 'Properly sized icons for all devices and branded splash screen',
        deepLink: '/pwa-icons'
      },
      {
        title: 'Carbon Credit Integration',
        description: 'Track and offset your carbon footprint with certified carbon credits',
        deepLink: '/carbon-credits'
      },
      {
        title: 'Keyboard Shortcuts',
        description: 'Power user navigation with customizable keyboard shortcuts',
        deepLink: '/keyboard-shortcuts'
      }
    ]
  },
  {
    id: 'v2.0.5',
    version: '2.0.5',
    date: '2024-04-15',
    title: 'Performance & Stability Updates',
    description: 'Improved map performance and bug fixes for regional market data.',
    category: 'improvement',
    entries: [
      {
        title: 'Map Clustering Optimization',
        description: 'Reduced memory usage for large datasets with 1000+ markers'
      },
      {
        title: 'Regional Market Data Sync',
        description: 'Fixed synchronization issues with real-time market updates'
      },
      {
        title: 'Mobile Responsiveness',
        description: 'Better touch interactions and mobile layout improvements'
      }
    ]
  },
  {
    id: 'v2.0.4',
    version: '2.0.4',
    date: '2024-04-01',
    title: 'Critical Bug Fixes',
    description: 'Important security updates and bug fixes for production stability.',
    category: 'bugfix',
    entries: [
      {
        title: 'Security Patch',
        description: 'Fixed potential XSS vulnerability in search component'
      },
      {
        title: 'Location Permission Fix',
        description: 'Resolved issues with geolocation permissions on iOS devices'
      },
      {
        title: 'Distance Calculation Accuracy',
        description: 'Improved precision for long-distance energy trade calculations'
      }
    ]
  },
  {
    id: 'v2.0.0',
    version: '2.0.0',
    date: '2024-03-15',
    title: 'Platform Redesign',
    description: 'Complete redesign of the energy trading platform with new features.',
    category: 'feature',
    entries: [
      {
        title: 'Interactive Map Integration',
        description: 'Real-time energy trading visualization with clustering',
        deepLink: '/interactive-map'
      },
      {
        title: 'Regional Market Analysis',
        description: 'Comprehensive market data by geographic region',
        deepLink: '/regional-markets'
      },
      {
        title: 'Advanced Search System',
        description: 'AI-powered search across all platform data',
        deepLink: '/advanced-search'
      },
      {
        title: 'Heat Map Visualization',
        description: 'Trading activity heat maps for market insights',
        deepLink: '/heat-maps'
      }
    ]
  }
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  initialVersion
}) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastSeenVersion, setLastSeenVersion] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('changelog-last-seen');
    if (stored) {
      setLastSeenVersion(stored);
    }
    
    if (initialVersion) {
      setExpandedVersions(new Set([initialVersion]));
    } else {
      // Auto-expand latest version
      setExpandedVersions(new Set([sampleChangelogData[0].id]));
    }
  }, [initialVersion]);

  const toggleVersion = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  const markAsRead = () => {
    const latestVersion = sampleChangelogData[0].version;
    localStorage.setItem('changelog-last-seen', latestVersion);
    setLastSeenVersion(latestVersion);
    onClose();
  };

  const getCategoryColor = (category: ChangelogEntry['category']) => {
    switch (category) {
      case 'feature': return 'bg-green-100 text-green-800 border-green-200';
      case 'bugfix': return 'bg-red-100 text-red-800 border-red-200';
      case 'improvement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'security': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: ChangelogEntry['category']) => {
    switch (category) {
      case 'feature': return '✨';
      case 'bugfix': return '🐛';
      case 'improvement': return '🚀';
      case 'security': return '🔒';
      default: return '📝';
    }
  };

  const filteredChangelog = selectedCategory === 'all' 
    ? sampleChangelogData 
    : sampleChangelogData.filter(entry => entry.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Changes', icon: '📋' },
    { value: 'feature', label: 'New Features', icon: '✨' },
    { value: 'bugfix', label: 'Bug Fixes', icon: '🐛' },
    { value: 'improvement', label: 'Improvements', icon: '🚀' },
    { value: 'security', label: 'Security', icon: '🔒' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">What's New</h2>
              <p className="text-sm text-gray-600">Stay updated with the latest features and improvements</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAsRead}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark as Read
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Changelog Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredChangelog.map(entry => (
              <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Version Header */}
                <button
                  onClick={() => toggleVersion(entry.id)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-3">
                    {expandedVersions.has(entry.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">v{entry.version}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                          {getCategoryIcon(entry.category)} {entry.category}
                        </span>
                        {lastSeenVersion && entry.version > lastSeenVersion && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="font-medium text-gray-900">{entry.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedVersions.has(entry.id) && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="space-y-3">
                      {entry.entries.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            {item.deepLink && (
                              <a
                                href={item.deepLink}
                                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                              >
                                <span>Learn more</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{sampleChangelogData.length}</span> releases total
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <a href="/rss/changelog" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                <Tag className="w-4 h-4" />
                <span>RSS Feed</span>
              </a>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
