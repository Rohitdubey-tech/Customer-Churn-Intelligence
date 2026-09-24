import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

export default function RiskBadge({ level, showIcon = true, className = "" }) {
  const getBadgeStyle = () => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
          dot: 'bg-rose-500',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/80 border-orange-500/50 text-orange-300',
          dot: 'bg-orange-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          dot: 'bg-amber-500',
          icon: <Info className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${className}`}>
      {showIcon && style.icon}
      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: 'currentColor' }}></span>
      {level?.toUpperCase() || 'UNKNOWN'}
    </span>
  );
}
