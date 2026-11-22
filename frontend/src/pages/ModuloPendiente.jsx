import { Link } from 'react-router-dom';
import { MODULOS_INFO } from './Dashboard.jsx';

// Pantalla temporal de cada módulo: el dashboard ya da acceso a los cuatro,
// y cada uno se construye en su entrega.
export default function ModuloPendiente({ clave, nombre }) {
  const { Icono, entrega } = MODULOS_INFO[clave];
  return (
    <div className="tarjeta-mensaje">
      <span className="modulo-icono" style={{ margin: '0 auto 12px' }}>
        <Icono />
      </span>
      <h1>{nombre}</h1>
      <p>Este módulo se construye en la entrega {entrega}. Por ahora el acceso ya está protegido: solo entra un administrador con sesión.</p>
      <Link to="/dashboard" className="boton">
        Volver al panel
      </Link>
    </div>
  );
}
