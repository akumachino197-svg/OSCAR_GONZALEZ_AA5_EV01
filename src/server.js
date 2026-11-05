require('dotenv').config();

const createApp = require('./app');
const { createDatabasePool } = require('./config/database');
const AuthService = require('./services/auth.service');

async function startServer() {
  const pool = createDatabasePool();
  await pool.query('SELECT 1');

  const app = createApp({ authService: new AuthService(pool) });
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`API disponible en http://localhost:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`Senal ${signal} recibida. Cerrando el servidor...`);
    server.close(async (error) => {
      if (error) {
        console.error('No fue posible cerrar el servidor correctamente:', error);
        process.exitCode = 1;
      }
      await pool.end();
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('No fue posible iniciar el servicio. Verifique MySQL y el archivo .env:', error);
  process.exitCode = 1;
});
