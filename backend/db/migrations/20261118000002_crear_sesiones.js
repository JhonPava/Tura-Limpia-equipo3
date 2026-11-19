// Cada inicio de sesión crea una fila. El token JWT lleva el id de la sesión (jti),
// así el backend puede invalidarlo al cerrar sesión (cerrada_en deja de ser NULL).
export async function up(knex) {
  await knex.schema.createTable('sesiones', (t) => {
    t.uuid('id').primary();
    t.integer('usuario_id').notNullable().references('id').inTable('usuarios').onDelete('CASCADE');
    t.timestamp('creada_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('expira_en', { useTz: true }).notNullable();
    t.timestamp('cerrada_en', { useTz: true }).nullable();
    t.string('ip', 64);
    t.string('user_agent', 255);
    t.index(['usuario_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('sesiones');
}
