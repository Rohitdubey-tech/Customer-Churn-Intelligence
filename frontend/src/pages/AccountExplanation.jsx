import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerExplanation, getCustomers } from '../services/api';
import Header from '../components/Header';
import SHAPForcePlot from '../components/SHAPForcePlot';
import GaugeCard from '../components/GaugeCard';
import { 
  Search, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AccountExplanation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [accountId, setAccountId] = useState(id || "AC-1001");
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time filter for trend chart: 'WEEK', '3 M', '6 M', '12 M'
  const [timeFilter, setTimeFilter] = useState("12 M");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (id) {
      setAccountId(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCustomerExplanation(accountId, 12);
        setExplanation(res);
      } catch (err) {
        setError(err.response?.data?.message || `Account '${accountId}' not found.`);
      } finally {
        setLoading(false);
      }
    };
    fetchExplanation();
  }, [accountId]);

  const probPercent = explanation ? Math.round(explanation.churn_probability * 100) : 85;

  // Dynamic Historical Trend Generator based on Time Filter & Account Probability
  const getHistoricalTrendData = (filter, currentRisk) => {
    const scale = currentRisk / 85; // Scale relative to account churn probability

    switch (filter) {
      case 'WEEK':
        return [
          { month: 'MON', churn: Math.min(99, Math.max(10, Math.round(55 * scale))) },
          { month: 'TUE', churn: Math.min(99, Math.max(10, Math.round(58 * scale))) },
          { month: 'WED', churn: Math.min(99, Math.max(10, Math.round(62 * scale))) },
          { month: 'THU', churn: Math.min(99, Math.max(10, Math.round(71 * scale))) },
          { month: 'FRI', churn: Math.min(99, Math.max(10, Math.round(79 * scale))) },
          { month: 'SAT', churn: Math.min(99, Math.max(10, Math.round(83 * scale))) },
          { month: 'SUN', churn: Math.min(99, Math.max(10, Math.round(currentRisk))) },
        ];
      case '3 M':
        return [
          { month: 'Month 1', churn: Math.min(99, Math.max(10, Math.round(45 * scale))) },
          { month: 'Month 2', churn: Math.min(99, Math.max(10, Math.round(68 * scale))) },
          { month: 'Month 3', churn: Math.min(99, Math.max(10, Math.round(currentRisk))) },
        ];
      case '6 M':
        return [
          { month: 'JUL', churn: Math.min(99, Math.max(10, Math.round(65 * scale))) },
          { month: 'AUG', churn: Math.min(99, Math.max(10, Math.round(52 * scale))) },
          { month: 'SEP', churn: Math.min(99, Math.max(10, Math.round(44 * scale))) },
          { month: 'OCT', churn: Math.min(99, Math.max(10, Math.round(59 * scale))) },
          { month: 'NOV', churn: Math.min(99, Math.max(10, Math.round(72 * scale))) },
          { month: 'DEC', churn: Math.min(99, Math.max(10, Math.round(currentRisk))) },
        ];
      case '12 M':
      default:
        return [
          { month: 'JAN', churn: Math.min(99, Math.max(10, Math.round(38 * scale))) },
          { month: 'FEB', churn: Math.min(99, Math.max(10, Math.round(52 * scale))) },
          { month: 'MAR', churn: Math.min(99, Math.max(10, Math.round(53 * scale))) },
          { month: 'APR', churn: Math.min(99, Math.max(10, Math.round(54 * scale))) },
          { month: 'MAY', churn: Math.min(99, Math.max(10, Math.round(63 * scale))) },
          { month: 'JUN', churn: Math.min(99, Math.max(10, Math.round(76 * scale))) },
          { month: 'JUL', churn: Math.min(99, Math.max(10, Math.round(65 * scale))) },
          { month: 'AUG', churn: Math.min(99, Math.max(10, Math.round(52 * scale))) },
          { month: 'SEP', churn: Math.min(99, Math.max(10, Math.round(44 * scale))) },
          { month: 'OCT', churn: Math.min(99, Math.max(10, Math.round(41 * scale))) },
          { month: 'NOV', churn: Math.min(99, Math.max(10, Math.round(39 * scale))) },
          { month: 'DEC', churn: Math.min(99, Math.max(10, Math.round(currentRisk))) },
        ];
    }
  };

  const currentTrendData = getHistoricalTrendData(timeFilter, probPercent);

  return (
    <div className="flex-1 bg-slate-100 flex flex-col min-w-0 min-h-screen">
      {/* Top Header */}
      <Header
        searchVal={searchQuery}
        onSearchChange={(val) => setSearchQuery(val)}
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/customers')}>Allocation stage</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Predictions results page</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-bold text-churnly-600">Customer profile: {accountId}</span>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-churnly-600 font-mono text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading customer profile and SHAP TreeExplainer matrix...</span>
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-200 p-8 rounded-xl text-center space-y-3 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Account Not Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => navigate('/customers')}
              className="btn-churnly mx-auto"
            >
              Back to Customer Explorer
            </button>
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* HERO SECTION SPLIT: Red Churn Score Box + Historical Churn Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Solid Red Highlight Box */}
              <div className="lg:col-span-4 bg-churnly-600 text-white rounded-xl p-6 shadow-md flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold flex items-center gap-1">
                      Churn likelihood: <strong className="font-bold">{probPercent}%</strong>
                    </span>
                    <ChevronDown className="w-4 h-4 text-white/80 cursor-pointer" />
                  </div>

                  {/* Giant Stat Display */}
                  <div className="mt-4 text-6xl font-extrabold font-sans tracking-tight">
                    {probPercent}%
                  </div>
                </div>

                {/* Account Details List */}
                <div className="space-y-2 text-xs border-t border-white/20 pt-4 font-sans">
                  <div className="flex justify-between">
                    <span className="text-white/70">Unique ID:</span>
                    <span className="font-bold font-mono">{explanation.account_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Stage:</span>
                    <span className="font-semibold">{explanation.raw_attributes?.customer_segment || 'Allocation'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Sign-up date:</span>
                    <span className="font-mono">13/5/2018</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Renewal date:</span>
                    <span className="font-mono">19/5/2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Allotted licenses:</span>
                    <span className="font-mono">{explanation.raw_attributes?.contract_licenses || 200}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Customer value:</span>
                    <span className="font-bold font-mono">${(explanation.raw_attributes?.monthly_charges * 12 / 1000 || 50).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Industry:</span>
                    <span className="font-semibold">{explanation.raw_attributes?.industry || 'Tech'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Industry Churn:</span>
                    <span className="font-bold font-mono">33%</span>
                  </div>
                </div>
              </div>

              {/* Right Main Historical Churn Chart */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">Historical Churn Trend</h3>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-churnly-50 text-churnly-700 border border-churnly-200">
                      FILTER: {timeFilter}
                    </span>
                  </div>

                  {/* Time Range Filter Pills */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                    {['WEEK', '3 M', '6 M', '12 M'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeFilter(t)}
                        className={`px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                          timeFilter === t
                            ? 'bg-churnly-600 text-white shadow-sm font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Red Line Chart Dynamic rendering */}
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const pt = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-2.5 rounded shadow-md text-xs font-mono">
                                <p className="font-bold text-churnly-400">{pt.month}</p>
                                <p>Historical Risk: {pt.churn}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="churn"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#dc2626' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: 3 SEMI-CIRCLE GAUGE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GaugeCard
                title="Login"
                percentage={Math.min(99, Math.max(10, Math.round(66 * (probPercent / 85))))}
                todayVal={`${Math.min(99, Math.max(10, Math.round(66 * (probPercent / 85))))}%`}
                avgVal="60%"
                agoVal="40%"
                cycleVal="80%"
                predictionVal={`${probPercent}%`}
              />
              <GaugeCard
                title="Payments"
                percentage={Math.min(99, Math.max(10, Math.round(74 * (probPercent / 85))))}
                todayVal={`${Math.min(99, Math.max(10, Math.round(74 * (probPercent / 85))))}%`}
                avgVal="30%"
                agoVal="30%"
                cycleVal="90%"
                predictionVal={`${probPercent}%`}
              />
              <GaugeCard
                title="Renewals"
                percentage={probPercent}
                todayVal={`${100 - probPercent}%`}
                avgVal="10%"
                agoVal="80%"
                cycleVal="60%"
                predictionVal={`${probPercent}%`}
              />
            </div>

            {/* BOTTOM ROW: SHAP Force Plot Component */}
            <SHAPForcePlot explanation={explanation} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
