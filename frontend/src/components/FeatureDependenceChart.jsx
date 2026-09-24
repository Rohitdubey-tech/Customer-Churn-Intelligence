import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getFeatureDependence } from '../services/api';
import { LineChart, Loader2 } from 'lucide-react';

export default function FeatureDependenceChart({ featureName, availableFeatures = [] }) {
  const [selectedFeature, setSelectedFeature] = useState(featureName || 'nps_score');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (featureName) {
      setSelectedFeature(featureName);
    }
  }, [featureName]);

  useEffect(() => {
    if (!selectedFeature) return;
    const fetchDependence = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getFeatureDependence(selectedFeature);
        setData(res);
      } catch (err) {
        setError("Failed to load feature dependence analysis.");
      } finally {
        setLoading(false);
      }
    };
    fetchDependence();
  }, [selectedFeature]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <LineChart className="w-4 h-4 text-cyan-400" />
            Feature SHAP Dependence Plot
          </h3>
          <p className="text-xs text-slate-400">
            Examine how changing feature values non-linearly affects SHAP churn risk contributions.
          </p>
        </div>

        {/* Feature Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Select Feature:</label>
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-cyan-500"
          >
            {availableFeatures.length > 0 ? (
              availableFeatures.map(f => (
                <option key={f} value={f}>{f.replace(/_/g, ' ').toUpperCase()}</option>
              ))
            ) : (
              <>
                <option value="nps_score">NPS SCORE</option>
                <option value="monthly_charges">MONTHLY CHARGES</option>
                <option value="tenure_months">TENURE MONTHS</option>
                <option value="support_tickets_30d">SUPPORT TICKETS 30D</option>
                <option value="feature_usage_score">FEATURE USAGE SCORE</option>
                <option value="account_health_index">ACCOUNT HEALTH INDEX</option>
              </>
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-72 flex items-center justify-center text-cyan-400 font-mono text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Computing feature dependence matrix...</span>
        </div>
      ) : error ? (
        <div className="h-72 flex items-center justify-center text-rose-400 text-xs font-mono">
          {error}
        </div>
      ) : data && data.dependence_data ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="feature_value"
                name={data.display_name}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                unit=""
              />
              <YAxis
                type="number"
                dataKey="shap_value"
                name="SHAP Value"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                unit=""
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono">
                        <p className="text-white font-bold">{data.display_name}: {pt.feature_value}</p>
                        <p className="text-rose-400 mt-1">SHAP Impact: {pt.shap_value > 0 ? `+${pt.shap_value}` : pt.shap_value}</p>
                        <p className="text-cyan-400">Churn Prob: {(pt.churn_probability * 100).toFixed(1)}%</p>
                        <p className="text-slate-400 text-[10px] mt-1">Segment: {pt.segment}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name={data.display_name}
                data={data.dependence_data}
                fill="#06b6d4"
                opacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
