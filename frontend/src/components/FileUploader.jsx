import React, { useState } from 'react';
import { uploadCSV } from '../services/api';
import RiskBadge from './RiskBadge';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function FileUploader() {
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl text-center space-y-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upload Enterprise Account CSV</h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload a bulk CSV file containing account attributes to perform batch LightGBM predictions and risk classification.
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
            <span htmlFor="batch-csv-input" className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-700 hover:border-cyan-500 rounded-lg text-xs font-mono text-cyan-400 cursor-pointer transition">
              <FileSpreadsheet className="w-4 h-4" />
              {file ? file.name : "Select CSV File..."}
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-lg text-xs text-rose-300 font-mono text-left flex items-start gap-2.5 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-200">Validation Error:</strong>
              {error}
            </div>
          </div>
        )}

        {file && !results && (
          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-cyan-950/50 flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running LightGBM Batch Predictions...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Run Batch Predictions
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results Table & Export */}
      {results && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Batch Prediction Complete ({results.total_rows} Accounts Processed)
              </h4>
              <p className="text-xs text-slate-400">File: {results.filename}</p>
            </div>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono text-xs font-semibold rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV Results
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-96">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Account ID</th>
                  <th className="py-2.5 px-4">Churn Probability</th>
                  <th className="py-2.5 px-4">Prediction</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Tenure</th>
                  <th className="py-2.5 px-4">Monthly Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {results.results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/80">
                    <td className="py-2.5 px-4 font-bold text-cyan-400">{row.account_id}</td>
                    <td className="py-2.5 px-4 font-bold text-white">{(row.churn_probability * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4">
                      {row.prediction === 1 ? (
                        <span className="text-rose-400 font-bold">1 (CHURN)</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">0 (RETAIN)</span>
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
