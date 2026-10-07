import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage, getTodayDateString, isFutureDate } from '../lib/utils';
import { X, Calendar, Clock, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CreateUpdateModal({ isOpen, onClose, caseId, onUpdateCreated }) {
  const { user } = useAuth();
  const today = getTodayDateString();
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => getTodayDateString());
  const [description, setDescription] = useState('');
  const [responseDays, setResponseDays] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Interceptar teclas no numéricas (- , + , e , E , . , , etc.)
  const handleNumericKeyDown = (e) => {
    // Permitir teclas de control y edición
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'Enter',
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Bloquear explícitamente cualquier caracter que no sea dígito 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Saneamiento ante eventos de pegado o cambio
  const handleNumericChange = (e) => {
    const sanitized = e.target.value.replace(/[^0-9]/g, '');
    setResponseDays(sanitized);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título o hito de la novedad es obligatorio.');
      return;
    }

    if (!eventDate) {
      setError('La fecha del suceso es obligatoria.');
      return;
    }

    if (isFutureDate(eventDate)) {
      setError('La fecha del suceso no puede ser futura.');
      return;
    }

    if (!description.trim()) {
      setError('La descripción detallada es obligatoria.');
      return;
    }

    let parsedDays = null;
    if (responseDays.trim() !== '') {
      const num = Number(responseDays);
      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        setError('Los días para responder deben ser mayores a 0 días.');
        return;
      }
      parsedDays = num;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('case_updates')
        .insert([
          {
            case_id: caseId,
            user_id: user.id,
            title: title.trim(),
            event_date: eventDate,
            description: description.trim(),
            response_days: parsedDays,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError(getFriendlyErrorMessage(insertError));
        return;
      }

      // Limpiar formulario y notificar al padre
      setTitle('');
      setEventDate(getTodayDateString());
      setDescription('');
      setResponseDays('');
      setError('');
      if (onUpdateCreated) {
        onUpdateCreated(data);
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
            Seguimiento Procesal
          </div>
          <h2 className="text-2xl font-bold text-white">Registrar Novedad del Caso</h2>
          <p className="text-sm text-slate-400 mt-1">
            Incorpore actuaciones, traslados, respuestas judiciales y plazos para responder.
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título de la Novedad */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Título / Hito Procesal <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Respuesta recibida de la Rama Judicial"
              required
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha del Suceso */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Fecha del Suceso <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  max={today}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>
            </div>

            {/* Días para Responder (Opcional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Días para Responder
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={responseDays}
                  onKeyDown={handleNumericKeyDown}
                  onChange={handleNumericChange}
                  placeholder="Ej. 3 (mayor a 0 días)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Descripción y Contexto <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                placeholder="Detalle de la actuación, juzgado actuante, instrucciones de contestación o hechos relevantes..."
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
                  <span>Guardar Novedad</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
