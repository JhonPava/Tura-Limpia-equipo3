import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { IconoCalendario, IconoConductor, IconoRuta, IconoVehiculo } from '../components/Iconos.jsx';

// Lo que el frontend agrega a cada módulo: ícono, descripción y entrega en la que se construye.
// La clave es la ruta que manda el backend sin la barra (por ejemplo '/vehiculos' → 'vehiculos').
export const MODULOS_INFO = {
  vehiculos: { Icono: IconoVehiculo, entrega: 2, descripcion: 'Flota, estados operativos y disponibilidad.' },
  conductores: { Icono: IconoConductor, entrega: 2, descripcion: 'Personal, licencias y estado.' },
  rutas: { Icono: IconoRuta, entrega: 3, descripcion: 'Recorridos en el mapa, barrios y estado.' },
  programacion: { Icono: IconoCalendario, entrega: 4, descripcion: 'Turnos y programación del servicio.' },
};

function textoTotal(total) {
  return total === 1 ? '1 registro' : `${total} registros`;
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const [modulos, setModulos] = useState(null);
  const [error, setError] = useState('');

  // Los módulos y sus totales llegan del backend (GET /api/dashboard), que solo responde a administradores.
  useEffect(() => {
    api('/api/dashboard')
      .then((datos) => setModulos(datos.modulos))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="encabezado">
        <h1>Hola, {usuario.nombre.split(' ')[0]}</h1>
        <p className="texto-suave">Panel administrativo del servicio de recolección de Buenaventura.</p>
      </div>

      {error && (
        <div className="alerta alerta-error" role="alert">
          {error}
        </div>
      )}

      {!modulos && !error && <div className="spinner" aria-label="Cargando módulos" />}

      {modulos && (
        <section className="modulos" aria-label="Módulos del sistema">
          {modulos.map((m) => {
            const clave = m.ruta.replace(/^\//, '');
            const { Icono, entrega, descripcion } = MODULOS_INFO[clave] || {};
            return (
              <Link key={m.ruta} to={m.ruta} className="modulo">
                <span className="modulo-icono">{Icono && <Icono />}</span>
                <h2>{m.nombre}</h2>
                <p>{descripcion}</p>
                <span className="etiqueta etiqueta-ok">{textoTotal(m.total)}</span>
                {entrega && <span className="etiqueta">Disponible en la entrega {entrega}</span>}
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}
