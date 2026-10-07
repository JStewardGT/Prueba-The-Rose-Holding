import React from 'react';
import { getCategoryBadgeStyle, formatDate } from '../lib/utils';
import { Briefcase, User, Calendar, Trash2, FileText } from 'lucide-react';

export function RecordCard({ record, onRequestDelete }) {
  return (
    <div className="group relative p-6 bg-[#111726]/80 hover:bg-[#131b2e] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-rose-950/10 flex flex-col justify-between">
      <div>
        {/* Cabecera de la Tarjeta: Categoría y Acción */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${getCategoryBadgeStyle(
              record.category
            )}`}
          >
            {record.category}
          </span>

          <button
            onClick={() => onRequestDelete(record)}
            title="Eliminar Expediente"
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Título del Caso */}
        <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 mb-2">
          {record.case_title}
        </h3>

        {/* Nombre del Cliente */}
        <div className="flex items-center gap-2 text-slate-300 text-sm mb-4">
          <User className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-medium truncate">{record.client_name}</span>
        </div>

        {/* Resumen / Notas */}
        {record.notes && (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
            {record.notes}
          </div>
        )}
      </div>

      {/* Pie de Tarjeta: Fecha de Creación */}
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(record.created_at)}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600 truncate max-w-[80px]">
          ID: {record.id.slice(0, 8)}
        </span>
      </div>
    </div>
  );
}
