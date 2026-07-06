/**
 * Custom error class for operational errors (expected errors like validation or 404s).
 * Distinguishes expected errors from unhandled bugs.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
