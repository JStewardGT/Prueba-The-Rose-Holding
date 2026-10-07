import React from 'react';
import { getCategoryBadgeStyle, formatDate } from '../lib/utils';
import { Briefcase, User, Calendar, Trash2, ArrowUpRight } from 'lucide-react';

export function RecordCard({ record, onSelectRecord, onRequestDelete }) {
  return (
    <div
      onClick={() => onSelectRecord && onSelectRecord(record)}
      className="group relative p-6 bg-[#111726]/80 hover:bg-[#141d33] border border-slate-800/80 hover:border-rose-500/40 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-rose-950/20 flex flex-col justify-between cursor-pointer"
    >
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

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(record);
              }}
              title="Eliminar Expediente"
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Título del Caso */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2">
            {record.case_title}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
        </div>

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
        <span className="text-[11px] text-rose-400/80 font-medium group-hover:text-rose-300 transition-colors">
          Ver seguimiento →
        </span>
      </div>
    </div>
  );
}
