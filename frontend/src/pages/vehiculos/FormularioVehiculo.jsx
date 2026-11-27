import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { AlertaError, Campo, erroresDelFormulario } from '../../components/Formulario.jsx';
import { ESTADOS_OPERATIVOS, TIPOS_VEHICULO } from './vehiculosInfo.jsx';
import './Vehiculos.css';

const VACIO = {
  placa: '',
  numInterno: '',
  tipo: '',
  marca: '',
  modelo: '',
  capacidadTon: '',
  fechaAdquisicion: '',
  estadoOperativo: 'DISPONIBLE',
};

/**
 * Formulario para registrar (POST /api/vehiculos) o editar (PUT /api/vehiculos/:id) un vehículo.
 * Si la URL trae :id es edición: primero carga el vehículo y llena los campos.
 *
 * Las validaciones las hace el backend; si algo está mal, el mensaje de cada campo
 * se muestra debajo de ese campo y el mensaje general arriba.
 */
export default function FormularioVehiculo() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navegar = useNavigate();

  const [datos, setDatos] = useState(VACIO);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!esEdicion) return;
    api(`/api/vehiculos/${id}`)
      .then(({ vehiculo }) => setDatos({
        ...vehiculo,
        capacidadTon: String(vehiculo.capacidadTon),
        fechaAdquisicion: vehiculo.fechaAdquisicion || '',
      }))
      .catch((e) => setErrorGeneral(e.message))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  // Al escribir en un campo se borra su error, para que el usuario vea que ya lo corrigió.
  function cambiar(e) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setErrorGeneral('');
    setErrores({});

    const cuerpo = {
      placa: datos.placa,
      numInterno: datos.numInterno,
      tipo: datos.tipo || undefined,
      marca: datos.marca,
      modelo: datos.modelo,
      capacidadTon: datos.capacidadTon,
      fechaAdquisicion: datos.fechaAdquisicion || null,
      estadoOperativo: datos.estadoOperativo,
    };

    try {
      const { vehiculo } = esEdicion
        ? await api(`/api/vehiculos/${id}`, { method: 'PUT', body: cuerpo })
        : await api('/api/vehiculos', { method: 'POST', body: cuerpo });
      navegar(`/vehiculos/${vehiculo.idVehiculo}`, {
        state: { aviso: esEdicion ? 'Los cambios se guardaron.' : `Vehículo ${vehiculo.placa} registrado.` },
      });
    } catch (error) {
      const { general, campos } = erroresDelFormulario(error);
      setErrorGeneral(general);
      setErrores(campos);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  }

  // Atajo para no repetir lo mismo en cada input
  const propsCampo = (nombre) => ({
    id: nombre,
    name: nombre,
    value: datos[nombre],
    onChange: cambiar,
    'aria-invalid': errores[nombre] ? 'true' : undefined,
    'aria-describedby': errores[nombre] ? `${nombre}-error` : undefined,
  });

  const volverA = esEdicion ? `/vehiculos/${id}` : '/vehiculos';

  return (
    <>
      <div className="encabezado">
        <Link to={volverA} className="migas">← {esEdicion ? 'Volver al vehículo' : 'Vehículos'}</Link>
        <h1>{esEdicion ? `Editar vehículo ${datos.placa}` : 'Registrar vehículo'}</h1>
        <p className="texto-suave">Los campos con * son obligatorios.</p>
      </div>

      {cargando ? (
        <div className="spinner" aria-label="Cargando vehículo" />
      ) : (
        <form className="formulario-tarjeta" onSubmit={guardar} noValidate>
          <div style={{ height: 16 }} />
          <AlertaError mensaje={errorGeneral} />

          <div className="formulario-grilla">
            <Campo id="placa" etiqueta="Placa" obligatorio error={errores.placa} ayuda="3 letras y 3 números, por ejemplo ABC123.">
              <input {...propsCampo('placa')} placeholder="ABC123" maxLength={10} autoFocus={!esEdicion} />
            </Campo>

            <Campo id="numInterno" etiqueta="Número interno" obligatorio error={errores.numInterno}>
              <input {...propsCampo('numInterno')} placeholder="V-07" maxLength={20} />
            </Campo>

            <Campo id="tipo" etiqueta="Tipo de vehículo" obligatorio error={errores.tipo}>
              <select {...propsCampo('tipo')}>
                <option value="">Selecciona un tipo</option>
                {Object.entries(TIPOS_VEHICULO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </Campo>

            <Campo id="estadoOperativo" etiqueta="Estado operativo" obligatorio error={errores.estadoOperativo}>
              <select {...propsCampo('estadoOperativo')}>
                {Object.entries(ESTADOS_OPERATIVOS).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </Campo>

            <Campo id="marca" etiqueta="Marca" obligatorio error={errores.marca}>
              <input {...propsCampo('marca')} placeholder="Chevrolet" maxLength={50} />
            </Campo>

            <Campo id="modelo" etiqueta="Modelo" obligatorio error={errores.modelo}>
              <input {...propsCampo('modelo')} placeholder="NPR 2024" maxLength={50} />
            </Campo>

            <Campo id="capacidadTon" etiqueta="Capacidad (toneladas)" obligatorio error={errores.capacidadTon}>
              <input {...propsCampo('capacidadTon')} type="number" inputMode="decimal" step="0.1" min="0" placeholder="8.5" />
            </Campo>

            <Campo id="fechaAdquisicion" etiqueta="Fecha de adquisición" error={errores.fechaAdquisicion} ayuda="Opcional.">
              <input {...propsCampo('fechaAdquisicion')} type="date" />
            </Campo>
          </div>

          <div className="formulario-acciones">
            <Link to={volverA} className="boton boton-secundario">Cancelar</Link>
            <button type="submit" className="boton" disabled={guardando}>
              {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar vehículo'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
