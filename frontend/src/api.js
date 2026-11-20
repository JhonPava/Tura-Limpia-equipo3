// Cliente HTTP del frontend. Todas las llamadas al backend pasan por aquí.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const CLAVE_TOKEN = 'tura_limpia_token';

export const tokenGuardado = {
  obtener: () => localStorage.getItem(CLAVE_TOKEN),
  guardar: (t) => localStorage.setItem(CLAVE_TOKEN, t),
  borrar: () => localStorage.removeItem(CLAVE_TOKEN),
};

export class ErrorApi extends Error {
  constructor(status, mensaje, codigo) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

// Avisa al resto de la app cuando el backend dice que la sesión ya no es válida.
export const EVENTO_SESION_INVALIDA = 'tura:sesion-invalida';

export async function api(ruta, { method = 'GET', body, autenticado = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenGuardado.obtener();
  if (autenticado && token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.', 'SIN_CONEXION');
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const mensaje = datos?.error?.mensaje || 'Ocurrió un error inesperado.';
    const codigo = datos?.error?.codigo;
    if (respuesta.status === 401 && autenticado && token) {
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_INVALIDA, { detail: mensaje }));
    }
    throw new ErrorApi(respuesta.status, mensaje, codigo);
  }
  return datos;
}
