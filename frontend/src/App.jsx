import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ExecutiveOverview from './pages/ExecutiveOverview';
import CustomerExplorer from './pages/CustomerExplorer';
import AccountExplanation from './pages/AccountExplanation';
import GlobalExplanation from './pages/GlobalExplanation';
import ModelPerformance from './pages/ModelPerformance';
import BatchPrediction from './pages/BatchPrediction';

function ProtectedLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 selection:bg-churnly-600 selection:text-white font-sans">
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
