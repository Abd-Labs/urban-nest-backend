const generateToken = require("../utils/user/generateToken.js");
const bcrypt = require('bcryptjs');
const User = require('../mongodb/models/user.js');
const createUser = require('../utils/user/createUser.js')
const CLIENT_URL = process.env.CLIENT_URL;
const mongoose = require('mongoose');


const loginController = async (req,res) => {

    const { email, password } = req.body;

  try {
    // Check if a user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email " });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Wrong password" });
    }       

    // If the password is correct, generate a JWT token
    const token = generateToken(user);

    // Set the token as a cookie
    res.cookie("jwtToken", token, { maxAge: 3600000, httpOnly: true });
    res.cookie("authenticationSuccess", "true", { maxAge: 3600000 });
    // Send a success response
    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const signupController = async (req, res) => { // Rename from createUser to signup
  const { name, email, password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm Password are required' });
  }

  if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm Password do not match' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      const existingUser = await User.findOne({ email }).session(session);

      if (existingUser) {
        if (existingUser.authType === "google") {
          return res.status(400).json({ error: 'Use other authentication type, Account exists with same email' });
        }
        return res.status(400).json({ error: 'User with this email already exists' });
      }
  

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
          name,
          email,
          password: hashedPassword,
          allProperties: [],
          authType: "regular",
      });

      await newUser.save({ session });

      // Generate JWT token
      const token = generateToken(newUser);

      res.cookie("jwtToken", token, { maxAge: 3600000, httpOnly: true });
      res.cookie("authenticationSuccess", "true", { maxAge: 3600000 });
      // Send the token and a success message back to the client

      await session.commitTransaction();
      session.endSession();

      res.end()
  } catch (error) {
      console.error(error);

      await session.abortTransaction();
      session.endSession();

      res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Google Callback controller
const googleCallbackController = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction()
  try {
    const user = req.user;
    const profile = user.profile;
    
    const userObject = await createUser(profile,session);
    const token = generateToken(userObject);
    res.cookie("jwtToken", token, { maxAge: 3600000, httpOnly: true, secure: true });
    res.cookie("authenticationSuccess", "true", { maxAge: 3600000, secure: true });
    await session.commitTransaction();
    session.endSession();
    res.redirect(CLIENT_URL);
  } catch (error) {
    console.error(error);

    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = {
  loginController,
  googleCallbackController,
  signupController 
};
