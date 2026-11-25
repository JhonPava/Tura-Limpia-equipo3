const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const knex = require('../src/db');

const PLACA_PRUEBA = 'TST001';
let headers;

test.before(async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@turalimpia.co', password: 'Admin123*' });
  assert.equal(login.status, 200);
  headers = { Authorization: `Bearer ${login.body.token}` };
});

test.after(async () => {
  await knex('vehiculo').where({ placa: PLACA_PRUEBA }).del();
  await knex.destroy();
});

async function leerDashboard() {
  const response = await request(app).get('/api/dashboard').set(headers);
  assert.equal(response.status, 200);
  return response.body;
}

test('el dashboard trae los indicadores de vehículos y conductores', async () => {
  const datos = await leerDashboard();

  for (const campo of ['total', 'disponibles', 'mantenimiento']) {
    assert.equal(typeof datos.vehiculos[campo], 'number', `vehiculos.${campo}`);
  }
  for (const campo of ['total', 'activos']) {
    assert.equal(typeof datos.conductores[campo], 'number', `conductores.${campo}`);
  }
  assert.ok(datos.vehiculos.disponibles + datos.vehiculos.mantenimiento <= datos.vehiculos.total);
  assert.ok(datos.conductores.activos <= datos.conductores.total);
});

test('los indicadores de vehículos cambian al cambiar los datos', async () => {
  const antes = (await leerDashboard()).vehiculos;

  // Se registra un vehículo disponible
  await knex('vehiculo').insert({
    placa: PLACA_PRUEBA, num_interno: 'T-01', tipo: 'COMPACTADOR', marca: 'Prueba',
    modelo: 'Prueba', capacidad_ton: 5, estado_operativo: 'DISPONIBLE',
  });
  let ahora = (await leerDashboard()).vehiculos;
  assert.equal(ahora.total, antes.total + 1);
  assert.equal(ahora.disponibles, antes.disponibles + 1);

  // Pasa a mantenimiento
  await knex('vehiculo').where({ placa: PLACA_PRUEBA }).update({ estado_operativo: 'MANTENIMIENTO' });
  ahora = (await leerDashboard()).vehiculos;
  assert.equal(ahora.disponibles, antes.disponibles);
  assert.equal(ahora.mantenimiento, antes.mantenimiento + 1);

  // Se desactiva: deja de contarse
  await knex('vehiculo').where({ placa: PLACA_PRUEBA }).update({ activo: false });
  ahora = (await leerDashboard()).vehiculos;
  assert.deepEqual(ahora, antes);
});

test('los conductores activos cambian al cambiar el estado de un conductor', async () => {
  const conductor = await knex('conductor').where({ estado: 'ACTIVO' }).first('id_conductor');
  assert.ok(conductor, 'se necesita al menos un conductor activo en los datos de prueba');

  const antes = (await leerDashboard()).conductores;
  try {
    await knex('conductor').where(conductor).update({ estado: 'INACTIVO' });
    const ahora = (await leerDashboard()).conductores;
    assert.equal(ahora.total, antes.total);
    assert.equal(ahora.activos, antes.activos - 1);
  } finally {
    await knex('conductor').where(conductor).update({ estado: 'ACTIVO' });
  }
});
