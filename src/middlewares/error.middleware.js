import { AppError } from '../utils/AppError.js';

/**
 * Global error handling middleware.
 * Should be the very last middleware registered in the Express app.
 */
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  // Handle expected operational errors (AppError)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.message,
    });
  }

  // Handle Prisma known request errors
  if (err.code) {
    // P2002: Unique constraint failed
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
        error: 'P2002',
      });
    }

    // P2025: Record to update not found.
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        error: 'P2025',
      });
    }
  }

  // Fallback for all other unhandled errors (database down, syntax errors, etc)
  console.error('Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: err.message || 'Internal Server Error',
  });
};
