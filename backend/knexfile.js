// Configuración de Knex (migraciones y datos de prueba).
// La CLI de Knex lee este archivo: npx knex migrate:latest, npx knex seed:run, etc.
import 'dotenv/config';

const usarSSL = process.env.DATABASE_SSL === 'true';

export default {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    // Los PostgreSQL alojados en la nube (por ejemplo, Render o Railway) exigen SSL.
    ssl: usarSSL ? { rejectUnauthorized: false } : false,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migraciones',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: './db/seeds',
    loadExtensions: ['.js'],
  },
};
