import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Verifies the Bearer JWT and attaches the decoded payload to req.user.
 * The payload contains { userId } as set by createToken() in authController.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'Authorization token missing.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
};

/**
 * Must run AFTER authMiddleware (req.user must be set).
 * Looks up the user in the DB to authoritatively check their role —
 * we never trust a role claim from the JWT payload itself.
 * Returns 403 Forbidden if the user is not an admin.
 */
export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('role').lean();

    if (!user) {
      return next(new ApiError(401, 'User not found.'));
    }

    if (user.role !== 'admin') {
      return next(new ApiError(403, 'Admin access required.'));
    }

    next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;
