import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExecutiveAnalytics } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import { 
  Users, 
  AlertTriangle, 
  Percent, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart3, 
  UploadCloud, 
  FileSpreadsheet,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function ExecutiveOverview() {
  const navigate = useNavigate();
  const { user, isDemo, customDataset } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!isDemo && !customDataset) {
        // Custom user with no uploaded dataset yet
        setData(null);
        setLoading(false);
        return;
      }

      if (!isDemo && customDataset) {
        // Custom user has uploaded a dataset
        setData(customDataset.analytics || null);
        setLoading(false);
        return;
      }

      // Demo mode: fetch pre-loaded backend sample dataset analytics
      try {
        const res = await getExecutiveAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load executive overview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isDemo, customDataset]);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center min-h-screen text-churnly-600 font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading Executive Intelligence Dashboard...</span>
      </div>
    );
  }

  const RISK_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#dc2626'
  };

  const riskPieData = data ? data.risk_distribution.map(r => ({
    name: r.risk_level,
    value: r.count,
    percentage: r.percentage,
    color: RISK_COLORS[r.risk_level] || '#dc2626'
  })) : [];

  return (
    <div className="flex-1 bg-slate-100 flex flex-col min-w-0 min-h-screen">
      <Header />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Custom User Empty Workspace State */}
        {!isDemo && !customDataset && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-md text-center max-w-2xl mx-auto space-y-5 my-8">
            <div className="w-16 h-16 bg-churnly-50 border border-churnly-200 rounded-2xl flex items-center justify-center mx-auto text-churnly-600 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold font-mono px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full inline-block">
                CUSTOM WORKSPACE ACTIVE ({user?.email})
              </span>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">No Customer Dataset Uploaded Yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You are signed in with a custom account. Upload your enterprise customer CSV dataset to compute LightGBM predictions, generate risk distribution metrics, and construct SHAP explanation reports.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/batch')}
                className="btn-churnly shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload CSV Dataset Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Reports Rendered for Demo Mode or Custom Uploaded Dataset */}
        {(isDemo || customDataset) && data && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Executive Churn Overview</h2>
                <p className="text-xs text-slate-500">Predict, understand, and act on account churn risk across your portfolio.</p>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard
                title="Total Accounts"
                value={data.total_accounts?.toLocaleString()}
                subtitle="Monitored Accounts"
                icon={Users}
                color="cyan"
              />
              <MetricCard
                title="Predicted Churners"
                value={data.predicted_churners?.toLocaleString()}
                subtitle="High Churn Risk"
                icon={AlertTriangle}
                color="rose"
              />
              <MetricCard
                title="Overall Churn Rate"
                value={`${(data.churn_rate * 100).toFixed(1)}%`}
                subtitle="LightGBM Predicted"
                icon={Percent}
                color="amber"
              />
              <MetricCard
                title="High & Critical Risk"
                value={data.high_risk_count?.toLocaleString()}
                subtitle="Requires Intervention"
                icon={AlertTriangle}
                color="rose"
              />
              <MetricCard
                title="Avg Churn Prob"
                value={`${(data.average_churn_probability * 100).toFixed(1)}%`}
                subtitle="Across Portfolio"
                icon={Percent}
                color="purple"
              />
              <MetricCard
                title="Revenue at Risk"
                value={`$${(data.revenue_at_risk_annual / 1000).toFixed(1)}k`}
                subtitle="Annualized ARR Impact"
                icon={DollarSign}
                color="rose"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-churnly-600" />
                  Account Risk Category Distribution
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const pt = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-2.5 rounded text-xs font-mono shadow-md">
                                <p className="font-bold">{pt.name} RISK</p>
                                <p>{pt.value} Accounts ({pt.percentage}%)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                  {riskPieData.map(r => (
                    <div key={r.name} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }}></span>
                      <div>
                        <span className="text-slate-500 block text-[10px]">{r.name}</span>
                        <span className="text-slate-800 font-bold">{r.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-churnly-600" />
                  Predicted Churn Rate by Customer Segment
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.segment_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="segment" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const pt = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded text-xs font-mono shadow-md">
                                <p className="font-bold">{pt.segment}</p>
                                <p className="text-churnly-400">Churn Rate: {(pt.churn_rate * 100).toFixed(1)}%</p>
                                <p className="text-slate-300">Total Accounts: {pt.total_accounts}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="churn_rate" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
