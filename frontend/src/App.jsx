import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import Login from './pages/Login.jsx';
import { IconoLogo } from './components/Iconos.jsx';

// Parte 1 del frontend: inicio y cierre de sesión.
// La parte 2 reemplaza esta pantalla temporal por el dashboard y las rutas protegidas.
function SesionIniciada() {
  const { usuario, cargando, cerrarSesion } = useAuth();

  if (cargando) {
    return (
      <div className="pantalla-centro">
        <div className="spinner" aria-label="Cargando" />
      </div>
    );
  }
  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <div className="pantalla-centro">
      <div className="tarjeta-mensaje">
        <span style={{ color: 'var(--verde)' }}>
          <IconoLogo size={44} />
        </span>
        <h1>Sesión iniciada</h1>
        <p>
          Bienvenido, {usuario.nombre}. El dashboard se agrega en la parte 2 del frontend.
        </p>
        <button className="boton" onClick={() => cerrarSesion()}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<SesionIniciada />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
