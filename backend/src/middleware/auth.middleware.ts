import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/errors';
import { config } from '../config';

const JWT_SECRET = process.env.JWT_SECRET || 'luxestore-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const authMiddleware = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.badRequest('Please login to access this resource', 'UNAUTHORIZED'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).exec();

    if (!user || !user.isActive) {
      return next(AppError.badRequest('User not found or deactivated', 'UNAUTHORIZED'));
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.badRequest('Invalid token', 'UNAUTHORIZED'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.badRequest('Token expired. Please login again', 'TOKEN_EXPIRED'));
    }
    next(error);
  }
};

// Optional auth - sets user if token present, but doesn't block
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).exec();
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};
