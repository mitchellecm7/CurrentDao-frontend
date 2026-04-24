import { CurrentDaoPlugin, PluginApi } from './PluginSDK';

class PluginLoader {
  private activePlugins: Map<string, CurrentDaoPlugin> = new Map();
  private api: PluginApi;

  constructor(api: PluginApi) {
    this.api = api;
  }

  async loadPlugin(plugin: CurrentDaoPlugin): Promise<void> {
    if (this.activePlugins.has(plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} is already loaded.`);
      return;
    }

    try {
      // In a real scenario, we would validate permissions and sandbox the plugin here
      await plugin.onLoad(this.api);
      this.activePlugins.set(plugin.metadata.id, plugin);
      console.log(`Plugin ${plugin.metadata.name} (${plugin.metadata.id}) loaded successfully.`);
    } catch (error) {
      console.error(`Failed to load plugin ${plugin.metadata.id}:`, error);
      throw error;
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.activePlugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} is not active.`);
      return;
    }

    try {
      await plugin.onUnload();
      this.activePlugins.delete(pluginId);
      console.log(`Plugin ${pluginId} unloaded successfully.`);
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      throw error;
    }
  }

  getActivePlugins(): CurrentDaoPlugin[] {
    return Array.from(this.activePlugins.values());
  }
}

export const createPluginLoader = (api: PluginApi) => new PluginLoader(api);
