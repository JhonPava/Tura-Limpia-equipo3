const { guardarUsuario } = require('../usuarios');

/**
 * Usuarios para probar el acceso administrativo.
 * El administrador toma sus datos de ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD (.env).
 * Se puede ejecutar varias veces: actualiza los usuarios si ya existen.
 *
 * @param {import('knex').Knex} knex
 */
exports.seed = async (knex) => {
  const usuarios = [
    {
      nombres: process.env.ADMIN_NOMBRE || 'Administrador General',
      email: process.env.ADMIN_EMAIL || 'admin@turalimpia.co',
      password: process.env.ADMIN_PASSWORD || 'Admin123*',
      rol: 'ADMIN',
    },
    // Para comprobar que alguien sin rol ADMIN no entra al panel
    { nombres: 'Operador', apellidos: 'de Prueba', email: 'operador@turalimpia.co', password: 'Operador123*', rol: 'OPERADOR' },
    // Para comprobar el mensaje de cuenta desactivada
    { nombres: 'Administrador', apellidos: 'Inactivo', email: 'inactivo@turalimpia.co', password: 'Inactivo123*', rol: 'ADMIN', estado: 'INACTIVO' },
  ];

  for (const usuario of usuarios) {
    await guardarUsuario(knex, usuario);
  }
};
