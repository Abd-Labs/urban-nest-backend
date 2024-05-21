const passport = require("passport");
const CLIENT_URL = process.env.CLIENT_URL;
// Google Authentication middleware
const authenticateGoogle = (req, res, next) => {
    passport.authenticate("google", { 
      failureRedirect: CLIENT_URL, 
      session: false 
    })(req, res, next);
  };
  
  module.exports = authenticateGoogle;

  