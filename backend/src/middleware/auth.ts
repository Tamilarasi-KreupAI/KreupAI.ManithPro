import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId,
      userId: decoded.userId || decoded.id || '',
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId,
        userId: decoded.userId || decoded.id || '',
      };
    }

    next();
  } catch (error) {
    // Token invalid, but we still continue without user
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
const normalizedRoles = roles
  .flat()
  .filter((role): role is string => typeof role === 'string')
  .map((role) => role.toUpperCase());

const userRole = (req.user.role || '').toUpperCase();

if (!normalizedRoles.includes(userRole)) {
  res.status(403).json({ error: 'Insufficient permissions' });
  return;
}


    next();
  };
};
