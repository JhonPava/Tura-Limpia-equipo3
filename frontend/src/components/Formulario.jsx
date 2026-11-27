import './Formulario.css';

/**
 * Piezas comunes para los formularios del panel (vehículos, conductores…).
 *
 * El backend responde los errores así:
 *   { error: { codigo, mensaje, detalles: { placa: ['La placa es obligatoria.'], ... } } }
 * - "mensaje" se muestra arriba del formulario (AlertaError).
 * - "detalles" trae el mensaje de cada campo y se muestra debajo de ese campo (Campo).
 */

/** Recuadro rojo con el mensaje general del error. No muestra nada si no hay mensaje. */
export function AlertaError({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="alerta alerta-error" role="alert">
      {mensaje}
    </div>
  );
}

/** Recuadro verde para confirmar que algo se guardó. */
export function AlertaExito({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="alerta alerta-exito" role="status">
      {mensaje}
    </div>
  );
}

/**
 * Un campo del formulario: etiqueta, control y, si hay, el error de ese campo debajo.
 *
 * Uso:
 *   <Campo id="placa" etiqueta="Placa" error={errores.placa} ayuda="Ejemplo: ABC123">
 *     <input id="placa" ... />
 *   </Campo>
 *
 * "error" puede ser un texto o la lista que manda el backend (se muestra el primero).
 */
export function Campo({ id, etiqueta, error, ayuda, obligatorio = false, children }) {
  const textoError = Array.isArray(error) ? error[0] : error;
  return (
    <div className={`campo${textoError ? ' campo-con-error' : ''}`}>
      <label htmlFor={id}>
        {etiqueta}
        {obligatorio && <span className="campo-obligatorio" aria-hidden="true"> *</span>}
      </label>
      {children}
      {textoError ? (
        <p className="campo-error" id={`${id}-error`} role="alert">
          {textoError}
        </p>
      ) : (
        ayuda && <p className="campo-ayuda">{ayuda}</p>
      )}
    </div>
  );
}

/**
 * Convierte el error de la API en lo que necesita un formulario:
 * - general: el mensaje para la AlertaError (si fallan varios campos, uno que invita a revisarlos).
 * - campos: los errores de cada campo (vacío si el error no trae detalles).
 */
export function erroresDelFormulario(error) {
  const campos = error?.detalles || {};
  // Si fallan varios campos, el mensaje de arriba invita a revisarlos (cada uno tiene su mensaje debajo).
  const general = Object.keys(campos).length > 1
    ? 'Revisa los campos marcados en rojo.'
    : error?.message || 'Ocurrió un error inesperado.';
  return { general, campos };
}
