const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Always log on server side for debugging
  console.error(`[${req.method} ${req.originalUrl}] ${status}: ${message}`);
  if (status >= 500) console.error(err.stack);

  // Don't leak stack traces to clients
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && status >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;