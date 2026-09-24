import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, ScatterChart } from 'lucide-react';

export default function GlobalSHAPChart({ globalData, onSelectFeature }) {
  const [viewMode, setViewMode] = useState('bar'); // 'bar' or 'beeswarm'

  if (!globalData || !globalData.global_importance) return null;

  const chartData = globalData.global_importance.slice(0, 12).map((item) => ({
    feature: item.display_name,
    raw_feature: item.feature,
    importance: item.mean_abs_shap,
  }));

  const beeswarmData = globalData.beeswarm_data || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Global Model Feature Importance (SHAP Summary)
          </h3>
          <p className="text-xs text-slate-400">
            Average absolute SHAP value impact across all enterprise accounts. Click any feature to explore its dependence plot.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              viewMode === 'bar' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode('beeswarm')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              viewMode === 'beeswarm' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SHAP Summary Distribution
          </button>
        </div>
      </div>

      {viewMode === 'bar' ? (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="feature"
                type="category"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                width={140}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono">
                        <p className="text-white font-bold">{data.feature}</p>
                        <p className="text-cyan-400 mt-1">Mean |SHAP|: {data.importance.toFixed(4)}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Click to view feature dependence</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="importance"
                fill="#06b6d4"
                radius={[0, 4, 4, 0]}
                onClick={(entry) => onSelectFeature && onSelectFeature(entry.raw_feature)}
                className="cursor-pointer hover:opacity-80 transition"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Each point represents a customer account. Color represents feature value (High = Rose/Red, Low = Cyan/Blue).
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto custom-scrollbar">
            <div className="space-y-3 min-w-[600px]">
              {chartData.slice(0, 10).map((item) => {
                const points = beeswarmData.filter(p => p.feature === item.raw_feature);
                return (
                  <div
                    key={item.raw_feature}
                    onClick={() => onSelectFeature && onSelectFeature(item.raw_feature)}
                    className="flex items-center gap-4 hover:bg-slate-900/80 p-2 rounded-lg cursor-pointer transition border border-transparent hover:border-slate-800"
                  >
                    <span className="w-36 text-xs font-semibold text-slate-300 truncate" title={item.feature}>
                      {item.feature}
                    </span>
                    <div className="flex-1 relative h-6 bg-slate-900/60 rounded flex items-center px-2">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700"></div>
                      {points.map((pt, idx) => {
                        const leftPct = Math.min(95, Math.max(5, 50 + (pt.shap_value * 120)));
                        const colorHex = pt.normalized_value > 0.5 ? '#f43f5e' : '#06b6d4';
                        return (
                          <div
                            key={idx}
                            className="absolute w-2 h-2 rounded-full opacity-70 hover:opacity-100 hover:scale-150 transition transform"
                            style={{
                              left: `${leftPct}%`,
                              backgroundColor: colorHex,
                            }}
                            title={`Account: ${pt.account_id} | Val: ${pt.feature_value} | SHAP: ${pt.shap_value}`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span className="text-cyan-400">Low Feature Value</span>
              <span>← Reduces Risk | Increases Risk →</span>
              <span className="text-rose-400">High Feature Value</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
