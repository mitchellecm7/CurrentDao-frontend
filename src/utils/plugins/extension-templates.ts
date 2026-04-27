export const PLUGIN_TEMPLATES = {
  TRADING_BOT: {
    name: 'New Trading Bot',
    description: 'A template for creating a new automated trading bot.',
    permissions: ['trading.executeTrade', 'trading.getMarketData'],
    code: `
export default class MyTradingBot extends PluginBase {
  metadata = {
    id: 'my-trading-bot',
    name: 'My Trading Bot',
    version: '1.0.0',
    description: 'Custom trading bot implementation',
    author: 'Developer',
    permissions: ['trading.executeTrade', 'trading.getMarketData']
  };

  onLoad(api) {
    console.log('Bot started');
    this.interval = setInterval(async () => {
      const data = await api.trading.getMarketData('XLM/USDC');
      if (data.price < 0.1) {
        await api.trading.executeTrade({ side: 'buy', amount: 100 });
      }
    }, 60000);
  }

  onUnload() {
    clearInterval(this.interval);
    console.log('Bot stopped');
  }
}
    `
  },
  ANALYTICS_DASHBOARD: {
    name: 'Analytics Module',
    description: 'Template for custom analytics and data visualization.',
    permissions: ['analytics.trackEvent', 'analytics.getStats', 'data.get'],
    code: `
export default class MyAnalyticsModule extends PluginBase {
  metadata = {
    id: 'my-analytics',
    name: 'My Analytics',
    version: '1.0.0',
    description: 'Custom analytics dashboard',
    author: 'Developer',
    permissions: ['analytics.trackEvent', 'analytics.getStats', 'data.get']
  };

  onLoad(api) {
    api.ui.addMenuItem({
      label: 'My Stats',
      action: () => api.analytics.getStats().then(stats => api.ui.showNotification(JSON.stringify(stats), 'info'))
    });
  }

  onUnload() {
    console.log('Analytics module unloaded');
  }
}
    `
  }
};
