import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGlobalExplainability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import GlobalSHAPChart from '../components/GlobalSHAPChart';
import FeatureDependenceChart from '../components/FeatureDependenceChart';
import { Sparkles, Loader2, UploadCloud, FileSpreadsheet } from 'lucide-react';

export default function GlobalExplanation() {
  const navigate = useNavigate();
  const { user, isDemo, customDataset } = useAuth();
  const [globalData, setGlobalData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('nps_score');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!isDemo && !customDataset) {
        setGlobalData(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getGlobalExplainability();
        setGlobalData(res);
        if (res.available_features && res.available_features.length > 0) {
          setSelectedFeature(res.available_features[0]);
        }
      } catch (err) {
        console.error("Failed to load global XAI:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isDemo, customDataset]);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center min-h-screen text-churnly-600 font-mono text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Computing population-wide SHAP TreeExplainer feature attributions...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-100 flex flex-col min-w-0 min-h-screen">
      <Header />

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
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">No Global XAI Data Yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You are signed in with a custom account. Upload your enterprise customer CSV dataset to compute population-wide SHAP feature importances and dependence scatter plots.
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
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Global Model Explainability Engine</h2>
                <p className="text-xs text-slate-500">Understand population-wide feature influence, global SHAP importance, and non-linear feature interactions.</p>
              </div>
            </div>

            {/* Banner Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-churnly-600" />
                  What drives churn across the entire enterprise portfolio?
                </h3>
                <p className="text-xs text-slate-500 max-w-3xl">
                  SHAP TreeExplainer aggregates exact tree paths from LightGBM to measure global feature importance and feature value relationships across all accounts.
                </p>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs font-mono text-churnly-700 shrink-0 font-semibold">
                Base Population Baseline: <strong className="text-slate-800">{(globalData?.base_value * 100).toFixed(1)}%</strong>
              </div>
            </div>

            {/* Global SHAP Summary Component */}
            <GlobalSHAPChart
              globalData={globalData}
              onSelectFeature={(feat) => setSelectedFeature(feat)}
            />

            {/* Feature Dependence Component */}
            <FeatureDependenceChart
              featureName={selectedFeature}
              availableFeatures={globalData?.available_features || []}
            />
          </>
        )}
      </main>
    </div>
  );
}
