import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Activity, 
  UploadCloud, 
  ShieldCheck, 
  Flower2
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 z-30 shadow-sm">
      <div>
        {/* Sub Brand Info */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="p-2 bg-churnly-50 rounded-lg text-churnly-600 border border-churnly-100">
            <Flower2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-xs text-slate-800 tracking-wide uppercase">PORTFOLIO CHURN</h1>
            <p className="text-[10px] text-slate-400 font-mono">SHAP TreeExplainer</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation Directory
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-churnly-600 text-white shadow-md shadow-churnly-600/30 translate-x-1'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-1'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Model Spec Badge */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs transition-all duration-200 hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-bold text-slate-800">LightGBM Model</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-500">XAI TreeExplainer v1.0</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Status: Serving Active
          </div>
        </div>
      </div>
    </aside>
  );
}
