const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); 

let url;
if (process.env.NODE_ENV === 'production') {
  // Use Vercel URL for deployment
  url = `${process.env.VERCEL_URL}/auth/google/callback`;
} else {
  // Use localhost:5000 for development
  url = 'http://localhost:5000/auth/google/callback';
}

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET_KEY,
  callbackURL: url, // Update with your callback URL
},
async (accessToken, refreshToken, profile, done) => {
    try {
      return done(null, {profile});
      } catch (error) {
        // Handle authentication error
        console.error("Authentication Error:", error);
        return done(error); // Pass the error to the done callback
      }

}));
