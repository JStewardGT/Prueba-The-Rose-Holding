import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../lib/utils';
import { RecordCard } from '../components/RecordCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { CreateRecordModal } from '../components/CreateRecordModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  Plus,
  FolderOpen,
  Search,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  FolderPlus,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 1. Cargar registros del usuario autenticado
  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('legal_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(getFriendlyErrorMessage(fetchError));
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  // 2. Suscripción a Supabase Realtime (postgres_changes)
  useEffect(() => {
    if (!user) return;

    // Canal reactivo en tiempo real
    const channel = supabase
      .channel('public:legal_records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_records',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Verificar pertenencia al usuario actual
            if (payload.new && payload.new.user_id === user.id) {
              setRecords((prev) => {
                if (prev.some((r) => r.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setRecords((prev) => prev.filter((r) => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.user_id === user.id) {
              setRecords((prev) =>
                prev.map((r) => (r.id === payload.new.id ? payload.new : r))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 3. Manejo de Creación Local
  const handleRecordCreated = (newRecord) => {
    setRecords((prev) => {
      if (prev.some((r) => r.id === newRecord.id)) return prev;
      return [newRecord, ...prev];
    });
  };

  // 4. Manejo de Eliminación
  const handleConfirmDelete = async (recordId) => {
    setDeleteLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('legal_records')
        .delete()
        .eq('id', recordId);

      if (deleteError) {
        alert(getFriendlyErrorMessage(deleteError));
      } else {
        setRecords((prev) => prev.filter((r) => r.id !== recordId));
        setRecordToDelete(null);
      }
    } catch (err) {
      alert(getFriendlyErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  // 5. Cálculos de Filtros y Búsqueda
  const counts = useMemo(() => {
    const res = { Todas: records.length, Corporativo: 0, Litigio: 0, Laboral: 0 };
    records.forEach((r) => {
      if (res[r.category] !== undefined) {
        res[r.category] += 1;
      }
    });
    return res;
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesCategory =
        activeCategory === 'Todas' || r.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [records, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado del Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-rose-500/20">
              Portal Privado
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mis Expedientes Jurídicos
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-400">
              Gestione, categorice y supervise sus asuntos procesales en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRecords}
              title="Refrescar Lista"
              disabled={loading}
              className="p-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="py-3 px-5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Expediente</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <CategoryFilter
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            counts={counts}
          />

          {/* Campo de Búsqueda Rápida */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por caso o cliente..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#101626] border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Lista de Expedientes */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Cargando expedientes jurídicos...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Estado Vacío */
          <div className="py-20 px-4 text-center border-2 border-dashed border-slate-800/80 rounded-3xl bg-[#101626]/40 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-800/80 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {searchQuery || activeCategory !== 'Todas'
                ? 'No se encontraron expedientes con este filtro'
                : 'Aún no tiene expedientes registrados'}
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              {searchQuery || activeCategory !== 'Todas'
                ? 'Intente cambiando el criterio de búsqueda o seleccionando otra categoría.'
                : 'Comience creando su primer asunto legal para gestionarlo con seguridad RLS.'}
            </p>
            {!searchQuery && activeCategory === 'Todas' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition shadow-lg shadow-rose-600/30 inline-flex items-center gap-2 text-sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Registrar Primer Expediente</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onRequestDelete={(rec) => setRecordToDelete(rec)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateRecordModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRecordCreated={handleRecordCreated}
      />

      <DeleteConfirmModal
        isOpen={!!recordToDelete}
        record={recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
