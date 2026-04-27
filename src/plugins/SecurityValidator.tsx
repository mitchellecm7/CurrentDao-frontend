import React from 'react';
import { PluginMetadata } from './PluginSDK';

interface SecurityValidatorProps {
  plugin: PluginMetadata;
  onAccept: () => void;
  onReject: () => void;
}

const SecurityValidator: React.FC<SecurityValidatorProps> = ({ plugin, onAccept, onReject }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl">
              {plugin.icon || '🧩'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">{plugin.name}</h3>
              <p className="text-blue-100 text-sm">Permission Request</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            This plugin requires the following permissions to function correctly. Please review them carefully before granting access.
          </p>

          <div className="space-y-3">
            {plugin.permissions.map((permission) => (
              <div key={permission} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-slate-200 text-sm font-medium">{permission}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-200 font-medium"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 font-medium shadow-lg shadow-blue-900/20"
            >
              Grant Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityValidator;
