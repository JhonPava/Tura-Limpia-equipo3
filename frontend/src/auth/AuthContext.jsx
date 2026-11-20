import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenGuardado, EVENTO_SESION_INVALIDA } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(''); // mensaje para mostrar en el login (sesión cerrada/expirada)

  // Al abrir la app: si hay token guardado, el backend confirma si sigue siendo válido.
  useEffect(() => {
    if (!tokenGuardado.obtener()) {
      setCargando(false);
      return;
    }
    api('/api/auth/me')
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => tokenGuardado.borrar())
      .finally(() => setCargando(false));
  }, []);

  // Si cualquier petición recibe 401, se cierra la sesión local.
  useEffect(() => {
    const alInvalidar = (e) => {
      tokenGuardado.borrar();
      setUsuario(null);
      setAviso(e.detail || 'Tu sesión terminó. Inicia sesión de nuevo.');
    };
    window.addEventListener(EVENTO_SESION_INVALIDA, alInvalidar);
    return () => window.removeEventListener(EVENTO_SESION_INVALIDA, alInvalidar);
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const { token, usuario } = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      autenticado: false,
    });
    tokenGuardado.guardar(token);
    setAviso('');
    setUsuario(usuario);
    return usuario;
  }, []);

  const cerrarSesion = useCallback(async (mensaje = 'Cerraste sesión correctamente.') => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // Aunque el backend no responda, cerramos la sesión en el navegador.
    }
    tokenGuardado.borrar();
    setUsuario(null);
    setAviso(mensaje);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, aviso, setAviso, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
