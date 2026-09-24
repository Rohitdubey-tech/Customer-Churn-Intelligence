import React, { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import { Activity, RefreshCw, Cpu, Clock } from 'lucide-react';

export default function Header({ title = "Executive Overview", subtitle }) {
  const [healthy, setHealthy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await getHealth();
      setHealthy(res.status === 'healthy');
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      setHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* API Health Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-slate-300">{healthy ? 'API: ONLINE' : 'API: OFFLINE'}</span>
        </div>

        {/* Model Specs */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>LightGBM v4.7</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={checkHealth}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/60"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
