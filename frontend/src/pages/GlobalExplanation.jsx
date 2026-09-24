import React, { useState, useEffect } from 'react';
import { getGlobalExplainability } from '../services/api';
import Header from '../components/Header';
import GlobalSHAPChart from '../components/GlobalSHAPChart';
import FeatureDependenceChart from '../components/FeatureDependenceChart';
import { Sparkles, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function GlobalExplanation() {
  const [globalData, setGlobalData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('nps_score');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-screen text-cyan-400 font-mono text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Computing population-wide SHAP TreeExplainer feature attributions...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
      <Header
        title="Global Model Explainability Engine"
        subtitle="Understand population-wide feature influence, global SHAP importance, and non-linear feature interactions."
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              What drives churn across the entire enterprise portfolio?
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl">
              SHAP TreeExplainer aggregates exact tree paths from LightGBM to measure global feature importance and feature value relationships across all accounts.
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400 shrink-0">
            Base Population Baseline: <strong className="text-white">{(globalData?.base_value * 100).toFixed(1)}%</strong>
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
      </main>
    </div>
  );
}
