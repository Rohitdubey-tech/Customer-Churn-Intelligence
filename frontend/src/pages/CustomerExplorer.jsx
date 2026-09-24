import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import CustomerTable from '../components/CustomerTable';
import { Loader2, UploadCloud, FileSpreadsheet } from 'lucide-react';

export default function CustomerExplorer() {
  const navigate = useNavigate();
  const { user, isDemo, customDataset } = useAuth();
  const [data, setData] = useState({ customers: [], total_records: 0, total_pages: 1, current_page: 1 });
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("");
  const [sortBy, setSortBy] = useState("churn_probability");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const fetchCustomerData = async () => {
    setLoading(true);

    if (!isDemo && !customDataset) {
      // Custom mode without uploaded dataset
      setData({ customers: [], total_records: 0, total_pages: 1, current_page: 1 });
      setLoading(false);
      return;
    }

    if (!isDemo && customDataset) {
      // Custom mode with uploaded dataset
      let items = [...(customDataset.results || [])];
      
      // Filter & search
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(i => 
          (i.account_id && i.account_id.toLowerCase().includes(q)) ||
          (i.company_name && i.company_name.toLowerCase().includes(q))
        );
      }
      if (riskFilter) {
        items = items.filter(i => i.risk_level === riskFilter);
      }
      if (segmentFilter) {
        items = items.filter(i => i.customer_segment === segmentFilter);
      }
      if (contractFilter) {
        items = items.filter(i => i.contract_type === contractFilter);
      }

      // Sort
      items.sort((a, b) => {
        const valA = a[sortBy] || 0;
        const valB = b[sortBy] || 0;
        return order === 'desc' ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
      });

      const limit = 15;
      const totalRecs = items.length;
      const totalPgs = Math.max(1, Math.ceil(totalRecs / limit));
      const currPage = Math.max(1, Math.min(page, totalPgs));
      const pagedItems = items.slice((currPage - 1) * limit, currPage * limit);

      setData({
        customers: pagedItems,
        total_records: totalRecs,
        total_pages: totalPgs,
        current_page: currPage
      });
      setLoading(false);
      return;
    }

    // Demo mode: fetch pre-loaded sample dataset
    try {
      const res = await getCustomers({
        search,
        risk_level: riskFilter,
        segment: segmentFilter,
        contract_type: contractFilter,
        sort_by: sortBy,
        order,
        page,
        limit: 15
      });
      setData(res);
    } catch (err) {
      console.error("Failed to fetch customer directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [search, riskFilter, segmentFilter, contractFilter, sortBy, order, page, isDemo, customDataset]);

  return (
    <div className="flex-1 bg-slate-100 flex flex-col min-w-0 min-h-screen">
      <Header
        searchVal={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Custom Empty Mode Prompt */}
        {!isDemo && !customDataset ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-md text-center max-w-2xl mx-auto space-y-5 my-8">
            <div className="w-16 h-16 bg-churnly-50 border border-churnly-200 rounded-2xl flex items-center justify-center mx-auto text-churnly-600 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold font-mono px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full inline-block">
                CUSTOM WORKSPACE ACTIVE ({user?.email})
              </span>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Directory Empty</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                No customer accounts found in custom workspace. Upload your CSV dataset to populate the customer explorer directory and generate account predictions.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => navigate('/batch')}
                className="btn-churnly shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload CSV Dataset Now</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Account Explorer</h2>
                <p className="text-xs text-slate-500">Search, filter, and drill into individual customer churn risk profiles.</p>
              </div>
            </div>

            {loading ? (
              <div className="h-96 flex items-center justify-center text-churnly-600 font-mono text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading customer directory...</span>
              </div>
            ) : (
              <CustomerTable
                customers={data.customers}
                totalRecords={data.total_records}
                totalPages={data.total_pages}
                currentPage={data.current_page}
                search={search}
                riskFilter={riskFilter}
                segmentFilter={segmentFilter}
                contractFilter={contractFilter}
                sortBy={sortBy}
                order={order}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                onRiskChange={(val) => { setRiskFilter(val); setPage(1); }}
                onSegmentChange={(val) => { setSegmentFilter(val); setPage(1); }}
                onContractChange={(val) => { setContractFilter(val); setPage(1); }}
                onSortChange={(field, ord) => { setSortBy(field); setOrder(ord); }}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
