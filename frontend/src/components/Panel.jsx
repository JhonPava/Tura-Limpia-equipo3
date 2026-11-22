import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { IconoLogo } from './Iconos.jsx';

// Estructura común de las pantallas del panel: barra superior con la marca,
// el usuario de la sesión y el botón para cerrar sesión.
export default function Panel() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <>
      <header className="barra">
        <Link to="/dashboard" className="marca">
          <IconoLogo size={30} />
          <span>Tura Limpia</span>
        </Link>
        <div className="barra-usuario">
          <div className="usuario-info">
            <strong>{usuario.nombre}</strong>
            <span>Administrador · {usuario.correo}</span>
          </div>
          <button className="boton boton-secundario" onClick={salir} disabled={saliendo}>
            {saliendo ? 'Cerrando…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </>
  );
}
