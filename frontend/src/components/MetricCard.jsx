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
    <div className={`group relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-xl p-5 bg-gradient-to-br ${getColorClasses()} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-700 shadow-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${trend.positive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
