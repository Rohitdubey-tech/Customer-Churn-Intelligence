import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RocPrCharts({ rocCurve, prCurve, rocAuc, prAuc }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ROC Curve */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">ROC Curve (Receiver Operating Characteristic)</h3>
          <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-xs font-semibold">
            AUC = {rocAuc}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-2 rounded text-xs font-mono">
                        <p className="text-cyan-400 font-bold">FPR: {pt.fpr}</p>
                        <p className="text-emerald-400">TPR: {pt.tpr}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="tpr" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR Curve */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Precision-Recall Curve</h3>
          <span className="px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-400 font-mono text-xs font-semibold">
            PR-AUC = {prAuc}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="recall" type="number" domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'Recall', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis dataKey="precision" type="number" domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-2 rounded text-xs font-mono">
                        <p className="text-purple-400 font-bold">Recall: {pt.recall}</p>
                        <p className="text-emerald-400">Precision: {pt.precision}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="precision" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
