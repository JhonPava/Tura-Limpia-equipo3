/**
 * Entrega 2: ajustes para vehículos y conductores.
 *
 * - vehiculo.activo: permite "desactivar" un vehículo sin borrarlo. Se separa del estado
 *   operativo porque un vehículo desactivado deja de contarse en la flota, mientras que
 *   FUERA_SERVICIO es un estado temporal de un vehículo que sigue en la flota.
 * - conductor.categoria_licencia: solo acepta las categorías de licencia de Colombia.
 * - Índices en los estados, porque el dashboard cuenta vehículos y conductores por estado.
 *
 * Es una migración nueva: las migraciones de la entrega 1 no se modifican.
 *
 * @param {import('knex').Knex} knex
 */
const CATEGORIAS_LICENCIA = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

exports.up = async (knex) => {
  await knex.schema.alterTable('vehiculo', (t) => {
    t.boolean('activo').notNullable().defaultTo(true);
    t.index(['activo', 'estado_operativo'], 'ix_vehiculo_activo_estado');
  });

  await knex.schema.alterTable('conductor', (t) => {
    t.check(
      `categoria_licencia IN (${CATEGORIAS_LICENCIA.map((c) => `'${c}'`).join(', ')})`,
      [],
      'ck_conductor_categoria_licencia',
    );
    t.index('estado', 'ix_conductor_estado');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('conductor', (t) => {
    t.dropIndex('estado', 'ix_conductor_estado');
    t.dropChecks('ck_conductor_categoria_licencia');
  });

  await knex.schema.alterTable('vehiculo', (t) => {
    t.dropIndex(['activo', 'estado_operativo'], 'ix_vehiculo_activo_estado');
    t.dropColumn('activo');
  });
};
