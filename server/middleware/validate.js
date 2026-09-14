import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/**
 * middleware/validate.js
 * Run after an array of express-validator check() rules.
 * Collects errors and short-circuits with a 422 if any rule fails.
 *
 * Usage:
 *   router.post('/register', [
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 8 }),
 *     validate,
 *     authController.register,
 *   ]);
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join('; ');
    return next(new AppError(messages, 422));
  }
  next();
};

export default validate;
