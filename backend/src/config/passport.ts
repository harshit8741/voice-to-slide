import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users } from '../schemas/users';
import { eq } from 'drizzle-orm';

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        const existingUserByGoogleId = await (db as any)
          .select()
          .from(users)
          .where(eq(users.googleId, profile.id))
          .limit(1);

        if (existingUserByGoogleId.length > 0) {
          return done(null, existingUserByGoogleId[0]);
        }

        // Check if user exists with this email
        const existingUserByEmail = await (db as any)
          .select()
          .from(users)
          .where(eq(users.email, profile.emails?.[0]?.value || ''))
          .limit(1);

        if (existingUserByEmail.length > 0) {
          // Link Google account to existing user
          const updatedUser = await (db as any)
            .update(users)
            .set({
              googleId: profile.id,
              profilePicture: profile.photos?.[0]?.value,
              authProvider: 'google',
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUserByEmail[0].id))
            .returning();

          return done(null, updatedUser[0]);
        }

        // Create new user
        const newUser = await (db as any)
          .insert(users)
          .values({
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            authProvider: 'google',
          })
          .returning();

        return done(null, newUser[0]);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await (db as any)
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    done(null, user[0] || false);
  } catch (error) {
    done(error, false);
  }
});

export default passport;