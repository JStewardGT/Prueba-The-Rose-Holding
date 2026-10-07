import React from 'react';
import { Hero3D } from '../components/Hero3D';
import { FeatureCards } from '../components/FeatureCards';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Scale, Sparkles, FolderLock } from 'lucide-react';

export function LandingPage({ onNavigate, onOpenAuth }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen bg-[#080b11] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* SECCIÓN HERO CON 3D INTERACTIVO */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 flex items-center min-h-[90vh]">
        {/* Lienzo Three.js de fondo */}
        <Hero3D />

        {/* Gradientes decorativos de iluminación */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Contenido Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs sm:text-sm text-slate-300 font-medium mb-8 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 font-semibold">The Rose Holding</span> — Soluciones Jurídicas Avanzadas
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Gestión Inteligente de <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-amber-300">
              Expedientes Jurídicos
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Plataforma corporativa de alto rendimiento con seguridad multitenant estricta, visualización 3D y sincronización en tiempo real para despachos de élite.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 group text-base"
              >
                <FolderLock className="w-5 h-5 text-rose-200" />
                <span>Acceder a Mi Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 group text-base"
                >
                  <span>Comenzar Ahora</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-700 transition backdrop-blur-sm text-base"
                >
                  Iniciar Sesión
                </button>
              </>
            )}
          </div>

          {/* Sellos de Confianza y Arquitectura */}
          <div className="mt-16 pt-10 border-t border-slate-800/60 max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">100%</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Aislamiento RLS</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-800">
              <span className="text-2xl sm:text-3xl font-bold text-rose-400">&lt;500ms</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Sincronización Realtime</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">WebGL</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Gráficos Three.js</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS */}
      <FeatureCards onExploreClick={() => onOpenAuth('signup')} />

      {/* FOOTER CORPORATIVO */}
      <footer className="relative z-10 border-t border-slate-900 bg-[#06090e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-slate-400">The Rose Holding Legal Suite</span>
            <span>&copy; {new Date().getFullYear()} Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-600">Prueba Técnica Profesional — Sector Legal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
