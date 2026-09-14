/**
 * utils/generateToken.js
 * Creates a signed JWT containing the user's id and role.
 * The secret and expiry are read from environment variables.
 */
import jwt from 'jsonwebtoken';

/**
 * @param {string} userId  - MongoDB ObjectId string
 * @param {string} role    - 'petOwner' | 'veterinarian' | 'shelter'
 * @returns {string}       - Signed JWT string
 */
const generateToken = (userId, role) =>
  jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

export default generateToken;
