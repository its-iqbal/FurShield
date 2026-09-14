/**
 * utils/AppError.js
 * Custom operational error class. Use this instead of plain Error objects
 * so the global error handler can distinguish operational errors (4xx/5xx
 * that we deliberately throw) from unexpected programming errors.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (4xx / 5xx)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode  = statusCode;
    this.status      = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
