// controllers/userController.js
const User = require("../models/user.js");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      details: err.message,
    });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, pnumber, password, city, age, role } = req.body;

    const newUser = await User.create({
      name,
      email,
      pnumber,
      password,
      city,
      age,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    // Handle validation errors as 400, others as 500
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate field value",
        details: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};

module.exports = { getUsers, createUser };
