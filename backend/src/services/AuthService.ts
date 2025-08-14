// Authentication service for user registration, login, and JWT management

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db, users, User } from '../db';
import { LoginCredentials, SignupCredentials, AuthResponse, SafeUser, JWTPayload } from '../types';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Register a new user
   */
  static async register(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, credentials.email));
      
      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(credentials.password, this.SALT_ROUNDS);

      // Create user
      const newUser = await db.insert(users).values({
        email: credentials.email,
        password: hashedPassword,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
      }).returning();

      const user = newUser[0];
      if (!user) {
        return {
          success: false,
          message: 'Failed to create user',
        };
      }

      // Generate JWT token
      const token = this.generateToken({ userId: user.id, email: user.email });

      // Return safe user data
      const safeUser = this.toSafeUser(user);

      return {
        success: true,
        user: safeUser,
        token,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, credentials.email));
      const user = userResult[0];

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Check if user has a password (not Google OAuth user)
      if (!user.password) {
        return {
          success: false,
          message: 'Please use Google Sign-In for this account',
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Generate JWT token
      const token = this.generateToken({ userId: user.id, email: user.email });

      // Return safe user data
      const safeUser = this.toSafeUser(user);

      return {
        success: true,
        user: safeUser,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<SafeUser | null> {
    try {
      const userResult = await db.select().from(users).where(eq(users.id, userId));
      const user = userResult[0];

      if (!user) {
        return null;
      }

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Convert User to SafeUser (remove password)
   */
  private static toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}