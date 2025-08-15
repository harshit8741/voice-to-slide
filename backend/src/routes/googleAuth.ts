import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { User } from '../schemas/users';

const router = express.Router();

// Initialize Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
  }),
  (req, res) => {
    try {
      const user = req.user as User;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }
      
      const signOptions: jwt.SignOptions = {
        expiresIn: '7d'
      };
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        jwtSecret!,
        signOptions
      );

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

export default router;