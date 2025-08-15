// User routes

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/UserService';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
});

/**
 * GET /api/users
 * Get all users (protected route)
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/users/stats
 * Get user statistics (protected route)
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await UserService.getUserStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get user stats route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (protected route)
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id!);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile (protected route)
 */
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    if (!req.authenticatedUser) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const updatedUser = await UserService.updateUserProfile(req.authenticatedUser.userId, req.body);
    
    if (!updatedUser) {
      res.status(400).json({
        success: false,
        message: 'Failed to update profile',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error && error.message === 'Email already exists' 
        ? 'Email already exists' 
        : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/users/account
 * Delete current user's account (protected route)
 */
router.delete('/account', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.authenticatedUser) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const deleted = await UserService.deleteUser(req.authenticatedUser.userId);
    
    if (!deleted) {
      res.status(400).json({
        success: false,
        message: 'Failed to delete account',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;