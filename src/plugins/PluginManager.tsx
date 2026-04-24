import React from 'react';
import { usePluginSystem } from '../hooks/usePluginSystem';

const PluginManager: React.FC = () => {
  const { activePlugins, unloadPlugin } = usePluginSystem();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Plugin Manager</h1>
          <p className="text-slate-400 mt-1">Manage your active extensions and integrations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 font-medium">
          Install New
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activePlugins.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/50">
            <div className="text-4xl mb-4">🧩</div>
            <h3 className="text-xl font-semibold text-white">No active plugins</h3>
            <p className="text-slate-400 mt-2">Visit the marketplace to discover and install plugins.</p>
          </div>
        ) : (
          activePlugins.map((plugin) => (
            <div
              key={plugin.metadata.id}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-2xl border border-white/5">
                  {plugin.metadata.icon || '🧩'}
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    v{plugin.metadata.version}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {plugin.metadata.name}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                {plugin.metadata.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex gap-1">
                  {plugin.metadata.permissions.slice(0, 2).map((p) => (
                    <span key={p} className="h-1.5 w-1.5 rounded-full bg-blue-500" title={p} />
                  ))}
                  {plugin.metadata.permissions.length > 2 && (
                    <span className="text-[10px] text-slate-500 font-medium">+{plugin.metadata.permissions.length - 2}</span>
                  )}
                </div>
                <button
                  onClick={() => unloadPlugin(plugin.metadata.id)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors py-1 px-2 rounded-md hover:bg-rose-500/10"
                >
                  Unload
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PluginManager;
