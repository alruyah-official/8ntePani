import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma.js';
import { findOrCreateGoogleUser } from '../services/auth.service.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
