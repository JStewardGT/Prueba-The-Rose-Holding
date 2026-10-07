import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, Home, User } from 'lucide-react';

export function Navbar({ currentView, onNavigate, onOpenAuth }) {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#080b11]/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Corporativo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left group transition focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-900 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/30 border border-rose-500/30 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block">
                THE ROSE <span className="text-rose-500">HOLDING</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block">
                Legal & Professional Services
              </span>
            </div>
          </button>

          {/* Botones de Navegación y Sesión */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {currentView === 'landing' ? (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 text-rose-400" />
                    <span>Mi Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
                  >
                    <Home className="w-4 h-4" />
                    <span>Inicio</span>
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#111726] border border-slate-800 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-300 max-w-[150px] truncate">
                    {user?.email}
                  </span>
                </div>

                <button
                  onClick={signOut}
                  title="Cerrar Sesión"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-lg shadow-rose-600/30 border border-rose-500/40"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
