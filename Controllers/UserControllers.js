const User = require('../mongodb/models/user.js')
const bcrypt = require('bcryptjs');

// Controller function to get all users
const getAllUsers = async (req, res) => {
    try {
      // Fetch all users from the database
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
// Controller function to get user by ID
const getUserByID = async (req, res) => {
    const userId = req.params.id; // Assuming ID is sent as a parameter in the request URL
  
    try {
      // Fetch user by ID from the database
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

module.exports = { getAllUsers , getUserByID};