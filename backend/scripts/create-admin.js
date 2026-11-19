// Crea (o restablece) el administrador inicial.
//
// Uso:
//   npm run create-admin
//       -> usa ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD del archivo .env
//   npm run create-admin -- --email jefe@turalimpia.co --password "OtraClave123" --nombre "Jefe de operaciones"
//       -> los argumentos tienen prioridad sobre el .env
//
// Si el correo ya existe, actualiza su contraseña y lo deja como ADMIN activo.
import 'dotenv/config';
import { parseArgs } from 'node:util';
import { db } from '../src/db.js';
import { crearOActualizarUsuario } from '../src/services/usuarios.service.js';

const { values } = parseArgs({
  options: {
    nombre: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
  },
});

try {
  const admin = await crearOActualizarUsuario(db, {
    nombre: values.nombre || process.env.ADMIN_NOMBRE || 'Administrador',
    email: values.email || process.env.ADMIN_EMAIL,
    password: values.password || process.env.ADMIN_PASSWORD,
    rol: 'ADMIN',
  });
  console.log(`✔ Administrador listo: ${admin.email} (id ${admin.id})`);
} catch (err) {
  console.error(`✘ No se pudo crear el administrador: ${err.message}`);
  process.exitCode = 1;
} finally {
  await db.destroy();
}
