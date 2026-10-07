import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente guardián que restringe el acceso al dashboard y rutas privadas
 * exclusivamente a usuarios con sesión activa.
 */
export function ProtectedRoute({ children, onRequireAuth }) {
  const { isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated && onRequireAuth) {
      onRequireAuth();
    }
  }, [loading, isAuthenticated, onRequireAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verificando credenciales de acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-4">
        <div className="bg-[#111726] border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 00-8 0v4h8V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-slate-400 text-sm mb-6">
            Para acceder al panel de expedientes jurídicos debe iniciar sesión con su cuenta profesional.
          </p>
          <button
            onClick={onRequireAuth}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition shadow-lg shadow-rose-600/30"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return children;
}
