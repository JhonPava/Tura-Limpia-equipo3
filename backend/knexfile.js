require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });

const path = require('node:path');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Copia .env.example a .env y ajusta la conexión.');
}

/** @type {import('knex').Knex.Config} */
module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: path.join(__dirname, 'db', 'migrations'),
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: path.join(__dirname, 'db', 'seeds'),
  },
};
