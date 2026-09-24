import React, { useState, useEffect } from 'react';
import { getModelMetrics } from '../services/api';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import ConfusionMatrixChart from '../components/ConfusionMatrixChart';
import RocPrCharts from '../components/RocPrCharts';
import { Activity, ShieldCheck, Cpu, Database, CheckCircle2, Loader2 } from 'lucide-react';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-screen text-cyan-400 font-mono text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading LightGBM validation metrics...</span>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
      <Header
        title="LightGBM Model Validation & Performance"
        subtitle="Rigorous empirical evaluation on held-out test dataset."
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Model Architecture Specs Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {metrics.model_name}
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                  PROD READY
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <code className="text-cyan-400">churn (0 or 1)</code> | Evaluated on {metrics.test_size} held-out test accounts ({metrics.dataset_size} total sample size).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" />
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
      </main>
    </div>
  );
}
