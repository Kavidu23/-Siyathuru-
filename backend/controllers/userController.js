// controllers/userController.js
const User = require("../models/user.js");

// GET all users
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

// GET a single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      details: err.message,
    });
  }
};

// CREATE a new user
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

// UPDATE a user
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
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

// DELETE a user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
