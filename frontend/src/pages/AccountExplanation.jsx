import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerExplanation, getCustomers } from '../services/api';
import Header from '../components/Header';
import SHAPForcePlot from '../components/SHAPForcePlot';
import { 
  Building2, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Users, 
  Headphones, 
  Search, 
  Loader2, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AccountExplanation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [accountId, setAccountId] = useState(id || "AC-1001");
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick account search dropdown list
  const [quickSearch, setQuickSearch] = useState("");
  const [quickList, setQuickList] = useState([]);

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

  // Fetch quick accounts for search input
  useEffect(() => {
    if (quickSearch.length >= 2) {
      getCustomers({ search: quickSearch, limit: 5 }).then(res => {
        setQuickList(res.customers || []);
      });
    } else {
      setQuickList([]);
    }
  }, [quickSearch]);

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
      <Header
        title={`Account Churn Intelligence: ${accountId}`}
        subtitle="Transparent individual explanation powered by SHAP TreeExplainer."
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Account Selector Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Select Enterprise Account:</span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search Account ID (e.g. AC-1029)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:ring-1 focus:ring-cyan-500"
            />

            {quickList.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 divide-y divide-slate-800 max-h-60 overflow-y-auto font-mono text-xs">
                {quickList.map(item => (
                  <div
                    key={item.account_id}
                    onClick={() => {
                      setQuickSearch("");
                      setQuickList([]);
                      navigate(`/customers/${item.account_id}`);
                    }}
                    className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-bold text-cyan-400">{item.account_id}</span>
                    <span className="text-white truncate max-w-[140px]">{item.company_name}</span>
                    <span className="text-slate-400 text-[10px]">{(item.churn_probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-cyan-400 font-mono text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Calculating SHAP feature attribution matrix for account {accountId}...</span>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-rose-900/50 p-8 rounded-xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Account Not Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => navigate('/customers')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition"
            >
              Back to Customer Explorer
            </button>
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* SHAP Force Plot Component */}
            <SHAPForcePlot explanation={explanation} />

            {/* Raw Customer Profile Attributes Cards */}
            {explanation.raw_attributes && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Account Operational & Usage Snapshot
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Industry</span>
                    <span className="text-slate-200 font-semibold truncate block">{explanation.raw_attributes.industry}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Segment</span>
                    <span className="text-slate-200 font-semibold truncate block">{explanation.raw_attributes.customer_segment}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Contract</span>
                    <span className="text-slate-200 font-semibold truncate block">{explanation.raw_attributes.contract_type}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Tenure</span>
                    <span className="text-slate-200 font-semibold truncate block">{explanation.raw_attributes.tenure_months} months</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Monthly Spend</span>
                    <span className="text-cyan-400 font-bold truncate block">${explanation.raw_attributes.monthly_charges?.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Support Tickets</span>
                    <span className="text-slate-200 font-semibold truncate block">{explanation.raw_attributes.support_tickets_30d} tickets</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">SLA Breaches</span>
                    <span className="text-rose-400 font-semibold truncate block">{explanation.raw_attributes.sla_breaches_90d} breaches</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">NPS Score</span>
                    <span className="text-amber-400 font-bold truncate block">{explanation.raw_attributes.nps_score} / 10</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Engagement</span>
                    <span className="text-teal-400 font-semibold truncate block">{explanation.raw_attributes.engagement_score} / 100</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Health Index</span>
                    <span className="text-purple-400 font-semibold truncate block">{explanation.raw_attributes.account_health_index}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
