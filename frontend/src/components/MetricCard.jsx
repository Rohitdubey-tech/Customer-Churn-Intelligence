import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = "cyan" }) {
  const getColorClasses = () => {
    switch (color) {
      case 'rose':
        return 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400 group-hover:border-rose-500/40';
      case 'amber':
        return 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400 group-hover:border-amber-500/40';
      case 'emerald':
        return 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40';
      case 'purple':
        return 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400 group-hover:border-purple-500/40';
      case 'cyan':
      default:
        return 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40';
    }
  };

  return (
    <div className={`group relative overflow-hidden bg-white border border-slate-200 rounded-xl p-4 sm:p-5 bg-gradient-to-br ${getColorClasses()} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 shadow-sm flex flex-col justify-between`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors truncate">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
            <Icon className="w-4 h-4 text-churnly-600" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5 flex-wrap overflow-hidden">
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 font-mono truncate">{value}</span>
        {trend && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${trend.positive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-[11px] text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
}
