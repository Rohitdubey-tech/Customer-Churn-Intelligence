import React, { useState } from 'react';
import { Search, ChevronDown, LifeBuoy, Flower2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ searchVal, onSearchChange }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("CSM");

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Left Logo */}
      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="p-1.5 bg-churnly-600 rounded-lg text-white group-hover:bg-churnly-700 transition-colors shadow-sm">
          <Flower2 className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-xl font-extrabold text-churnly-600 tracking-tight">Churnly</span>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-xl mx-8 relative">
        <input
          type="text"
          value={searchVal || ''}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search account ID or company name..."
          className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-churnly-500 focus:ring-1 focus:ring-churnly-500/50 transition-all font-sans"
        />
        <Search className="w-4 h-4 text-churnly-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-6">
        {/* CSM Role Dropdown */}
        <div className="relative flex items-center gap-1 text-xs font-semibold text-churnly-600 cursor-pointer hover:text-churnly-700">
          <span>{role}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User avatar"
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
          />
          <div className="hidden sm:block text-left">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Welcome</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800">Adam Baker</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-[9px] text-slate-400 font-mono block">ID: 12345678</span>
          </div>
        </div>

        {/* Far Right Solid Red Lifebuoy Block */}
        <div className="h-16 w-14 bg-churnly-600 flex items-center justify-center -mr-6 hover:bg-churnly-700 transition-colors cursor-pointer text-white">
          <LifeBuoy className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
}
