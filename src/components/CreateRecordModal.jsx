import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../lib/utils';
import { X, Briefcase, User, Tag, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CreateRecordModal({ isOpen, onClose, onRecordCreated }) {
  const { user } = useAuth();
  const [caseTitle, setCaseTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [category, setCategory] = useState('Corporativo');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación cliente estricta: No permitir vacíos ni solo espacios
    if (!caseTitle.trim()) {
      setError('El título del caso es obligatorio.');
      return;
    }

    if (!clientName.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }

    if (!['Corporativo', 'Litigio', 'Laboral'].includes(category)) {
      setError('Debe seleccionar una categoría válida.');
      return;
    }

    setLoading(true);

    try {
      // Inserción con user_id explícito vinculado a auth.uid() (Principio I)
      const { data, error: insertError } = await supabase
        .from('legal_records')
        .insert([
          {
            user_id: user.id,
            case_title: caseTitle.trim(),
            client_name: clientName.trim(),
            category: category,
            notes: notes.trim(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError(getFriendlyErrorMessage(insertError));
        return;
      }

      // Limpiar formulario y notificar
      setCaseTitle('');
      setClientName('');
      setCategory('Corporativo');
      setNotes('');
      if (onRecordCreated) {
        onRecordCreated(data);
      }
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#101626] border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-rose-950/40">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-rose-500/20">
            Nuevo Expediente
          </div>
          <h2 className="text-2xl font-bold text-white">Registrar Asunto Legal</h2>
          <p className="text-sm text-slate-400 mt-1">
            Ingrese los datos procesales del caso. La información queda vinculada exclusivamente a su cuenta.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título del Caso */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Título del Caso <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                placeholder="Ej. Fusión Corporativa & Reestructuración"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          {/* Nombre del Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nombre del Cliente <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Inversiones Andinas S.A."
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          {/* Categoría Obligatoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Área Jurídica <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Corporativo', 'Litigio', 'Laboral'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    category === cat
                      ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas y Resumen */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Notas / Resumen Procesal
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anotaciones relevantes del expediente, estado del trámite o acuerdos pactados..."
                className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Expediente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
