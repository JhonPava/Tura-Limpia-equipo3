import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { AlertaError, AlertaExito } from '../../components/Formulario.jsx';
import { EstadoVehiculo, TIPOS_VEHICULO, formatoFecha } from './vehiculosInfo.jsx';
import './Vehiculos.css';

/**
 * Detalle de un vehículo (GET /api/vehiculos/:id) con los botones para editar y desactivar
 * (PATCH /api/vehiculos/:id/desactivar). Desactivar no borra: el vehículo deja de salir
 * en la lista y en el dashboard, pero se conserva su historial.
 */
export default function DetalleVehiculo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [vehiculo, setVehiculo] = useState(null);
  const [error, setError] = useState('');
  const [noExiste, setNoExiste] = useState(false);
  const [desactivando, setDesactivando] = useState(false);

  // Mensaje que deja el formulario al guardar; se borra del historial para que no reaparezca al recargar.
  const [aviso, setAviso] = useState(ubicacion.state?.aviso || '');
  useEffect(() => {
    if (ubicacion.state?.aviso) navegar(ubicacion.pathname, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api(`/api/vehiculos/${id}`)
      .then(({ vehiculo: v }) => setVehiculo(v))
      .catch((e) => (e.status === 404 ? setNoExiste(true) : setError(e.message)));
  }, [id]);

  async function desactivar() {
    const confirmado = window.confirm(
      `¿Desactivar el vehículo ${vehiculo.placa}?\n\nDejará de aparecer en la lista y en el dashboard, pero no se borra su historial.`,
    );
    if (!confirmado) return;

    setDesactivando(true);
    setError('');
    setAviso('');
    try {
      const { vehiculo: v } = await api(`/api/vehiculos/${id}/desactivar`, { method: 'PATCH' });
      setVehiculo(v);
      setAviso(`Vehículo ${v.placa} desactivado.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setDesactivando(false);
    }
  }

  if (noExiste) {
    return (
      <div className="tarjeta-mensaje">
        <h1>Vehículo no encontrado</h1>
        <p>El vehículo que buscas no existe o el enlace está mal escrito.</p>
        <Link to="/vehiculos" className="boton">Ver todos los vehículos</Link>
      </div>
    );
  }

  return (
    <>
      <div className="encabezado">
        <Link to="/vehiculos" className="migas">← Vehículos</Link>
      </div>

      <AlertaExito mensaje={aviso} />
      <AlertaError mensaje={error} />

      {!vehiculo && !error && <div className="spinner" aria-label="Cargando vehículo" />}

      {vehiculo && (
        <section className="detalle-tarjeta">
          <div className="detalle-titulo">
            <h1 className="placa">{vehiculo.placa}</h1>
            <EstadoVehiculo estado={vehiculo.estadoOperativo} activo={vehiculo.activo} />
          </div>
          <p className="texto-suave">
            {TIPOS_VEHICULO[vehiculo.tipo] || vehiculo.tipo} · {vehiculo.marca} {vehiculo.modelo}
          </p>

          {!vehiculo.activo && (
            <div className="alerta alerta-info" style={{ marginTop: 16 }}>
              Este vehículo está desactivado: no aparece en la lista ni en el dashboard.
              Su último estado operativo fue «{vehiculo.estadoOperativo.replace('_', ' ').toLowerCase()}».
            </div>
          )}

          <dl className="detalle-datos">
            <div><dt>Número interno</dt><dd>{vehiculo.numInterno}</dd></div>
            <div><dt>Capacidad</dt><dd>{vehiculo.capacidadTon} toneladas</dd></div>
            <div><dt>Marca</dt><dd>{vehiculo.marca}</dd></div>
            <div><dt>Modelo</dt><dd>{vehiculo.modelo}</dd></div>
            <div><dt>Fecha de adquisición</dt><dd>{formatoFecha(vehiculo.fechaAdquisicion)}</dd></div>
            <div><dt>Estado operativo</dt><dd><EstadoVehiculo estado={vehiculo.estadoOperativo} /></dd></div>
          </dl>

          {vehiculo.activo && (
            <div className="detalle-acciones">
              <Link to={`/vehiculos/${vehiculo.idVehiculo}/editar`} className="boton">Editar</Link>
              <button type="button" className="boton boton-peligro" onClick={desactivar} disabled={desactivando}>
                {desactivando ? 'Desactivando…' : 'Desactivar'}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
