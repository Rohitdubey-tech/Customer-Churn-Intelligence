import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, LifeBuoy, Flower2, User, Settings, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../services/api';

export default function Header({ searchVal, onSearchChange }) {
  const navigate = useNavigate();

  // Interactive Search State
  const [internalSearch, setInternalSearch] = useState(searchVal || "");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Dropdown States
  const [role, setRole] = useState("CSM");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const roleRef = useRef(null);
  const userRef = useRef(null);

  // Handle live search suggestions
  useEffect(() => {
    const val = onSearchChange ? searchVal : internalSearch;
    if (val && val.length >= 2) {
      getCustomers({ search: val, limit: 5 }).then(res => {
        setSearchResults(res.customers || []);
        setShowDropdown(true);
      }).catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [internalSearch, searchVal, onSearchChange]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      const query = onSearchChange ? searchVal : internalSearch;
      if (query) {
        setShowDropdown(false);
        navigate(`/customers?search=${encodeURIComponent(query)}`);
      }
    }
  };

  const roles = [
    { code: "CSM", label: "CSM (Customer Success)" },
    { code: "AE", label: "Account Executive" },
    { code: "VP", label: "VP Customer Revenue" },
    { code: "RA", label: "Risk & Churn Analyst" }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Left Logo */}
      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="p-1.5 bg-churnly-600 rounded-lg text-white group-hover:bg-churnly-700 transition-colors shadow-sm">
          <Flower2 className="w-5 h-5" />
        </div>
        <span className="text-lg font-extrabold text-churnly-600 tracking-tight">Customer Churn Intelligence</span>
      </div>

      {/* Center Search Input with Instant Dropdown */}
      <div ref={searchRef} className="flex-1 max-w-xl mx-6 relative">
        <div className="relative">
          <input
            type="text"
            value={onSearchChange ? searchVal : internalSearch}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              else setInternalSearch(e.target.value);
            }}
            onKeyDown={handleSearchSubmit}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search account ID or company name (Press Enter to search)..."
            className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-churnly-500 focus:ring-1 focus:ring-churnly-500/50 transition-all font-sans"
          />
          <Search 
            onClick={() => {
              const query = onSearchChange ? searchVal : internalSearch;
              if (query) navigate(`/customers?search=${encodeURIComponent(query)}`);
            }}
            className="w-4 h-4 text-churnly-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform" 
          />
        </div>

        {/* Live Search Suggestions Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 divide-y divide-slate-100 font-sans text-xs overflow-hidden">
            <div className="p-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Matching Accounts ({searchResults.length})
            </div>
            {searchResults.map((item) => (
              <div
                key={item.account_id}
                onClick={() => {
                  setShowDropdown(false);
                  navigate(`/customers/${item.account_id}`);
                }}
                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-churnly-600 bg-churnly-50 px-1.5 py-0.5 rounded border border-churnly-100">
                    {item.account_id}
                  </span>
                  <span className="font-semibold text-slate-800">{item.company_name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">{item.customer_segment}</span>
                  <span className="font-bold text-churnly-600">{(item.churn_probability * 100).toFixed(1)}% risk</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-5">
        {/* CSM Role Dropdown Menu */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-semibold text-churnly-600 hover:text-churnly-700 transition-all cursor-pointer"
          >
            <span>{role}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 divide-y divide-slate-100 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Role View</div>
              <div className="py-1">
                {roles.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => {
                      setRole(r.code);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      role === r.code ? 'bg-churnly-50 text-churnly-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r.label}</span>
                    {role === r.code && <span className="w-1.5 h-1.5 rounded-full bg-churnly-600"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 rounded-xl transition-colors cursor-pointer text-left"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
            />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800">Adam Baker</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-[9px] text-slate-400 font-mono block">ID: 12345678</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">Adam Baker</p>
                <p className="text-[11px] text-slate-400">adam.baker@churnintelligence.ai</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/customers'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Directory</span>
              </button>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/model'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Model Metrics</span>
              </button>
              <button
                onClick={() => { setShowUserMenu(false); alert("Preferences saved."); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferences</span>
              </button>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => { setShowUserMenu(false); alert("Logged out."); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Far Right Solid Red Action Block */}
        <div 
          onClick={() => alert("Customer Churn Intelligence Support & XAI Documentation opened.")}
          className="h-16 w-14 bg-churnly-600 flex items-center justify-center -mr-6 hover:bg-churnly-700 transition-colors cursor-pointer text-white shadow-sm"
          title="Support & Documentation"
        >
          <LifeBuoy className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
}
