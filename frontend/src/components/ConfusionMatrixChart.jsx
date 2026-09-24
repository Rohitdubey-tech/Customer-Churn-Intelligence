import React from 'react';

export default function ConfusionMatrixChart({ matrix }) {
  if (!matrix || matrix.length < 2) return null;

  const [[tn, fp], [fn, tp]] = matrix;
  const total = tn + fp + fn + tp;

  const cells = [
    { label: "True Negative (Retained)", count: tn, pct: (tn / total) * 100, color: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300" },
    { label: "False Positive (False Alarm)", count: fp, pct: (fp / total) * 100, color: "bg-amber-950/80 border-amber-500/50 text-amber-300" },
    { label: "False Negative (Missed Churn)", count: fn, pct: (fn / total) * 100, color: "bg-rose-950/80 border-rose-500/50 text-rose-300" },
    { label: "True Positive (Caught Churn)", count: tp, pct: (tp / total) * 100, color: "bg-cyan-950/80 border-cyan-500/50 text-cyan-300" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-base font-bold text-white tracking-tight">Confusion Matrix Heatmap</h3>
      <p className="text-xs text-slate-400">Evaluated on held-out test evaluation set ({total} accounts).</p>

      <div className="grid grid-cols-2 gap-4">
        {cells.map((cell, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${cell.color} space-y-1 transition hover:scale-[1.02]`}>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">{cell.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono">{cell.count}</span>
              <span className="text-xs text-slate-400 font-mono">({cell.pct.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
