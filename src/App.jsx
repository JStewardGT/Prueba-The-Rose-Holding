import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthModal } from './components/AuthModal';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const { isAuthenticated } = useAuth();

  const handleOpenAuth = React.useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const handleRequireAuth = React.useCallback(() => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  }, []);

  const handleNavigate = (view) => {
    if (view === 'dashboard' && !isAuthenticated) {
      handleOpenAuth('login');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col justify-between">
      {/* Barra de Navegación Global */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Enrutamiento de Vistas */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        ) : (
          <ProtectedRoute onRequireAuth={handleRequireAuth}>
            <DashboardPage />
          </ProtectedRoute>
        )}
      </main>

      {/* Modal Global de Autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
