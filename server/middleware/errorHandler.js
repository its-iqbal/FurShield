import AppError from '../utils/AppError.js';

// ── Mongoose error handlers ───────────────────────────────────────────────────

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `Duplicate value for field '${field}'. Please use a different value.`,
    409
  );
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

// ── JWT error handlers ────────────────────────────────────────────────────────

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ── express-validator error formatter ────────────────────────────────────────
const handleExpressValidatorError = (err) =>
  new AppError(err.message, 422);

// ── Global error handler ──────────────────────────────────────────────────────
/**
 * Must be registered LAST in server.js with four params (err, req, res, next).
 * Distinguishes operational errors (AppError) from unexpected programming bugs.
 */
const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message, name: err.name };

  // Translate Mongoose / JWT errors into operational AppErrors
  if (error.name === 'CastError')               error = handleCastError(error);
  if (error.code === 11000)                      error = handleDuplicateKeyError(error);
  if (error.name === 'ValidationError')          error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError')        error = handleJWTError();
  if (error.name === 'TokenExpiredError')        error = handleJWTExpiredError();
  if (error.name === 'ExpressValidatorError')    error = handleExpressValidatorError(error);

  // Operational, trusted error: send details to client
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      status:  error.status,
      message: error.message,
    });
  }

  // Programming / unknown error: log & send generic message
  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    success: false,
    status:  'error',
    message: 'Something went wrong on our end. Please try again later.',
  });
};

export default errorHandler;
