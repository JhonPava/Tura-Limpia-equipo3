import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { AlertaError, AlertaExito } from '../../components/Formulario.jsx';
import { ESTADOS_OPERATIVOS, EstadoVehiculo, TIPOS_VEHICULO } from './vehiculosInfo.jsx';
import './Vehiculos.css';

/**
 * Lista de vehículos (GET /api/vehiculos).
 * Filtros: texto (placa, número interno, marca o modelo), estado operativo y ver desactivados.
 */
export default function ListaVehiculos() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [vehiculos, setVehiculos] = useState(null);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [estado, setEstado] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  // Mensaje que deja otra pantalla al volver (por ejemplo "Vehículo desactivado").
  // Se guarda y se borra del historial para que no reaparezca al recargar.
  const [aviso] = useState(ubicacion.state?.aviso || '');
  useEffect(() => {
    if (ubicacion.state?.aviso) navegar(ubicacion.pathname, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Espera un momento mientras se escribe, para no consultar en cada tecla.
    const espera = setTimeout(() => {
      const parametros = new URLSearchParams();
      if (buscar.trim()) parametros.set('buscar', buscar.trim());
      if (estado) parametros.set('estado', estado);
      if (incluirInactivos) parametros.set('incluirInactivos', 'true');

      setError('');
      api(`/api/vehiculos?${parametros}`)
        .then((datos) => setVehiculos(datos.vehiculos))
        .catch((e) => {
          setError(e.message);
          setVehiculos([]);
        });
    }, 250);
    return () => clearTimeout(espera);
  }, [buscar, estado, incluirInactivos]);

  return (
    <>
      <div className="encabezado encabezado-con-accion">
        <div>
          <Link to="/dashboard" className="migas">← Panel</Link>
          <h1>Vehículos</h1>
          <p className="texto-suave">Flota de recolección, estado operativo y disponibilidad.</p>
        </div>
        <Link to="/vehiculos/nuevo" className="boton">
          + Registrar vehículo
        </Link>
      </div>

      <AlertaExito mensaje={aviso} />

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por placa, número interno, marca o modelo"
          aria-label="Buscar vehículos"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <select aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_OPERATIVOS).map(([valor, texto]) => (
            <option key={valor} value={valor}>{texto}</option>
          ))}
        </select>
        <label className="casilla">
          <input
            type="checkbox"
            checked={incluirInactivos}
            onChange={(e) => setIncluirInactivos(e.target.checked)}
          />
          Ver desactivados
        </label>
      </div>

      <AlertaError mensaje={error} />

      {vehiculos === null && <div className="spinner" aria-label="Cargando vehículos" />}

      {vehiculos?.length === 0 && !error && (
        <div className="tabla-vacia">
          {buscar || estado ? 'Ningún vehículo coincide con la búsqueda.' : 'Todavía no hay vehículos registrados.'}
        </div>
      )}

      {vehiculos?.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Placa</th>
                <th>N.º interno</th>
                <th>Tipo</th>
                <th>Marca y modelo</th>
                <th className="numero">Capacidad</th>
                <th>Estado</th>
                <th><span className="solo-lector">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr
                  key={v.idVehiculo}
                  className={v.activo ? '' : 'fila-inactiva'}
                  onClick={() => navegar(`/vehiculos/${v.idVehiculo}`)}
                >
                  <td><strong className="placa">{v.placa}</strong></td>
                  <td>{v.numInterno}</td>
                  <td>{TIPOS_VEHICULO[v.tipo] || v.tipo}</td>
                  <td>{v.marca} · {v.modelo}</td>
                  <td className="numero">{v.capacidadTon} t</td>
                  <td><EstadoVehiculo estado={v.estadoOperativo} activo={v.activo} /></td>
                  <td className="acciones" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/vehiculos/${v.idVehiculo}`}>Ver</Link>
                    {v.activo && <Link to={`/vehiculos/${v.idVehiculo}/editar`}>Editar</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tabla-total">
            {vehiculos.length === 1 ? '1 vehículo' : `${vehiculos.length} vehículos`}
          </p>
        </div>
      )}
    </>
  );
}
