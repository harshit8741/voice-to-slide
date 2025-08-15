// JWT authentication middleware

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { JWTPayload } from '../types';

// Extend Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  const decoded = AuthService.verifyToken(token);
  
  if (!decoded) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }

  req.authenticatedUser = decoded;
  next();
};