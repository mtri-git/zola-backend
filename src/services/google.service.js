const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Mongoose User Model
const User = require('../models/User');

// Google Strategy
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // Find or Create User
        User.findOne({ email: profile.emails[0].value })
          .then((existingUser) => {
            if (existingUser) {
              // User exists in the database
              done(null, existingUser);
            } else {
              // Create new user in the database
              const newUser = new User({
                email: profile.emails[0].value,
                name: profile.displayName,
                googleId: profile.id,
              });
              newUser.save().then((user) => {
                done(null, user);
              });
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    )
  );
  

// Passport Session Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});
