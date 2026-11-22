import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { esAdmin, useAuth } from './AuthContext.jsx';

// Deja pasar solo a un administrador con sesión iniciada.
// Quien decide de verdad es el backend (cada endpoint valida el token y el rol);
// esto evita que se vean pantallas del panel sin haber iniciado sesión.
export default function RutaProtegida() {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) {
    return (
      <div className="pantalla-centro">
        <div className="spinner" aria-label="Cargando" />
      </div>
    );
  }
  if (!esAdmin(usuario)) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  return <Outlet />;
}
