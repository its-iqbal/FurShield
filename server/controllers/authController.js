import { body } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import generateToken from '../utils/generateToken.js';
import { User } from '../models/index.js';

// ── Validation rules ──────────────────────────────────────────────────────────

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['petOwner', 'veterinarian', 'shelter'])
    .withMessage('Role must be petOwner, veterinarian, or shelter'),
  body('phone').optional().trim(),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Attach JWT as a cookie AND return it in the response body.
 * The cookie is httpOnly so JS cannot access it (XSS protection).
 */
const sendTokenResponse = (res, user, statusCode, message) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove passwordHash from output
  const userObj = user.toObject();
  delete userObj.passwordHash;

  sendResponse(res, statusCode, { token, user: userObj }, message);
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Creates a new user account for any of the three roles.
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, address } = req.body;

  // Duplicate email guard
  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError('An account with that email already exists.', 409));
  }

  const user = new User({ name, email, role, phone, address });
  await user.setPassword(password);
  await user.save();

  sendTokenResponse(res, user, 201, 'Account created successfully');
});

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns a JWT.
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Explicitly select passwordHash (it has select:false in schema)
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated.', 403));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  sendTokenResponse(res, user, 200, 'Logged in successfully');
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user (token required).
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by protect middleware
  sendResponse(res, 200, req.user, 'Current user retrieved');
});

/**
 * POST /api/v1/auth/logout
 * Clears the JWT cookie.
 */
export const logout = (_req, res) => {
  res.cookie('jwt', 'logged_out', {
    expires:  new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  sendResponse(res, 200, null, 'Logged out successfully');
};

/**
 * PATCH /api/v1/auth/update-password
 * Allows a logged-in user to change their password.
 */
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide currentPassword and newPassword.', 400));
  }
  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters.', 400));
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  await user.setPassword(newPassword);
  await user.save();

  sendTokenResponse(res, user, 200, 'Password updated successfully');
});
