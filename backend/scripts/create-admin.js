/**
 * Crea el administrador inicial o restablece su contraseña.
 *
 *   npm run create-admin
 *   npm run create-admin -- --email jefe@turalimpia.co --password "ClaveSegura123" --nombre "Jefe de operaciones"
 *
 * Sin argumentos usa ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_NOMBRE del .env.
 * Si el correo ya existe, actualiza la contraseña y lo deja como administrador activo.
 */
const { parseArgs } = require('node:util');
const knex = require('knex')(require('../knexfile'));
const { guardarUsuario } = require('../db/usuarios');

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      password: { type: 'string' },
      nombre: { type: 'string' },
    },
  });

  const email = values.email ?? process.env.ADMIN_EMAIL;
  const password = values.password ?? process.env.ADMIN_PASSWORD;
  const nombre = values.nombre ?? process.env.ADMIN_NOMBRE ?? 'Administrador';

  if (!email || !password) {
    throw new Error('Indica --email y --password, o define ADMIN_EMAIL y ADMIN_PASSWORD en .env');
  }

  const { idUsuario, creado } = await guardarUsuario(knex, {
    nombres: nombre,
    email,
    password,
    rol: 'ADMIN',
    estado: 'ACTIVO',
  });

  console.log(creado
    ? `Administrador creado: ${email} (id ${idUsuario})`
    : `Administrador actualizado: ${email} (id ${idUsuario}). Contraseña restablecida y cuenta activa.`);
}

main()
  .catch((error) => {
    console.error(`No se pudo crear el administrador: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());
