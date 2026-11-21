const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const knex = require('../src/db');

test.after(async () => {
  await knex.destroy();
});

test('health responde conectado', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.estado, 'ok');
  assert.equal(response.body.baseDatos, 'conectada');
});

test('rechaza credenciales incorrectas', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@turalimpia.co', password: 'incorrecta' });

  assert.equal(response.status, 401);
  assert.equal(response.body.error.codigo, 'CREDENCIALES_INVALIDAS');
});

test('rechaza al operador sin permisos de administrador', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'operador@turalimpia.co', password: 'Operador123*' });

  assert.equal(response.status, 403);
  assert.equal(response.body.error.codigo, 'SIN_PERMISOS');
});

test('rechaza una cuenta inactiva', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'inactivo@turalimpia.co', password: 'Inactivo123*' });

  assert.equal(response.status, 403);
  assert.equal(response.body.error.codigo, 'CUENTA_DESACTIVADA');
});

test('login, dashboard, me y logout', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@turalimpia.co', password: 'Admin123*' });

  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const headers = { Authorization: `Bearer ${login.body.token}` };

  const me = await request(app).get('/api/auth/me').set(headers);
  assert.equal(me.status, 200);
  assert.equal(me.body.usuario.nombre, 'Administrador General');

  const dashboard = await request(app).get('/api/dashboard').set(headers);
  assert.equal(dashboard.status, 200);
  assert.deepEqual(
    dashboard.body.modulos.map((modulo) => modulo.nombre),
    ['Vehículos', 'Conductores', 'Rutas', 'Programación'],
  );

  const logout = await request(app).post('/api/auth/logout').set(headers);
  assert.equal(logout.status, 200);

  const despues = await request(app).get('/api/dashboard').set(headers);
  assert.equal(despues.status, 401);
});

test('usuario sin autenticación no puede abrir dashboard', async () => {
  const response = await request(app).get('/api/dashboard');
  assert.equal(response.status, 401);
});
