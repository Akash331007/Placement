import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import ResumeAnalysis from './pages/ResumeAnalysis';
import SkillGap from './pages/SkillGap';
import ATSScore from './pages/ATSScore';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/upload" element={user ? <UploadResume /> : <Navigate to="/login" replace />} />
      <Route path="/analysis" element={user ? <ResumeAnalysis /> : <Navigate to="/login" replace />} />
      <Route path="/skill-gap" element={user ? <SkillGap /> : <Navigate to="/login" replace />} />
      <Route path="/roadmap" element={user ? <SkillGap /> : <Navigate to="/login" replace />} />
      <Route path="/ats-score" element={user ? <ATSScore /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
