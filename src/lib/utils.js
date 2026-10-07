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
 * Formatea una fecha ISO a formato en español.
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
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
