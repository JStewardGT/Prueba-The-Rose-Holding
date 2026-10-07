import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, record, loading }) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#101626] border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-rose-950/40 text-center">
        {/* Icono de Advertencia */}
        <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Expediente?</h3>
        <p className="text-sm text-slate-400 mb-6">
          Esta acción eliminará de forma permanente el expediente{' '}
          <span className="text-white font-semibold">"{record.case_title}"</span> correspondiente a{' '}
          <span className="text-white font-semibold">{record.client_name}</span>. Esta acción no se puede deshacer.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(record.id)}
            disabled={loading}
            className="flex-1 py-3 px-4 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
