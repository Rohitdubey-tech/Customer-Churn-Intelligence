import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getModelMetrics } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import ConfusionMatrixChart from '../components/ConfusionMatrixChart';
import RocPrCharts from '../components/RocPrCharts';
import { Activity, ShieldCheck, Cpu, Database, CheckCircle2, Loader2, UploadCloud, FileSpreadsheet } from 'lucide-react';

export default function ModelPerformance() {
  const navigate = useNavigate();
  const { user, isDemo, customDataset } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      if (!isDemo && !customDataset) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getModelMetrics();
        setMetrics(res);
      } catch (err) {
        console.error("Failed to load model metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [isDemo, customDataset]);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center min-h-screen text-churnly-600 font-mono text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading LightGBM validation metrics...</span>
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
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">No Custom Model Metrics Yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You are signed in with a custom account. Upload your enterprise customer CSV dataset to evaluate LightGBM performance, ROC curves, and confusion matrix reports on your data.
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
        ) : metrics ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">LightGBM Model Validation & Performance</h2>
                <p className="text-xs text-slate-500">Rigorous empirical evaluation on held-out test dataset.</p>
              </div>
            </div>

            {/* Model Architecture Specs Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-churnly-50 border border-churnly-200 rounded-xl text-churnly-600">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    {metrics.model_name}
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                      PROD READY
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target: <code className="text-churnly-600 font-bold">churn (0 or 1)</code> | Evaluated on {metrics.test_size} held-out test accounts ({metrics.dataset_size} total sample size).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <Database className="w-4 h-4 text-churnly-600" />
                <span>Stratified 80/20 Train/Test Split</span>
              </div>
            </div>

            {/* 6 Key Performance Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Accuracy"
                value={`${(metrics.accuracy * 100).toFixed(1)}%`}
                subtitle="Overall Correctness"
                icon={CheckCircle2}
                color="emerald"
              />
              <MetricCard
                title="Precision"
                value={`${(metrics.precision * 100).toFixed(1)}%`}
                subtitle="Positive Predictive Value"
                icon={Activity}
                color="cyan"
              />
              <MetricCard
                title="Recall"
                value={`${(metrics.recall * 100).toFixed(1)}%`}
                subtitle="Sensitivity / Churn Coverage"
                icon={Activity}
                color="amber"
              />
              <MetricCard
                title="F1 Score"
                value={`${(metrics.f1_score * 100).toFixed(1)}%`}
                subtitle="Harmonic Mean"
                icon={Activity}
                color="purple"
              />
              <MetricCard
                title="ROC-AUC"
                value={metrics.roc_auc?.toFixed(4)}
                subtitle="Discrimination Power"
                icon={ShieldCheck}
                color="cyan"
              />
              <MetricCard
                title="PR-AUC"
                value={metrics.pr_auc?.toFixed(4)}
                subtitle="Imbalanced Dataset Area"
                icon={ShieldCheck}
                color="purple"
              />
            </div>

            {/* Confusion Matrix */}
            <ConfusionMatrixChart matrix={metrics.confusion_matrix} />

            {/* ROC and PR Curves */}
            <RocPrCharts
              rocCurve={metrics.roc_curve}
              prCurve={metrics.pr_curve}
              rocAuc={metrics.roc_auc}
              prAuc={metrics.pr_auc}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
