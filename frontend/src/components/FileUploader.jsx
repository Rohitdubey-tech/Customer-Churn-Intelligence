import React, { useState } from 'react';
import { uploadCSV } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskBadge from './RiskBadge';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FileUploader() {
  const navigate = useNavigate();
  const { isDemo, user, updateCustomDataset } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError("Only .CSV files are accepted.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadCSV(formData);
      setResults(data);

      // Compute custom analytics summary from uploaded CSV predictions
      const items = data.results || [];
      const totalAccounts = items.length;
      const predictedChurners = items.filter(i => i.prediction === 1).length;
      const churnRate = totalAccounts > 0 ? predictedChurners / totalAccounts : 0;
      const highRiskCount = items.filter(i => ['HIGH', 'CRITICAL'].includes(i.risk_level)).length;
      const avgProb = totalAccounts > 0 ? items.reduce((acc, i) => acc + i.churn_probability, 0) / totalAccounts : 0;
      const arrAtRisk = items.filter(i => ['HIGH', 'CRITICAL'].includes(i.risk_level)).reduce((acc, i) => acc + (parseFloat(i.monthly_charges || 0) * 12), 0);

      // Segment breakdown
      const segmentMap = {};
      items.forEach(item => {
        const seg = item.customer_segment || 'Enterprise';
        if (!segmentMap[seg]) segmentMap[seg] = { total_accounts: 0, predicted_churn: 0 };
        segmentMap[seg].total_accounts += 1;
        if (item.prediction === 1) segmentMap[seg].predicted_churn += 1;
      });

      const segmentBreakdown = Object.keys(segmentMap).map(seg => ({
        segment: seg,
        total_accounts: segmentMap[seg].total_accounts,
        predicted_churn: segmentMap[seg].predicted_churn,
        churn_rate: segmentMap[seg].total_accounts > 0 ? segmentMap[seg].predicted_churn / segmentMap[seg].total_accounts : 0
      }));

      // Risk distribution
      const riskMap = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
      items.forEach(i => {
        if (riskMap[i.risk_level] !== undefined) riskMap[i.risk_level] += 1;
      });

      const riskDistribution = Object.keys(riskMap).map(lvl => ({
        risk_level: lvl,
        count: riskMap[lvl],
        percentage: totalAccounts > 0 ? roundVal((riskMap[lvl] / totalAccounts) * 100, 1) : 0
      }));

      function roundVal(v, dec = 1) { return parseFloat(v.toFixed(dec)); }

      const customAnalytics = {
        total_accounts: totalAccounts,
        predicted_churners: predictedChurners,
        churn_rate: roundVal(churnRate, 4),
        high_risk_count: highRiskCount,
        average_churn_probability: roundVal(avgProb, 4),
        revenue_at_risk_annual: roundVal(arrAtRisk, 2),
        risk_distribution: riskDistribution,
        segment_breakdown: segmentBreakdown
      };

      // Store custom dataset in session context
      updateCustomDataset({
        filename: file.name,
        results: items,
        analytics: customAnalytics
      });

    } catch (err) {
      const errRes = err.response?.data;
      if (errRes && errRes.details) {
        setError(`Validation Failed: ${errRes.details.join('; ')}`);
      } else {
        setError(errRes?.message || "Failed to process batch CSV prediction.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results || !results.results) return;
    const items = results.results;
    if (items.length === 0) return;

    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `churn_predictions_${file.name}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center space-y-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 bg-churnly-50 border border-churnly-200 rounded-2xl flex items-center justify-center mx-auto text-churnly-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Enterprise Account CSV</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload a bulk CSV file to perform LightGBM predictions, generate risk metrics, and populate your workspace report.
            </p>
          </div>

          <label className="block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="batch-csv-input"
            />
            <span htmlFor="batch-csv-input" className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-300 hover:border-churnly-500 rounded-lg text-xs font-mono text-slate-700 cursor-pointer transition shadow-sm hover:shadow">
              <FileSpreadsheet className="w-4 h-4 text-churnly-600" />
              {file ? file.name : "Select CSV File..."}
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-mono text-left flex items-start gap-2.5 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900 font-bold">Validation Error:</strong>
              {error}
            </div>
          </div>
        )}

        {file && !results && (
          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="btn-churnly mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running LightGBM & SHAP Predictions...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Process & Generate Workspace Report
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results Table & Export */}
      {results && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Batch Prediction Complete ({results.total_rows} Accounts Processed)
              </h4>
              <p className="text-xs text-slate-500">Dataset file: {results.filename}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="btn-churnly"
              >
                <span>View Dashboard Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="btn-churnly-secondary font-mono"
              >
                <Download className="w-4 h-4" />
                Export Scored CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-96">
            <table className="w-full text-left text-xs text-slate-700 font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Account ID</th>
                  <th className="py-2.5 px-4">Churn Probability</th>
                  <th className="py-2.5 px-4">Prediction</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Tenure</th>
                  <th className="py-2.5 px-4">Monthly Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-churnly-600">{row.account_id}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{(row.churn_probability * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4">
                      {row.prediction === 1 ? (
                        <span className="text-rose-600 font-bold">1 (CHURN)</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">0 (RETAIN)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <RiskBadge level={row.risk_level} showIcon={false} />
                    </td>
                    <td className="py-2.5 px-4">{row.tenure_months || 'N/A'} mos</td>
                    <td className="py-2.5 px-4">${row.monthly_charges || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
