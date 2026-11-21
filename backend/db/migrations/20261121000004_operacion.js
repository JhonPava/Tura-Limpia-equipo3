/**
 * Operación: ejecución de rutas, GPS y novedades.
 * MER: EJECUCION_RUTA, UBICACION_GPS, NOVEDAD
 *      (SE_EJECUTA, PARTICIPA, CUMPLE, RASTREA, OCURRE_EN, INFORMA).
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ASIGNACION (1) SE_EJECUTA EJECUCION_RUTA (1,1)
  await knex.schema.createTable('ejecucion_ruta', (t) => {
    t.increments('id_ejecucion');
    t.integer('id_asignacion').notNullable().unique()
      .references('id_asignacion').inTable('asignacion');
    t.timestamp('fecha_hora_inicio', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('fecha_hora_fin', { useTz: true });
    // Atributo derivado duracion_real
    t.specificType('duracion_real',
      'interval GENERATED ALWAYS AS (fecha_hora_fin - fecha_hora_inicio) STORED');
    t.text('observaciones');
    t.string('estado', 20).notNullable().defaultTo('EN_CURSO')
      .checkIn(['EN_CURSO', 'FINALIZADA', 'INTERRUMPIDA']);
    t.check('fecha_hora_fin IS NULL OR fecha_hora_fin >= fecha_hora_inicio', [],
      'ck_ejecucion_fechas');
  });

  // CUADRILLA (M) PARTICIPA EJECUCION_RUTA (N), con hora_inicio y hora_fin
  await knex.schema.createTable('ejecucion_cuadrilla', (t) => {
    t.integer('id_ejecucion').notNullable()
      .references('id_ejecucion').inTable('ejecucion_ruta').onDelete('CASCADE');
    t.integer('id_cuadrilla').notNullable().references('id_cuadrilla').inTable('cuadrilla');
    t.time('hora_inicio').notNullable();
    t.time('hora_fin');
    t.primary(['id_ejecucion', 'id_cuadrilla']);
  });

  // EJECUCION_RUTA (N) CUMPLE PARADA_RUTA (M), con hora_llegada_real y observacion
  await knex.schema.createTable('cumplimiento_parada', (t) => {
    t.integer('id_ejecucion').notNullable()
      .references('id_ejecucion').inTable('ejecucion_ruta').onDelete('CASCADE');
    t.integer('id_parada').notNullable().references('id_parada').inTable('parada_ruta');
    t.timestamp('hora_llegada_real', { useTz: true }).notNullable();
    t.text('observacion');
    t.primary(['id_ejecucion', 'id_parada']);
    t.index('id_parada');
  });

  // EJECUCION_RUTA (1) RASTREA UBICACION_GPS (N)
  await knex.schema.createTable('ubicacion_gps', (t) => {
    t.bigIncrements('id_ubicacion');
    t.integer('id_ejecucion').notNullable()
      .references('id_ejecucion').inTable('ejecucion_ruta').onDelete('CASCADE');
    t.decimal('latitud', 9, 6).notNullable().checkBetween([-90, 90]);
    t.decimal('longitud', 9, 6).notNullable().checkBetween([-180, 180]);
    t.timestamp('fecha_hora', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.decimal('velocidad', 5, 2); // km/h
    t.check('velocidad IS NULL OR velocidad >= 0', [], 'ck_ubicacion_velocidad');
    t.index(['id_ejecucion', 'fecha_hora']);
  });

  // PERFIL (1) INFORMA NOVEDAD (N); EJECUCION_RUTA (1) OCURRE_EN NOVEDAD (0,1)
  await knex.schema.createTable('novedad', (t) => {
    t.increments('id_novedad');
    t.integer('id_perfil').notNullable().references('id_perfil').inTable('perfil');
    t.integer('id_ejecucion').references('id_ejecucion').inTable('ejecucion_ruta');
    t.string('tipo_novedad', 40).notNullable();
    t.text('descripcion').notNullable();
    t.string('direccion_ref', 200);
    t.timestamp('fecha_hora', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.string('estado', 20).notNullable().defaultTo('ABIERTA')
      .checkIn(['ABIERTA', 'EN_PROCESO', 'CERRADA']);
    t.index('id_perfil');
    t.index('id_ejecucion');
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async (knex) => {
  await knex.schema
    .dropTableIfExists('novedad')
    .dropTableIfExists('ubicacion_gps')
    .dropTableIfExists('cumplimiento_parada')
    .dropTableIfExists('ejecucion_cuadrilla')
    .dropTableIfExists('ejecucion_ruta');
};
