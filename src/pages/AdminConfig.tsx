import React, { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { Settings, ShieldCheck, Database, Key, Globe, DollarSign } from 'lucide-react';

export const AdminConfig: React.FC = () => {
  const { erpnextUrl, apiKey, apiSecret, storeName, currency, useMock, setConfigs, resetConfigs } = useConfigStore();
  
  const [formState, setFormState] = useState({
    erpnextUrl,
    apiKey,
    apiSecret,
    storeName,
    currency,
    useMock
  });

  const [message, setMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigs(formState);
    setMessage('ERP configuration updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-md space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-2.5 text-indigo-650">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight margin-0 leading-none">ERPNext Configuration</h1>
            <p className="text-xxs font-semibold text-slate-400 mt-1">Configure connections, credentials, and settings.</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl bg-indigo-50/20 border border-indigo-100 p-4.5 flex gap-3 text-xs font-semibold text-indigo-700">
          <Database className="h-5 w-5 shrink-0" />
          <p>
            Toggle <span className="font-extrabold text-indigo-900">Mock Sandbox Mode</span> to instantly browse items, place mock orders, and test coupons without setting up a backend server.
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Toggle Sandbox */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <div className="text-left">
              <label className="text-xs font-extrabold text-slate-800">Mock Sandbox Mode</label>
              <p className="text-xxs font-semibold text-slate-400 mt-0.5">Use local mock data simulation without live APIs.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.useMock}
                onChange={(e) => setFormState({ ...formState, useMock: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Form fields */}
          <div className="space-y-3.5">
            <div>
              <label className="text-xxs font-extrabold text-slate-450 uppercase flex items-center gap-1.5 mb-1">
                <Globe className="h-3.5 w-3.5" /> ERPNext Server URL
              </label>
              <input
                type="url"
                value={formState.erpnextUrl}
                onChange={(e) => setFormState({ ...formState, erpnextUrl: e.target.value })}
                disabled={formState.useMock}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                placeholder="https://your-site.frappe.cloud"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xxs font-extrabold text-slate-450 uppercase flex items-center gap-1.5 mb-1">
                  <Key className="h-3.5 w-3.5" /> API Key
                </label>
                <input
                  type="text"
                  value={formState.apiKey}
                  onChange={(e) => setFormState({ ...formState, apiKey: e.target.value })}
                  disabled={formState.useMock}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  placeholder="e.g. 5d8e7cfa029d10c"
                />
              </div>

              <div>
                <label className="text-xxs font-extrabold text-slate-450 uppercase flex items-center gap-1.5 mb-1">
                  <Key className="h-3.5 w-3.5" /> API Secret
                </label>
                <input
                  type="password"
                  value={formState.apiSecret}
                  onChange={(e) => setFormState({ ...formState, apiSecret: e.target.value })}
                  disabled={formState.useMock}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xxs font-extrabold text-slate-450 uppercase mb-1 block">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={formState.storeName}
                  onChange={(e) => setFormState({ ...formState, storeName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  placeholder="ERP Retail Hub"
                  required
                />
              </div>

              <div>
                <label className="text-xxs font-extrabold text-slate-450 uppercase mb-1 block">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formState.currency}
                  onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  placeholder="$"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>

          {message && <p className="text-xxs font-bold text-emerald-600 px-1">{message}</p>}

          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="rounded-2xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold px-6 py-2.5 transition-colors shadow-md shadow-indigo-150"
            >
              Save Configuration
            </button>
            <button
              type="button"
              onClick={() => {
                resetConfigs();
                setFormState({
                  erpnextUrl: 'https://demo.erpnext.com',
                  apiKey: '',
                  apiSecret: '',
                  storeName: 'ERP Retail Hub',
                  currency: '$',
                  useMock: true
                });
              }}
              className="rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold px-5 py-2.5 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
