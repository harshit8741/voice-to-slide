// User service for user CRUD operations and profile management

import { eq } from 'drizzle-orm';
import { db, users } from '../db';
import { SafeUser } from '../types';
import { AuthService } from './AuthService';

export class UserService {
  /**
   * Get all users (for admin or general listing)
   */
  static async getAllUsers(): Promise<SafeUser[]> {
    try {
      const allUsers = await (db as any).select().from(users);
      
      return allUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider || 'email',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<SafeUser | null> {
    return AuthService.getUserById(userId);
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string, 
    updates: { firstName?: string; lastName?: string; email?: string }
  ): Promise<SafeUser | null> {
    try {
      // Check if email is being updated and if it already exists
      if (updates.email) {
        const existingUser = await (db as any).select().from(users).where(eq(users.email, updates.email));
        if (existingUser.length > 0 && existingUser[0]?.id !== userId) {
          throw new Error('Email already exists');
        }
      }

      // Update user
      const updatedUsers = await (db as any)
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      const updatedUser = updatedUsers[0];
      if (!updatedUser) {
        return null;
      }

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profilePicture: updatedUser.profilePicture,
        authProvider: updatedUser.authProvider || 'email',
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return null;
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const deletedUsers = await (db as any).delete(users).where(eq(users.id, userId)).returning();
      return deletedUsers.length > 0;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

  /**
   * Get user statistics (for dashboard)
   */
  static async getUserStats(): Promise<{ totalUsers: number; recentUsers: number }> {
    try {
      const allUsers = await (db as any).select().from(users);
      const totalUsers = allUsers.length;

      // Count users created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentUsers = allUsers.filter((user: any) => user.createdAt > thirtyDaysAgo).length;

      return {
        totalUsers,
        recentUsers,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        totalUsers: 0,
        recentUsers: 0,
      };
    }
  }
}