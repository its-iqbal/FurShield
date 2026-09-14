/**
 * utils/asyncHandler.js
 * Wraps async route handlers to automatically forward errors to Express's
 * next() without needing try/catch in every controller.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res, next) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
