/**
 * Catálogos base: roles, días de la semana y turnos.
 * Se puede ejecutar varias veces sin duplicar datos.
 *
 * @param {import('knex').Knex} knex
 */
exports.seed = async (knex) => {
  await knex('rol')
    .insert(['ADMIN', 'OPERADOR', 'CONDUCTOR'].map((nombre_rol) => ({ nombre_rol })))
    .onConflict('nombre_rol').ignore();

  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  await knex('dia_semana')
    .insert(dias.map((nombre_dia, i) => ({ id_dia: i + 1, nombre_dia })))
    .onConflict('id_dia').ignore();

  await knex('turno')
    .insert([
      { nombre_turno: 'MAÑANA', hora_inicio: '06:00', hora_fin: '14:00' },
      { nombre_turno: 'TARDE', hora_inicio: '14:00', hora_fin: '22:00' },
      { nombre_turno: 'NOCHE', hora_inicio: '22:00', hora_fin: '06:00' },
    ])
    .onConflict('nombre_turno').ignore();
};
