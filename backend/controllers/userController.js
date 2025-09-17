// controllers/userController.js

const User = require("../models/user.js");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, pnumber,password,city,age,role } = req.body;
    const newUser = await User.create({ name, email, pnumber,password,city,age,role });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Correct the typo here
module.exports = { getUsers, createUser };