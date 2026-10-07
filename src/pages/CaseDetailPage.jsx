import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage, getCategoryBadgeStyle, formatDate, formatResponseDays } from '../lib/utils';
import { CreateUpdateModal } from '../components/CreateUpdateModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  FileText,
  User,
  Scale,
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export function CaseDetailPage({ legalRecord, onBack }) {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 1. Cargar las novedades procesales del caso
  const fetchUpdates = async () => {
    if (!legalRecord?.id || !user) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('case_updates')
        .select('*')
        .eq('case_id', legalRecord.id)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(getFriendlyErrorMessage(fetchError));
      } else {
        setUpdates(data || []);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [legalRecord?.id, user]);

  // 2. Suscripción a Supabase Realtime para case_updates
  useEffect(() => {
    if (!legalRecord?.id || !user) return;

    const channel = supabase
      .channel(`public:case_updates:${legalRecord.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_updates',
          filter: `case_id=eq.${legalRecord.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new && payload.new.user_id === user.id) {
              setUpdates((prev) => {
                if (prev.some((u) => u.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setUpdates((prev) => prev.filter((u) => u.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.user_id === user.id) {
              setUpdates((prev) =>
                prev.map((u) => (u.id === payload.new.id ? payload.new : u))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [legalRecord?.id, user]);

  // 3. Manejo de inserción local inmediata
  const handleUpdateCreated = (newUpdate) => {
    setUpdates((prev) => {
      if (prev.some((u) => u.id === newUpdate.id)) return prev;
      return [newUpdate, ...prev];
    });
  };

  // 4. Eliminación de novedad con confirmación
  const handleConfirmDelete = async (updateId) => {
    setDeleteLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('case_updates')
        .delete()
        .eq('id', updateId);

      if (deleteError) {
        alert(getFriendlyErrorMessage(deleteError));
      } else {
        setUpdates((prev) => prev.filter((u) => u.id !== updateId));
        setUpdateToDelete(null);
      }
    } catch (err) {
      alert(getFriendlyErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!legalRecord) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 pt-28 pb-20 px-4 text-center">
        <p className="text-slate-400">Expediente no seleccionado o no encontrado.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Barra superior de navegación */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group py-2 px-3 rounded-xl hover:bg-slate-900"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Mis Expedientes</span>
          </button>

          <button
            onClick={fetchUpdates}
            title="Refrescar Novedades"
            disabled={loading}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tarjeta de Encabezado del Caso */}
        <div className="p-8 bg-[#101626] border border-slate-800 rounded-3xl shadow-xl shadow-rose-950/20 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${getCategoryBadgeStyle(
                    legalRecord.category
                  )}`}
                >
                  {legalRecord.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {legalRecord.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {legalRecord.case_title}
              </h1>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="py-3 px-5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition shadow-lg shadow-rose-600/30 inline-flex items-center gap-2 text-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Novedad</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800/80 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300 font-medium">Cliente:</span>
              <span className="text-white">{legalRecord.client_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300 font-medium">Registrado:</span>
              <span>{formatDate(legalRecord.created_at)}</span>
            </div>
          </div>

          {legalRecord.notes && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-rose-400 block mb-1">Notas Iniciales:</span>
              {legalRecord.notes}
            </div>
          )}
        </div>

        {/* Sección de Cronología y Novedades Procesales */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Línea de Tiempo Procesal</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                {updates.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Registro histórico cronológico de actuaciones, radicaciones y plazos de respuesta.
            </p>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Lista de Novedades */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-xs">Cargando cronología procesal...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="py-16 px-4 text-center border-2 border-dashed border-slate-800/80 rounded-3xl bg-[#101626]/40 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-slate-800/80 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-700">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Sin novedades registradas
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mb-5 leading-relaxed">
              Registre radicaciones de demandas, traslados, autos o respuestas judiciales para mantener el seguimiento al día.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition shadow-lg shadow-rose-600/30 inline-flex items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primera Novedad</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-rose-500/30 space-y-8 my-4 ml-2 sm:ml-4">
            {updates.map((update) => {
              const deadline = formatResponseDays(update.response_days);

              return (
                <div key={update.id} className="relative group">
                  {/* Nodo circular de la línea de tiempo */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-rose-600 ring-4 ring-[#080b11] group-hover:scale-125 transition-transform duration-200" />

                  {/* Tarjeta de la novedad */}
                  <div className="p-6 rounded-2xl bg-[#111726]/90 border border-slate-800/90 group-hover:border-slate-700 transition shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(update.event_date)}
                          </span>

                          {deadline && (
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md ${deadline.badgeClass}`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              {deadline.text}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                          {update.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setUpdateToDelete({
                            id: update.id,
                            case_title: update.title,
                            client_name: formatDate(update.event_date),
                          })
                        }
                        title="Eliminar Novedad"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition self-end sm:self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                      {update.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Registrado en plataforma: {formatDate(update.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Crear Novedad */}
      <CreateUpdateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        caseId={legalRecord.id}
        onUpdateCreated={handleUpdateCreated}
      />

      {/* Modal de Confirmación para Eliminar Novedad */}
      <DeleteConfirmModal
        isOpen={!!updateToDelete}
        record={updateToDelete}
        onClose={() => setUpdateToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
