import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies the Bearer JWT and attaches the decoded payload to req.user.
 * The payload contains { userId } as set by createToken() in authController.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
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
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

export default authMiddleware;
