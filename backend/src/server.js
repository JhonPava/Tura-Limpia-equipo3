const app = require('./app');
const knex = require('./db');

const port = Number(process.env.PORT || 4000);
const servidor = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend disponible en http://localhost:${port}`);
});

async function cerrar() {
  servidor.close(async () => {
    await knex.destroy();
    process.exit(0);
  });
}

process.on('SIGTERM', cerrar);
process.on('SIGINT', cerrar);
