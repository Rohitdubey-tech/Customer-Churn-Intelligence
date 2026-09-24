import React, { useState, useEffect } from 'react';
import { getExecutiveAnalytics } from '../services/api';
import MetricCard from '../components/MetricCard';
import Header from '../components/Header';
import { 
  Users, 
  AlertTriangle, 
  Percent, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart3, 
  Briefcase, 
  FileText,
  Loader2
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-screen text-cyan-400 font-mono text-sm gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading Executive Churn Intelligence Dashboard...</span>
      </div>
    );
  }

  if (!data) return null;

  const RISK_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  };

  const riskPieData = data.risk_distribution.map(r => ({
    name: r.risk_level,
    value: r.count,
    percentage: r.percentage,
    color: RISK_COLORS[r.risk_level] || '#06b6d4'
  }));

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
      <Header
        title="Customer Churn Intelligence"
        subtitle="Predict, understand, and act on account churn risk."
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
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
            subtitle="High Churn Probability"
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

        {/* Charts Row 1: Risk Category Distribution & Churn by Customer Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Category Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Account Risk Distribution Breakdown
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-2.5 rounded text-xs font-mono">
                            <p className="font-bold text-white">{pt.name} RISK</p>
                            <p className="text-slate-300">{pt.value} Accounts ({pt.percentage}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              {riskPieData.map(r => (
                <div key={r.name} className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }}></span>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{r.name}</span>
                    <span className="text-white font-bold">{r.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Churn Rate by Customer Segment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Predicted Churn Rate by Customer Segment
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.segment_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="segment" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded text-xs font-mono">
                            <p className="font-bold text-white">{pt.segment}</p>
                            <p className="text-cyan-400">Churn Rate: {(pt.churn_rate * 100).toFixed(1)}%</p>
                            <p className="text-slate-400">Total Accounts: {pt.total_accounts}</p>
                            <p className="text-rose-400">Predicted Churners: {pt.predicted_churn}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="churn_rate" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Churn by Contract Type & Churn by Industry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Churn by Contract Type */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Churn Rate by Contract Commitment
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.contract_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="contract_type" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded text-xs font-mono">
                            <p className="font-bold text-white">{pt.contract_type}</p>
                            <p className="text-purple-400">Churn Rate: {(pt.churn_rate * 100).toFixed(1)}%</p>
                            <p className="text-slate-400">Accounts: {pt.total_accounts}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="churn_rate" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Churn by Industry */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Industry Vertical Churn Index
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.industry_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="industry" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded text-xs font-mono">
                            <p className="font-bold text-white">{pt.industry}</p>
                            <p className="text-emerald-400">Churn Rate: {(pt.churn_rate * 100).toFixed(1)}%</p>
                            <p className="text-slate-400">Accounts: {pt.total_accounts}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="churn_rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
