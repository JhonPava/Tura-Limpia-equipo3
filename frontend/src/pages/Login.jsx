import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { IconoLogo } from '../components/Iconos.jsx';

export default function Login() {
  const { usuario, iniciarSesion, cerrarSesion, aviso, setAviso } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario?.rol === 'ADMIN') return <Navigate to="/dashboard" replace />;

  async function alEnviar(e) {
    e.preventDefault();
    setError('');
    setAviso('');
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    try {
      const u = await iniciarSesion(email.trim(), password);
      if (u.rol !== 'ADMIN') {
        await cerrarSesion('');
        setError('Esta cuenta no tiene permisos de administrador.');
        return;
      }
      navegar(ubicacion.state?.desde || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <section className="login-lado">
        <div className="login-marca">
          <IconoLogo size={44} />
          <span>Tura Limpia</span>
        </div>
        <div>
          <h1>Gestión de rutas de recolección</h1>
          <p>Vehículos, conductores, rutas y programación del servicio de aseo en Buenaventura, en un solo lugar.</p>
        </div>
        <small>Universidad del Pacífico · Seminario de Actualización I</small>
      </section>

      <section className="login-formulario">
        <form onSubmit={alEnviar} noValidate>
          <h2>Iniciar sesión</h2>
          <p className="texto-suave">Acceso exclusivo para administradores.</p>

          {aviso && !error && (
            <div className="alerta alerta-info" role="status">
              {aviso}
            </div>
          )}
          {error && (
            <div className="alerta alerta-error" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@turalimpia.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="boton boton-ancho" type="submit" disabled={enviando}>
            {enviando ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </div>
  );
}
