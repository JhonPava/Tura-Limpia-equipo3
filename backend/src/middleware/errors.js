function crearError(status, codigo, mensaje, detalles) {
  const error = new Error(mensaje);
  error.status = status;
  error.codigo = codigo;
  error.detalles = detalles;
  return error;
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      codigo: 'RUTA_NO_ENCONTRADA',
      mensaje: 'La ruta solicitada no existe.',
    },
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = error.status || 500;
  res.status(status).json({
    error: {
      codigo: error.codigo || 'ERROR_INTERNO',
      mensaje: status >= 500 ? 'Ocurrió un error interno.' : error.message,
      ...(error.detalles ? { detalles: error.detalles } : {}),
    },
  });
}

module.exports = { crearError, notFoundHandler, errorHandler };
