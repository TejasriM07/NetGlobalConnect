const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are present. This prevents
// the app from crashing in environments where Google OAuth isn't set up.
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('Google OAuth2 not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Skipping Google strategy registration.');
} else {
  console.log('Configuring Google OAuth strategy...');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth callback received for user:', profile.displayName);
    const emailObj = profile.emails && profile.emails[0];
    const email = emailObj && emailObj.value;
    if (!email) {
      console.log('No email from Google profile');
      return done(null, false, { message: 'No email from Google' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating new user from Google profile:', email);
      user = await User.create({
        name: profile.displayName || 'Unnamed',
        email,
        password: undefined,
        profilePic: {
          url: (profile.photos && profile.photos[0] && profile.photos[0].value) || '',
          publicId: ''
        },
        googleId: profile.id,
        role: 'JobSeeker'
      });
    } else {
      console.log('Found existing user:', email);
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    }
    return done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, null);
  }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const u = await User.findById(id);
    done(null, u);
  } catch (err) {
    done(err, null);
  }
});