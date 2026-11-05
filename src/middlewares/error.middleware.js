const HttpError = require('../errors/HttpError');

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la solicitud no contiene JSON valido.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'El cuerpo de la solicitud supera el limite permitido.' });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error('Error no controlado en la API:', error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
}

module.exports = errorMiddleware;
