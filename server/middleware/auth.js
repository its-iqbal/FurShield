import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { User } from '../models/index.js';

// ── protect ───────────────────────────────────────────────────────────────────
/**
 * Verifies the Bearer JWT in the Authorization header and attaches
 * the authenticated user document to req.user.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  // Verify signature & expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // Make sure the user still exists
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) {
    return next(new AppError('User belonging to this token no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated.', 403));
  }

  req.user = user;
  next();
});

// ── restrictTo ────────────────────────────────────────────────────────────────
/**
 * Factory that returns a middleware allowing only the specified roles.
 * Always use AFTER protect().
 *
 * Usage: router.get('/vets-only', protect, restrictTo('veterinarian'), handler)
 *
 * @param {...string} roles - One or more of 'petOwner', 'veterinarian', 'shelter'
 */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. This route is restricted to: ${roles.join(', ')}.`,
        403
      )
    );
  }
  next();
};
