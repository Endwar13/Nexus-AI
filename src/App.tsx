/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import SetupProfile from './pages/SetupProfile';
import Agentic from './pages/Agentic';
import Monitoring from './pages/Monitoring';
import InputData from './pages/InputData';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // If user has no username setup yet, force them to setup profile
  // Unless they are already on the setup-profile page
  if (!profile?.username && window.location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/setup-profile" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Agentic />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="input" element={<InputData />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
