import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Activity, 
  UploadCloud, 
  ShieldCheck, 
  BrainCircuit 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Executive Overview', icon: LayoutDashboard },
    { path: '/customers', label: 'Customer Explorer', icon: Users },
    { path: '/explainability', label: 'Global XAI Engine', icon: Sparkles },
    { path: '/model', label: 'Model Performance', icon: Activity },
    { path: '/batch', label: 'Batch Prediction', icon: UploadCloud },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide">CHURN<span className="text-cyan-400">AI</span> ENGINE</h1>
            <p className="text-[10px] text-slate-400 font-mono">SHAP Force-Plot v1.0</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Analytics & Explanations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Model Spec Badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">LightGBM Model</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-400">TreeExplainer XAI Engine</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Status: Active & Serving
          </div>
        </div>
      </div>
    </aside>
  );
}
