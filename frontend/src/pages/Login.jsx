import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flower2, Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Database, UploadCloud } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { loginDemo, loginCustom } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/');
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }
    loginCustom(email, name || email.split('@')[0]);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 selection:bg-churnly-600 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-churnly-600 rounded-2xl text-white shadow-lg shadow-churnly-600/30 mb-2">
            <Flower2 className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Churn Intelligence</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explainable AI (XAI) churn risk scoring engine powered by LightGBM & SHAP TreeExplainer.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Quick Demo Login Option */}
          <div className="bg-churnly-50 border border-churnly-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-churnly-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-churnly-600" />
                Explore Demo Environment
              </span>
              <span className="text-[10px] font-mono font-bold bg-churnly-200 text-churnly-800 px-2 py-0.5 rounded">
                SAMPLE DATA READY
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Instant one-click access with 1,500 pre-loaded enterprise accounts, pre-computed SHAP TreeExplainer attributions, and Executive Overview reports.
            </p>
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-churnly-600 hover:bg-churnly-700 text-white font-bold text-xs rounded-lg transition-all duration-200 shadow-md shadow-churnly-600/30 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Try Demo Account (Pre-loaded Data)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">OR Sign In With Custom Account</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Custom Email Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@enterprise.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:border-churnly-500 focus:ring-1 focus:ring-churnly-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Full Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-churnly-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:border-churnly-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <UploadCloud className="w-3.5 h-3.5 text-churnly-600" />
                Custom Email Workspace Behavior:
              </div>
              <p>
                Signing in with a custom email starts with a <strong className="text-slate-800">Clean Empty Workspace</strong>. Upload your CSV dataset to instantly generate customized LightGBM predictions and SHAP reports.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Empty Workspace</span>
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-400 font-mono">
          Customer Churn Intelligence Platform v1.0 • Enterprise Ready
        </div>
      </div>
    </div>
  );
}
