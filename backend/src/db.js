import knex from 'knex';
import configuracion from '../knexfile.js';

// Una sola conexión (pool) a PostgreSQL para toda la aplicación.
export const db = knex(configuracion);
