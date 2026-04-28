import { ChangelogEntry } from '../../components/changelog/ChangelogModal';

export class ChangelogService {
  private static readonly STORAGE_KEY = 'changelog-last-seen';
  private static readonly VERSION_KEY = 'app-version';

  // Sample changelog data - in production this would come from an API
  private static readonly CHANGELOG_DATA: ChangelogEntry[] = [
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

  static getChangelog(): ChangelogEntry[] {
    return this.CHANGELOG_DATA;
  }

  static getLatestVersion(): string {
    return this.CHANGELOG_DATA[0]?.version || '1.0.0';
  }

  static getUnseenChanges(): ChangelogEntry[] {
    const lastSeen = this.getLastSeenVersion();
    if (!lastSeen) return this.CHANGELOG_DATA;
    
    return this.CHANGELOG_DATA.filter(entry => entry.version > lastSeen);
  }

  static markAsRead(version?: string): void {
    const versionToMark = version || this.getLatestVersion();
    localStorage.setItem(this.STORAGE_KEY, versionToMark);
  }

  static getLastSeenVersion(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  static shouldShowChangelog(): boolean {
    const currentVersion = this.getCurrentAppVersion();
    const lastSeen = this.getLastSeenVersion();
    
    // Show changelog if app version has changed or if no version has been seen
    return currentVersion !== lastSeen || !lastSeen;
  }

  static getCurrentAppVersion(): string {
    // In a real app, this would come from package.json or build process
    return localStorage.getItem(this.VERSION_KEY) || this.getLatestVersion();
  }

  static setCurrentAppVersion(version: string): void {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  static generateRSSFeed(): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://currentdao.example.com';
    const currentDate = new Date().toUTCString();

    const rssItems = this.CHANGELOG_DATA.map(entry => {
      const pubDate = new Date(entry.date).toUTCString();
      const category = this.getCategoryLabel(entry.category);
      
      return `    <item>
      <title>CurrentDAO v${entry.version}: ${entry.title}</title>
      <link>${baseUrl}/changelog#${entry.id}</link>
      <description>${entry.description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${entry.id}</guid>
      <category>${category}</category>
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CurrentDAO Changelog</title>
    <link>${baseUrl}/changelog</link>
    <description>Latest updates and features for the CurrentDAO energy trading platform</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss/changelog" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;
  }

  private static getCategoryLabel(category: ChangelogEntry['category']): string {
    switch (category) {
      case 'feature': return 'New Features';
      case 'bugfix': return 'Bug Fixes';
      case 'improvement': return 'Improvements';
      case 'security': return 'Security';
      default: return 'General';
    }
  }

  static exportToJSON(): string {
    return JSON.stringify(this.CHANGELOG_DATA, null, 2);
  }

  static exportToMarkdown(): string {
    const markdown = this.CHANGELOG_DATA.map(entry => {
      const categoryEmoji = this.getCategoryEmoji(entry.category);
      const entries = entry.entries.map(item => 
        `- **${item.title}**: ${item.description}${item.deepLink ? ` [→](${item.deepLink})` : ''}`
      ).join('\n');

      return `## v${entry.version} - ${new Date(entry.date).toLocaleDateString()} ${categoryEmoji}

**${entry.title}**

${entry.description}

### Changes

${entries}

---`;
    }).join('\n\n');

    return `# CurrentDAO Changelog

All notable changes to the CurrentDAO energy trading platform will be documented in this file.

${markdown}`;
  }

  private static getCategoryEmoji(category: ChangelogEntry['category']): string {
    switch (category) {
      case 'feature': return '✨';
      case 'bugfix': return '🐛';
      case 'improvement': return '🚀';
      case 'security': return '🔒';
      default: return '📝';
    }
  }
}
