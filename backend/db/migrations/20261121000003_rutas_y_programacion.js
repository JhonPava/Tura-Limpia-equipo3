/**
 * Rutas, vehículos, turnos, programación y asignación.
 * MER: MACRORUTA, MICRORUTA, PARADA_RUTA, DIA_SEMANA, TURNO, VEHICULO,
 *      PROGRAMACION_RUTA, ASIGNACION
 *      (COMPRENDE, INCLUYE, VISITA, PROGRAMA, ATIENDE, SE_REPITE,
 *       GENERA, ASIGNADO, CONDUCE, CUBRE).
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  await knex.schema.createTable('macroruta', (t) => {
    t.increments('id_macroruta');
    t.string('nombre_macroruta', 100).notNullable().unique();
    t.text('descripcion');
    t.string('tipo_servicio', 20).notNullable().checkIn(['RECOLECCION', 'BARRIDO']);
    t.string('estado', 20).notNullable().defaultTo('ACTIVA')
      .checkIn(['ACTIVA', 'SUSPENDIDA', 'INACTIVA']);
  });

  // MACRORUTA (1) COMPRENDE MICRORUTA (N)
  await knex.schema.createTable('microruta', (t) => {
    t.increments('id_microruta');
    t.integer('id_macroruta').notNullable().references('id_macroruta').inTable('macroruta');
    t.string('nombre_microruta', 100).notNullable();
    t.text('trazado'); // GeoJSON del recorrido para el mapa
    t.string('estado', 20).notNullable().defaultTo('ACTIVA').checkIn(['ACTIVA', 'INACTIVA']);
    t.unique(['id_macroruta', 'nombre_microruta']);
  });

  // MICRORUTA (1) INCLUYE PARADA_RUTA (N); BARRIO (1) VISITA PARADA_RUTA (N)
  await knex.schema.createTable('parada_ruta', (t) => {
    t.increments('id_parada');
    t.integer('id_microruta').notNullable().references('id_microruta').inTable('microruta');
    t.integer('id_barrio').notNullable().references('id_barrio').inTable('barrio');
    t.smallint('orden_visita').notNullable().checkPositive();
    t.time('hora_estimada_llegada');
    t.string('estado', 20).notNullable().defaultTo('ACTIVA').checkIn(['ACTIVA', 'INACTIVA']);
    t.unique(['id_microruta', 'orden_visita']);
    t.index('id_barrio');
  });

  await knex.schema.createTable('dia_semana', (t) => {
    t.smallint('id_dia').primary().checkBetween([1, 7]); // 1 = lunes ... 7 = domingo
    t.string('nombre_dia', 10).notNullable().unique();
  });

  await knex.schema.createTable('turno', (t) => {
    t.increments('id_turno');
    t.string('nombre_turno', 30).notNullable().unique();
    t.time('hora_inicio').notNullable();
    t.time('hora_fin').notNullable(); // puede ser menor que hora_inicio (turno de noche)
    t.string('estado', 20).notNullable().defaultTo('ACTIVO').checkIn(['ACTIVO', 'INACTIVO']);
  });

  await knex.schema.createTable('vehiculo', (t) => {
    t.increments('id_vehiculo');
    t.string('placa', 10).notNullable().unique();
    t.string('num_interno', 20).notNullable().unique();
    t.string('tipo', 30).notNullable();
    t.string('marca', 50).notNullable();
    t.string('modelo', 50).notNullable();
    t.decimal('capacidad_ton', 5, 2).notNullable().checkPositive();
    t.date('fecha_adquisicion');
    t.string('estado_operativo', 20).notNullable().defaultTo('DISPONIBLE')
      .checkIn(['DISPONIBLE', 'EN_SERVICIO', 'MANTENIMIENTO', 'FUERA_SERVICIO']);
  });

  // MACRORUTA (1) PROGRAMA PROGRAMACION_RUTA (N); CUADRILLA (1) ATIENDE PROGRAMACION_RUTA (N)
  await knex.schema.createTable('programacion_ruta', (t) => {
    t.increments('id_programacion');
    t.integer('id_macroruta').notNullable().references('id_macroruta').inTable('macroruta');
    t.integer('id_cuadrilla').notNullable().references('id_cuadrilla').inTable('cuadrilla');
    t.date('vigencia_desde').notNullable();
    t.date('vigencia_hasta');
    t.string('estado', 20).notNullable().defaultTo('ACTIVA')
      .checkIn(['ACTIVA', 'SUSPENDIDA', 'FINALIZADA']);
    t.check('vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde', [],
      'ck_programacion_vigencia');
    t.index('id_macroruta');
    t.index('id_cuadrilla');
  });

  // PROGRAMACION_RUTA (M) SE_REPITE DIA_SEMANA (N)
  await knex.schema.createTable('programacion_dia', (t) => {
    t.integer('id_programacion').notNullable()
      .references('id_programacion').inTable('programacion_ruta').onDelete('CASCADE');
    t.smallint('id_dia').notNullable().references('id_dia').inTable('dia_semana');
    t.primary(['id_programacion', 'id_dia']);
  });

  // PROGRAMACION_RUTA (1) GENERA ASIGNACION (N)
  // VEHICULO ASIGNADO (0,1), CONDUCTOR CONDUCE (0,1), TURNO CUBRE (1,1)
  await knex.schema.createTable('asignacion', (t) => {
    t.increments('id_asignacion');
    t.integer('id_programacion').notNullable()
      .references('id_programacion').inTable('programacion_ruta');
    t.integer('id_turno').notNullable().references('id_turno').inTable('turno');
    t.integer('id_vehiculo').references('id_vehiculo').inTable('vehiculo');
    t.integer('id_conductor').references('id_conductor').inTable('conductor');
    t.date('fecha').notNullable();
    t.string('estado', 20).notNullable().defaultTo('PROGRAMADA')
      .checkIn(['PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA']);
    t.unique(['id_programacion', 'fecha', 'id_turno']);
    t.index('fecha');
  });
  // Un vehículo o conductor no puede tener dos asignaciones activas en la misma fecha y turno
  await knex.raw(`CREATE UNIQUE INDEX uq_asignacion_vehiculo ON asignacion (id_vehiculo, fecha, id_turno)
                    WHERE id_vehiculo IS NOT NULL AND estado <> 'CANCELADA'`);
  await knex.raw(`CREATE UNIQUE INDEX uq_asignacion_conductor ON asignacion (id_conductor, fecha, id_turno)
                    WHERE id_conductor IS NOT NULL AND estado <> 'CANCELADA'`);
};

/** @param {import('knex').Knex} knex */
exports.down = async (knex) => {
  await knex.schema
    .dropTableIfExists('asignacion')
    .dropTableIfExists('programacion_dia')
    .dropTableIfExists('programacion_ruta')
    .dropTableIfExists('vehiculo')
    .dropTableIfExists('turno')
    .dropTableIfExists('dia_semana')
    .dropTableIfExists('parada_ruta')
    .dropTableIfExists('microruta')
    .dropTableIfExists('macroruta');
};
