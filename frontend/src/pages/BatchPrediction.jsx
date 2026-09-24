import React from 'react';
import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import { UploadCloud, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function BatchPrediction() {
  const downloadSampleTemplate = () => {
    const sampleHeaders = "account_id,company_name,industry,customer_segment,contract_type,payment_method,tenure_months,monthly_charges,total_charges,contract_licenses,active_users,support_tickets_30d,sla_breaches_90d,nps_score,last_login_days_ago,feature_usage_score,executive_sponsor_present,discount_percentage,paperless_billing,auto_renewal";
    const sampleRow = 'SAMPLE-101,"Acme Global","Enterprise Tech","Enterprise","Month-to-Month","Credit Card",4,1450.0,5800.0,100,15,6,2,4,12,42.5,0,0,1,0';
    const csvContent = "data:text/csv;charset=utf-8," + [sampleHeaders, sampleRow].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "churn_batch_prediction_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
      <Header
        title="Batch Customer Churn Prediction Engine"
        subtitle="Upload bulk CSV files for automated enterprise churn scoring and risk classification."
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Template Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              Batch CSV Upload Requirements
            </h3>
            <p className="text-xs text-slate-400">
              Ensure your CSV file contains required features (industry, segment, contract_type, tenure_months, monthly_charges, support_tickets_30d, etc.).
            </p>
          </div>

          <button
            onClick={downloadSampleTemplate}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-mono rounded-lg transition flex items-center gap-2 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV Template
          </button>
        </div>

        {/* File Uploader Component */}
        <FileUploader />
      </main>
    </div>
  );
}
