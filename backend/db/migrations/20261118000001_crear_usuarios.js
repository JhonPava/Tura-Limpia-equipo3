// Tabla de usuarios del panel administrativo.
export async function up(knex) {
  await knex.schema.createTable('usuarios', (t) => {
    t.increments('id').primary();
    t.string('nombre', 120).notNullable();
    t.string('email', 160).notNullable().unique();
    t.string('password_hash').notNullable();
    t.enu('rol', ['ADMIN', 'OPERADOR'], { useNative: true, enumName: 'rol_usuario' })
      .notNullable()
      .defaultTo('OPERADOR');
    t.boolean('activo').notNullable().defaultTo(true);
    t.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('actualizado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('usuarios');
  await knex.raw('DROP TYPE IF EXISTS rol_usuario');
}
