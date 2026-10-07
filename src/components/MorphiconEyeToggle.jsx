import React from 'react';

/**
 * MorphiconEyeToggle
 * Botón con icono SVG animado (Morphicon) para alternar entre ver y ocultar contraseña.
 * Incluye transiciones fluidas de los trazados SVG (pupila, contorno y línea de bloqueo tachada).
 */
export function MorphiconEyeToggle({ isVisible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
      aria-label={isVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
      className="p-2 text-slate-400 hover:text-rose-400 focus:text-rose-400 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 focus:outline-none group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
      >
        {/* Contorno del ojo (forma almendrada) */}
        <path
          d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
          className="transition-all duration-300"
        />

        {/* Pupila central con efecto morph (escala y opacidad según estado) */}
        <circle
          cx="12"
          cy="12"
          r="3"
          className={`transition-all duration-300 origin-center ${
            isVisible
              ? 'scale-100 opacity-100 fill-rose-500/20 stroke-rose-400'
              : 'scale-75 opacity-70 stroke-slate-400'
          }`}
        />

        {/* Línea diagonal animada de ocultar (barra tachada) con morphing de strokeDashoffset */}
        <line
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          strokeDasharray="26"
          strokeDashoffset={isVisible ? '26' : '0'}
          className="transition-all duration-300 ease-in-out text-rose-500"
        />
      </svg>
    </button>
  );
}
