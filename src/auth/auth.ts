import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import prisma from '../db/dbconnect'


interface UserWithGoogle {
  id: string;
  email: string;
  displayName?: string;
  photo?: string;
}

declare global {
  namespace Express {
    interface User extends UserWithGoogle {}
  }
}

dotenv.config()

passport.serializeUser((user: Express.User, done) => {
  done(null, user)
})

passport.deserializeUser((user: Express.User, done) => {
  done(null, user)
})

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback"
}, async(accessToken, refreshToken, profile, done) => {
  console.log('Google profile:', profile)
  
  const user = await prisma.user.findUnique({
    where: {
      email: profile.emails?.[0]?.value
    }
  })
  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        email: profile.emails?.[0]?.value ?? ''
      }
    })
    return done(null, {
      ...newUser,
      displayName: profile.displayName,
      photo: profile.photos?.[0]?.value
    })
  }
  return done(null, {
    ...user,
    displayName: profile.displayName,
    photo: profile.photos?.[0]?.value
  })
}))

export default passport

