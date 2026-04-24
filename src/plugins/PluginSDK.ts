export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  icon?: string;
}

export interface PluginApi {
  trading: {
    executeTrade: (params: any) => Promise<any>;
    getMarketData: (symbol: string) => Promise<any>;
  };
  analytics: {
    trackEvent: (event: string, data: any) => void;
    getStats: () => Promise<any>;
  };
  ui: {
    showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
    addMenuItem: (item: { label: string; action: () => void }) => void;
  };
  data: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
  };
}

export interface CurrentDaoPlugin {
  metadata: PluginMetadata;
  onLoad: (api: PluginApi) => void;
  onUnload: () => void;
  onUpdate?: (oldVersion: string, newVersion: string) => void;
}

export abstract class PluginBase implements CurrentDaoPlugin {
  abstract metadata: PluginMetadata;
  abstract onLoad(api: PluginApi): void;
  abstract onUnload(): void;
}
