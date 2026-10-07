import React from 'react';
import { ShieldCheck, Zap, Cpu, Lock, ArrowRight } from 'lucide-react';

export function FeatureCards({ onExploreClick }) {
  const features = [
    {
      title: 'Seguridad Multitenant RLS',
      description:
        'Aislamiento estricto de expedientes a nivel de base de datos PostgreSQL. Solo usted puede acceder y gestionar su propia información legal.',
      icon: ShieldCheck,
      iconColor: 'text-rose-400',
      bgColor: 'from-rose-500/10 to-transparent',
      borderColor: 'border-rose-500/20 hover:border-rose-500/50',
      badge: 'Row Level Security',
    },
    {
      title: 'Velocidad & Sincronización Realtime',
      description:
        'Actualización instantánea de expedientes en tiempo real vía WebSockets sin recargas ni demoras perceptibles en el flujo de trabajo.',
      icon: Zap,
      iconColor: 'text-amber-400',
      bgColor: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
      badge: 'Supabase Realtime',
    },
    {
      title: 'Clasificación Estructurada',
      description:
        'Organización rigurosa de asuntos en áreas Corporativa, Litigio y Laboral con validación garantizada y filtros inmediatos.',
      icon: Cpu,
      iconColor: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
      badge: 'Taxonomía Legal',
    },
  ];

  return (
    <section className="relative z-10 py-24 bg-[#080b11] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold tracking-wider uppercase mb-4">
            <Lock className="w-3.5 h-3.5" />
            Infraestructura Legal Moderna
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Diseñado para la excelencia en <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">despachos jurídicos</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Potencia, confiabilidad y experiencia de usuario optimizada para la gestión estratégica de causas legales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl bg-gradient-to-b ${feature.bgColor} bg-[#101626]/60 border ${feature.borderColor} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-950/20 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Icono con Morphicon micro-animación en hover */}
                    <div className="w-14 h-14 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
                      <Icon className={`w-7 h-7 ${feature.iconColor} group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all`} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/40">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-rose-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center text-xs font-semibold text-rose-400 group-hover:text-rose-300 transition-colors">
                  <span>Conocer más</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
