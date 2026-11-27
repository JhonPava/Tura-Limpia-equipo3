// Textos para mostrar los valores que guarda el backend (DISPONIBLE → "Disponible").
// Los valores permitidos son los mismos que valida el backend.

export const ESTADOS_OPERATIVOS = {
  DISPONIBLE: 'Disponible',
  EN_SERVICIO: 'En servicio',
  MANTENIMIENTO: 'Mantenimiento',
  FUERA_SERVICIO: 'Fuera de servicio',
};

export const TIPOS_VEHICULO = {
  COMPACTADOR: 'Compactador',
  VOLQUETA: 'Volqueta',
  BARREDORA: 'Barredora',
  MINICARGADOR: 'Minicargador',
  CAMION: 'Camión',
};

/** Fecha AAAA-MM-DD → "15 mar 2022" (sin cambiar de día por la zona horaria). */
export function formatoFecha(fecha) {
  if (!fecha) return '—';
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Etiqueta de color según el estado operativo (o "Desactivado"). */
export function EstadoVehiculo({ estado, activo = true }) {
  if (!activo) return <span className="estado estado-inactivo">Desactivado</span>;
  return <span className={`estado estado-${estado.toLowerCase()}`}>{ESTADOS_OPERATIVOS[estado] || estado}</span>;
}
