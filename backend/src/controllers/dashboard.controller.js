const knex = require('../db');

/**
 * Indicadores del dashboard. Todos se cuentan en la base de datos en cada consulta,
 * así que cambian apenas se registra, edita o desactiva un vehículo o conductor.
 *
 * - Vehículos: solo cuentan los que no están desactivados (activo = true).
 * - Conductores: el total incluye a todos los registrados; "activos" son los de estado ACTIVO.
 */
async function contarVehiculos() {
  const fila = await knex('vehiculo')
    .where({ activo: true })
    .select(
      knex.raw('count(*) as total'),
      knex.raw("count(*) filter (where estado_operativo = 'DISPONIBLE') as disponibles"),
      knex.raw("count(*) filter (where estado_operativo = 'MANTENIMIENTO') as mantenimiento"),
    )
    .first();

  return {
    total: Number(fila.total),
    disponibles: Number(fila.disponibles),
    mantenimiento: Number(fila.mantenimiento),
  };
}

async function contarConductores() {
  const fila = await knex('conductor')
    .select(
      knex.raw('count(*) as total'),
      knex.raw("count(*) filter (where estado = 'ACTIVO') as activos"),
    )
    .first();

  return {
    total: Number(fila.total),
    activos: Number(fila.activos),
  };
}

async function obtenerDashboard(req, res, next) {
  try {
    const [vehiculos, conductores, rutas, programacion] = await Promise.all([
      contarVehiculos(),
      contarConductores(),
      knex('macroruta').count('* as total').first(),
      knex('programacion_ruta').count('* as total').first(),
    ]);

    res.json({
      usuario: req.usuario,
      vehiculos,
      conductores,
      modulos: [
        { nombre: 'Vehículos', ruta: '/vehiculos', total: vehiculos.total },
        { nombre: 'Conductores', ruta: '/conductores', total: conductores.total },
        { nombre: 'Rutas', ruta: '/rutas', total: Number(rutas.total) },
        { nombre: 'Programación', ruta: '/programacion', total: Number(programacion.total) },
      ],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerDashboard };
