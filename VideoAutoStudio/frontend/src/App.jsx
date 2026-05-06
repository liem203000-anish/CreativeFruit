import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ScriptsPage from './pages/ScriptsPage';
import VoiceoverPage from './pages/VoiceoverPage';
import DriveVideosPage from './pages/DriveVideosPage';
import TemplatesPage from './pages/TemplatesPage';
import SettingsPage from './pages/SettingsPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';
import './styles/global.css';

const ProtectedLayout = ({ children, sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`main-content ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Topbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return <div className="loading">Loading...</div>;

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
      <ProtectedLayout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
        {children}
      </ProtectedLayout>
    );
  };

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/projects"
          element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>}
        />
        <Route
          path="/templates"
          element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>}
        />
        <Route
          path="/scripts"
          element={<ProtectedRoute><ScriptsPage /></ProtectedRoute>}
        />
        <Route
          path="/voiceover"
          element={<ProtectedRoute><VoiceoverPage /></ProtectedRoute>}
        />
        <Route
          path="/drive-videos"
          element={<ProtectedRoute><DriveVideosPage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster position="top-right" />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
};

export default App;
