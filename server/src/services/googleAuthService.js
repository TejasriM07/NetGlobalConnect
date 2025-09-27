const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const emailObj = profile.emails && profile.emails[0];
    const email = emailObj && emailObj.value;
    if (!email) return done(null, false, { message: 'No email from Google' });

    let user = await User.findOne({ email });
    if (!user) {
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
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const u = await User.findById(id);
    done(null, u);
  } catch (err) {
    done(err, null);
  }
});