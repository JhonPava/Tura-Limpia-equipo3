/**
 * Seguridad y acceso: barrios, usuarios, roles, perfiles y sesiones.
 * MER: BARRIO, USUARIO, ROL, PERFIL (RESIDE, TIENE, ASIGNA).
 * La tabla `sesiones` permite invalidar un token al cerrar sesión.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  await knex.schema.createTable('barrio', (t) => {
    t.increments('id_barrio');
    t.string('nombre_barrio', 100).notNullable();
    t.string('comuna', 50);
    t.string('estado', 20).notNullable().defaultTo('ACTIVO').checkIn(['ACTIVO', 'INACTIVO']);
    t.unique(['nombre_barrio', 'comuna']);
  });

  // USUARIO (0,1) RESIDE en BARRIO
  await knex.schema.createTable('usuario', (t) => {
    t.increments('id_usuario');
    t.string('nombres', 100).notNullable();
    t.string('apellidos', 100);
    t.string('documento', 20).unique();
    t.string('nombre_usuario', 50).notNullable().unique();
    t.string('correo', 150).notNullable();
    t.text('contrasena_hash').notNullable();
    t.timestamp('fecha_registro', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.string('estado', 20).notNullable().defaultTo('ACTIVO')
      .checkIn(['ACTIVO', 'INACTIVO', 'BLOQUEADO']);
    t.integer('id_barrio').references('id_barrio').inTable('barrio').onDelete('SET NULL');
    t.index('id_barrio');
  });
  // El correo es único sin importar mayúsculas
  await knex.raw('CREATE UNIQUE INDEX uq_usuario_correo ON usuario (lower(correo))');

  // Atributo multivaluado "telefono"
  await knex.schema.createTable('usuario_telefono', (t) => {
    t.integer('id_usuario').notNullable()
      .references('id_usuario').inTable('usuario').onDelete('CASCADE');
    t.string('telefono', 20).notNullable();
    t.primary(['id_usuario', 'telefono']);
  });

  await knex.schema.createTable('rol', (t) => {
    t.increments('id_rol');
    t.string('nombre_rol', 50).notNullable().unique();
    t.string('estado', 20).notNullable().defaultTo('ACTIVO').checkIn(['ACTIVO', 'INACTIVO']);
  });

  // PERFIL: USUARIO (1) TIENE PERFIL (N); ROL (1) ASIGNA PERFIL (N)
  await knex.schema.createTable('perfil', (t) => {
    t.increments('id_perfil');
    t.integer('id_usuario').notNullable()
      .references('id_usuario').inTable('usuario').onDelete('CASCADE');
    t.integer('id_rol').notNullable().references('id_rol').inTable('rol');
    t.date('fecha_inicio').notNullable().defaultTo(knex.raw('CURRENT_DATE'));
    t.date('fecha_fin');
    t.string('estado', 20).notNullable().defaultTo('ACTIVO').checkIn(['ACTIVO', 'INACTIVO']);
    t.check('fecha_fin IS NULL OR fecha_fin >= fecha_inicio', [], 'ck_perfil_fechas');
    t.index('id_rol');
  });
  // Un usuario no puede tener dos perfiles activos con el mismo rol
  await knex.raw(`CREATE UNIQUE INDEX uq_perfil_activo_por_rol
                    ON perfil (id_usuario, id_rol) WHERE estado = 'ACTIVO'`);

  // Sesión abierta por cada login; el JWT lleva id_sesion
  await knex.schema.createTable('sesiones', (t) => {
    t.uuid('id_sesion').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.integer('id_usuario').notNullable()
      .references('id_usuario').inTable('usuario').onDelete('CASCADE');
    t.timestamp('creada_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('expira_en', { useTz: true }).notNullable();
    t.timestamp('cerrada_en', { useTz: true });
    t.string('ip', 45);
    t.text('user_agent');
    t.index('id_usuario');
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async (knex) => {
  await knex.schema
    .dropTableIfExists('sesiones')
    .dropTableIfExists('perfil')
    .dropTableIfExists('rol')
    .dropTableIfExists('usuario_telefono')
    .dropTableIfExists('usuario')
    .dropTableIfExists('barrio');
};
