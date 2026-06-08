import React from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { Settings, Database, Globe, DollarSign, Layout } from 'lucide-react';

export const AdminConfig: React.FC = () => {
  const { erpnextUrl, storeName, currency, useMock } = useConfigStore();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-md space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-2.5 text-indigo-650">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight margin-0 leading-none">System Configuration</h1>
            <p className="text-xxs font-semibold text-slate-400 mt-1">Deployment settings and environment configuration.</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl bg-indigo-50/20 border border-indigo-100 p-4.5 flex gap-3 text-xs font-semibold text-indigo-700">
          <Database className="h-5 w-5 shrink-0" />
          <p>
            These settings are read-only at runtime. To change these configurations, edit the <code className="font-mono bg-indigo-550/10 px-1 py-0.5 rounded text-indigo-900">store.config.ts</code> configuration file and rebuild the application.
          </p>
        </div>

        {/* Status / Mode */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <div className="text-left">
            <span className="text-xs font-extrabold text-slate-800">Environment Mode</span>
            <p className="text-xxs font-semibold text-slate-400 mt-0.5">
              {useMock ? 'Using local mock data simulation.' : 'Connected to live ERPNext server.'}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${useMock ? 'bg-amber-100 text-amber-850' : 'bg-emerald-100 text-emerald-850'}`}>
            {useMock ? 'Sandbox (Mock)' : 'Production (Live)'}
          </span>
        </div>

        {/* Fields Display */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 p-4 space-y-3.5">
            <div>
              <span className="text-xxs font-extrabold text-slate-450 uppercase flex items-center gap-1.5 mb-1">
                <Globe className="h-3.5 w-3.5" /> ERPNext Server URL
              </span>
              <div className="text-xs font-semibold text-slate-700 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 font-mono">
                {erpnextUrl}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <span className="text-xxs font-extrabold text-slate-450 uppercase flex items-center gap-1.5 mb-1">
                  <Layout className="h-3.5 w-3.5" /> Store Display Name
                </span>
                <div className="text-xs font-semibold text-slate-700 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                  {storeName}
                </div>
              </div>

              <div>
                <span className="text-xxs font-extrabold text-slate-450 uppercase flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5" /> Currency Symbol
                </span>
                <div className="text-xs font-semibold text-slate-700 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                  {currency}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
