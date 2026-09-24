import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ExecutiveOverview from './pages/ExecutiveOverview';
import CustomerExplorer from './pages/CustomerExplorer';
import AccountExplanation from './pages/AccountExplanation';
import GlobalExplanation from './pages/GlobalExplanation';
import ModelPerformance from './pages/ModelPerformance';
import BatchPrediction from './pages/BatchPrediction';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<ExecutiveOverview />} />
            <Route path="/customers" element={<CustomerExplorer />} />
            <Route path="/customers/:id" element={<AccountExplanation />} />
            <Route path="/explain" element={<AccountExplanation />} />
            <Route path="/explainability" element={<GlobalExplanation />} />
            <Route path="/model" element={<ModelPerformance />} />
            <Route path="/batch" element={<BatchPrediction />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
