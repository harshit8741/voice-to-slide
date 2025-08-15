// Authentication routes

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import googleAuthRoutes from './googleAuth';

const router = Router();

// Include Google OAuth routes
router.use('/', googleAuthRoutes);

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.authenticatedUser) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const user = await AuthService.getUserById(req.authenticatedUser.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // With JWT, logout is typically handled on the client side by removing the token
  // For server-side logout, you would need to implement a token blacklist
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;