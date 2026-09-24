import React from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import { Search, ArrowUpDown, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerTable({
  customers = [],
  totalRecords = 0,
  totalPages = 1,
  currentPage = 1,
  search = "",
  riskFilter = "",
  segmentFilter = "",
  contractFilter = "",
  sortBy = "churn_probability",
  order = "desc",
  onSearchChange,
  onRiskChange,
  onSegmentChange,
  onContractChange,
  onSortChange,
  onPageChange
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-4 transition-all duration-300">
      {/* Controls Bar: Search & Filters */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Account ID or Company Name..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => onRiskChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-cyan-500 font-mono transition-colors cursor-pointer"
          >
            <option value="">Risk: ALL</option>
            <option value="CRITICAL">CRITICAL (80-100%)</option>
            <option value="HIGH">HIGH (60-80%)</option>
            <option value="MEDIUM">MEDIUM (30-60%)</option>
            <option value="LOW">LOW (0-30%)</option>
          </select>

          {/* Segment Filter */}
          <select
            value={segmentFilter}
            onChange={(e) => onSegmentChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-cyan-500 font-mono transition-colors cursor-pointer"
          >
            <option value="">Segment: ALL</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="SMB">SMB</option>
          </select>

          {/* Contract Filter */}
          <select
            value={contractFilter}
            onChange={(e) => onContractChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-cyan-500 font-mono transition-colors cursor-pointer"
          >
            <option value="">Contract: ALL</option>
            <option value="Month-to-Month">Month-to-Month</option>
            <option value="1-Year Fixed">1-Year Fixed</option>
            <option value="2-Year Fixed">2-Year Fixed</option>
            <option value="3-Year Enterprise">3-Year Enterprise</option>
          </select>

          {/* Sorting Button */}
          <button
            onClick={() => onSortChange(sortBy, order === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-700/80 hover:border-cyan-500/60 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortBy.replace(/_/g, ' ').toUpperCase()} ({order.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Account ID</th>
              <th className="py-3 px-4">Company Name</th>
              <th className="py-3 px-4">Segment</th>
              <th className="py-3 px-4">Contract</th>
              <th className="py-3 px-4">Tenure</th>
              <th className="py-3 px-4">Monthly Spend</th>
              <th className="py-3 px-4">Support Tickets</th>
              <th className="py-3 px-4">Churn Probability</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-slate-500 font-mono">
                  No customer records matched your query filters.
                </td>
              </tr>
            ) : (
              customers.map((cust) => {
                const probPct = (cust.churn_probability * 100).toFixed(1);

                return (
                  <tr
                    key={cust.account_id}
                    onClick={() => navigate(`/customers/${cust.account_id}`)}
                    className="hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400 group-hover:text-cyan-300">
                      {cust.account_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {cust.company_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {cust.customer_segment}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {cust.contract_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {cust.tenure_months} mos
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      ${cust.monthly_charges?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {cust.support_tickets_30d}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              cust.churn_probability > 0.6 ? 'bg-rose-500' : cust.churn_probability > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${probPct}%` }}
                          ></div>
                        </div>
                        <span>{probPct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={cust.risk_level} showIcon={false} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${cust.account_id}`);
                        }}
                        className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/80 hover:border-cyan-500 text-cyan-400 text-[11px] font-mono rounded-lg transition-all duration-200 active:scale-95 inline-flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-cyan-950/50"
                      >
                        Explain <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>
          Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({totalRecords} records)
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded font-semibold text-white">
            {currentPage}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
