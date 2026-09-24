import React, { useState } from 'react';
import { ArrowRight, Info, PlusCircle, MinusCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function SHAPForcePlot({ explanation }) {
  const [expandedFeature, setExpandedFeature] = useState(null);

  if (!explanation) return null;

  const {
    account_id,
    company_name,
    churn_probability,
    risk_level,
    base_value,
    summary,
    increasing_risk_factors = [],
    decreasing_risk_factors = [],
  } = explanation;

  const finalProbPercent = (churn_probability * 100).toFixed(1);
  const baseProbPercent = (base_value * 100).toFixed(1);

  const posSum = increasing_risk_factors.reduce((acc, f) => acc + f.shap_value, 0);
  const negSum = Math.abs(decreasing_risk_factors.reduce((acc, f) => acc + f.shap_value, 0));
  const maxAbs = Math.max(posSum, negSum, 0.05);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{company_name}</h3>
            <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">{account_id}</span>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-3xl">{summary}</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Churn Probability</span>
            <span className="text-2xl font-extrabold font-mono text-churnly-600">{finalProbPercent}%</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Risk Category</span>
            <RiskBadge level={risk_level} />
          </div>
        </div>
      </div>

      {/* SHAP Force Plot Visualization Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-churnly-600" />
            <h4 className="text-sm font-bold text-slate-800">SHAP Prediction Contribution Breakdown</h4>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500">Baseline (Avg): <strong className="text-slate-700">{baseProbPercent}%</strong></span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Model Output: <strong className="text-churnly-600">{finalProbPercent}%</strong></span>
          </div>
        </div>

        {/* Visual Contribution Balance Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden flex">
            {/* Baseline Marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10 shadow-[0_0_8px_#f59e0b]"
              style={{ left: `${Math.min(98, Math.max(2, base_value * 100))}%` }}
              title={`Baseline probability: ${baseProbPercent}%`}
            ></div>
            
            {/* Output Marker */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-churnly-600 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(1, churn_probability * 100))}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span>0% (Strong Retention)</span>
            <span className="text-amber-600 font-semibold">Baseline: {baseProbPercent}%</span>
            <span>100% (High Churn Risk)</span>
          </div>
        </div>
      </div>

      {/* Two Column SHAP Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factors Increasing Churn Risk */}
        <div className="bg-churnly-50/50 border border-churnly-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-churnly-700 border-b border-churnly-200 pb-2.5">
            <span className="flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-churnly-600" />
              Factors Increasing Churn Risk (+SHAP)
            </span>
            <span className="font-mono text-[10px] text-churnly-600 uppercase">Pushes Risk UP</span>
          </div>

          <div className="space-y-2.5">
            {increasing_risk_factors.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No significant positive churn risk signals detected.</p>
            ) : (
              increasing_risk_factors.map((feat) => {
                const widthPct = Math.min(100, (feat.shap_value / maxAbs) * 100);
                const isExpanded = expandedFeature === feat.feature;

                return (
                  <div
                    key={feat.feature}
                    onClick={() => setExpandedFeature(isExpanded ? null : feat.feature)}
                    className="bg-white border border-churnly-200 hover:border-churnly-400 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs mb-2 gap-2">
                      <span className="font-semibold text-slate-800 capitalize truncate">
                        {feat.feature.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="text-slate-500 text-[11px]">Val: {String(feat.value)}</span>
                        <span className="text-churnly-700 font-bold bg-churnly-100 px-1.5 py-0.5 rounded border border-churnly-200">+{feat.shap_value.toFixed(3)}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-churnly-600 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed transition-all">
                        <p>
                          <strong className="text-churnly-700 font-semibold">Model Signal Interpretation:</strong> Having a feature value of <code className="text-churnly-800 px-1.5 py-0.5 bg-churnly-100 rounded font-mono">{String(feat.value)}</code> contributed positively (+{feat.shap_value.toFixed(3)}) to the model's churn probability prediction for this account.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Factors Reducing Churn Risk */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 border-b border-emerald-200 pb-2.5">
            <span className="flex items-center gap-1.5">
              <MinusCircle className="w-4 h-4 text-emerald-600" />
              Factors Reducing Churn Risk (-SHAP)
            </span>
            <span className="font-mono text-[10px] text-emerald-600 uppercase">Pushes Risk DOWN</span>
          </div>

          <div className="space-y-2.5">
            {decreasing_risk_factors.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No significant retention-assisting factors detected.</p>
            ) : (
              decreasing_risk_factors.map((feat) => {
                const widthPct = Math.min(100, (Math.abs(feat.shap_value) / maxAbs) * 100);
                const isExpanded = expandedFeature === feat.feature;

                return (
                  <div
                    key={feat.feature}
                    onClick={() => setExpandedFeature(isExpanded ? null : feat.feature)}
                    className="bg-white border border-emerald-200 hover:border-emerald-400 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs mb-2 gap-2">
                      <span className="font-semibold text-slate-800 capitalize truncate">
                        {feat.feature.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="text-slate-500 text-[11px]">Val: {String(feat.value)}</span>
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">{feat.shap_value.toFixed(3)}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed transition-all">
                        <p>
                          <strong className="text-emerald-700 font-semibold">Model Signal Interpretation:</strong> Having a feature value of <code className="text-emerald-800 px-1.5 py-0.5 bg-emerald-100 rounded font-mono">{String(feat.value)}</code> contributed negatively ({feat.shap_value.toFixed(3)}) to the model's churn probability prediction, stabilizing customer retention.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-churnly-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Explainable AI Transparency:</strong> SHAP values indicate how each feature value contributed to the LightGBM model's mathematical prediction relative to the population baseline ({baseProbPercent}%). They reflect model association, not direct causal intervention.
        </p>
      </div>
    </div>
  );
}
