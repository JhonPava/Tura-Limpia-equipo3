/**
 * Personal: trabajadores, conductores y cuadrillas.
 * MER: TRABAJADOR, CONDUCTOR, CUADRILLA (ES, ES_CONDUCTOR, INTEGRA).
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // PERFIL (0,1) ES TRABAJADOR (1,1)
  await knex.schema.createTable('trabajador', (t) => {
    t.increments('id_trabajador');
    t.integer('id_perfil').notNullable().unique().references('id_perfil').inTable('perfil');
    t.string('cargo', 60).notNullable();
    t.string('estado', 20).notNullable().defaultTo('ACTIVO')
      .checkIn(['ACTIVO', 'INACTIVO', 'VACACIONES', 'INCAPACITADO']);
  });

  // TRABAJADOR (0,1) ES_CONDUCTOR CONDUCTOR (1,1)
  await knex.schema.createTable('conductor', (t) => {
    t.increments('id_conductor');
    t.integer('id_trabajador').notNullable().unique()
      .references('id_trabajador').inTable('trabajador');
    t.string('num_licencia', 30).notNullable().unique();
    t.string('categoria_licencia', 5).notNullable();
    t.date('vencimiento_licencia').notNullable();
    t.string('estado', 20).notNullable().defaultTo('ACTIVO')
      .checkIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']);
  });

  await knex.schema.createTable('cuadrilla', (t) => {
    t.increments('id_cuadrilla');
    t.string('nombre_cuadrilla', 80).notNullable().unique();
    t.string('tipo_cuadrilla', 20).notNullable().checkIn(['RECOLECCION', 'BARRIDO', 'MIXTA']);
    t.string('estado', 20).notNullable().defaultTo('ACTIVA').checkIn(['ACTIVA', 'INACTIVA']);
  });

  // TRABAJADOR (M) INTEGRA CUADRILLA (N), con fecha_inicio y fecha_fin
  await knex.schema.createTable('cuadrilla_trabajador', (t) => {
    t.integer('id_cuadrilla').notNullable().references('id_cuadrilla').inTable('cuadrilla');
    t.integer('id_trabajador').notNullable().references('id_trabajador').inTable('trabajador');
    t.date('fecha_inicio').notNullable().defaultTo(knex.raw('CURRENT_DATE'));
    t.date('fecha_fin');
    t.primary(['id_cuadrilla', 'id_trabajador', 'fecha_inicio']);
    t.check('fecha_fin IS NULL OR fecha_fin >= fecha_inicio', [], 'ck_integra_fechas');
    t.index('id_trabajador');
  });

  // Atributo derivado num_integrantes
  await knex.raw(`
    CREATE VIEW v_cuadrilla AS
    SELECT c.*,
           (SELECT count(*)
              FROM cuadrilla_trabajador ct
             WHERE ct.id_cuadrilla = c.id_cuadrilla
               AND (ct.fecha_fin IS NULL OR ct.fecha_fin >= CURRENT_DATE))::int AS num_integrantes
      FROM cuadrilla c`);
};

/** @param {import('knex').Knex} knex */
exports.down = async (knex) => {
  await knex.raw('DROP VIEW IF EXISTS v_cuadrilla');
  await knex.schema
    .dropTableIfExists('cuadrilla_trabajador')
    .dropTableIfExists('cuadrilla')
    .dropTableIfExists('conductor')
    .dropTableIfExists('trabajador');
};
