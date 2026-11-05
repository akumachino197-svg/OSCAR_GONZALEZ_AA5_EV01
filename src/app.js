const express = require('express');
const cors = require('cors');
const createAuthRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middlewares/error.middleware');

function createApp({ authService, corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173' }) {
  if (!authService) {
    throw new Error('Se requiere un servicio de autenticacion para crear la aplicacion.');
  }

  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servicio web funcionando.' });
  });
  app.use('/api/auth', createAuthRoutes(authService));
  app.use((req, res) => {
    res.status(404).json({ message: 'Recurso no encontrado.' });
  });
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
