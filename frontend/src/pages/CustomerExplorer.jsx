import React, { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';
import Header from '../components/Header';
import CustomerTable from '../components/CustomerTable';
import { Loader2 } from 'lucide-react';

export default function CustomerExplorer() {
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
  }, [search, riskFilter, segmentFilter, contractFilter, sortBy, order, page]);

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
      <Header
        title="Enterprise Account Explorer"
        subtitle="Search, filter, and drill into individual customer churn risk profiles."
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {loading && data.customers.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-cyan-400 font-mono text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading enterprise customer accounts...</span>
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
      </main>
    </div>
  );
}
