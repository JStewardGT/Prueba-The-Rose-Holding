/**
 * Traduce errores crudos de autenticación o de base de datos a mensajes legibles en español.
 * Cumple con el Principio V de la Constitución (Manejo de Errores y Validaciones).
 */
export function getFriendlyErrorMessage(error) {
  if (!error) return '';

  const message = error.message || error.error_description || String(error);

  if (message.includes('Invalid login credentials')) {
    return 'Credenciales incorrectas. Verifique su correo electrónico y contraseña.';
  }
  if (message.includes('User already registered') || message.includes('already registered')) {
    return 'El correo electrónico ya se encuentra registrado. Inicie sesión en su lugar.';
  }
  if (message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (message.includes('valid email')) {
    return 'Por favor ingrese un correo electrónico válido.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
  }
  if (message.includes('row-level security policy') || message.includes('RLS')) {
    return 'Operación denegada por directivas de seguridad. Solo puede gestionar sus propios registros.';
  }
  if (message.includes('duplicate key value')) {
    return 'Ya existe un registro con estos datos.';
  }

  return 'Ocurrió un error inesperado al procesar su solicitud. Intente nuevamente.';
}

/**
 * Retorna las clases de color corporativas asociadas a cada categoría de expediente.
 */
export function getCategoryBadgeStyle(category) {
  switch (category) {
    case 'Corporativo':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    case 'Litigio':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    case 'Laboral':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
  }
}

/**
 * Formatea una fecha ISO o YYYY-MM-DD a formato amigable en español.
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
    // Si viene solo fecha YYYY-MM-DD, evitar desfase de zona horaria
    if (typeof isoDate === 'string' && isoDate.length === 10 && isoDate.includes('-')) {
      const [year, month, day] = isoDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }

    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoDate;
  }
}

/**
 * Formatea y evalúa los días restantes para responder un término procesal.
 */
export function formatResponseDays(days) {
  if (days === null || days === undefined || days === '') return null;
  const num = parseInt(days, 10);
  if (isNaN(num)) return null;

  if (num === 0) {
    return {
      text: 'Vence hoy',
      badgeClass: 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse',
      isUrgent: true,
    };
  }
  if (num <= 3) {
    return {
      text: `${num} ${num === 1 ? 'día hábil' : 'días hábiles'} para responder`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      isUrgent: true,
    };
  }
  return {
    text: `${num} días para responder`,
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
    isUrgent: false,
  };
}

/**
 * Retorna la fecha local actual en formato YYYY-MM-DD (sin desfase UTC).
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida si una fecha dada en formato YYYY-MM-DD es posterior al día local actual.
 */
export function isFutureDate(dateString) {
  if (!dateString) return false;
  const today = getTodayDateString();
  return dateString > today;
}
