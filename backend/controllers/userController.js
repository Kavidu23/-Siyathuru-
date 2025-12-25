const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const sendEmail = require('../utils/sendEmail');
const jwt = require("jsonwebtoken");

// CREATE a new user
const createUser = async (req, res) => {
  try {
    const { profileImage, name, email, pnumber, password, role, age, location } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const newUser = await User.create({
      profileImage,
      name,
      email,
      pnumber,
      password: hashedPassword,
      role,
      age,
      location,
      verificationCode // store in DB temporarily
    });

    // ✅ Send verification code via email
    if (newUser.email) {
      try {
        const emailSubject = 'Verify Your Account';
        const emailText = `Hello ${newUser.name},\n\nYour verification code is: ${verificationCode}\n\nThank you!`;
        const emailHTML = `<p>Hello <strong>${newUser.name}</strong>,</p>
                           <p>Your verification code is: <strong>${verificationCode}</strong></p>
                           <p>Thank you!</p>`;

        console.log(`📧 Sending verification code to: ${newUser.email}...`);
        await sendEmail(newUser.email, emailSubject, emailText, emailHTML);
        console.log(`✅ Verification email sent to: ${newUser.email}`);
      } catch (emailErr) {
        console.error(`❌ Failed to send email to ${newUser.email}:`, emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "User created successfully. Please check your email for verification code.",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        pnumber: newUser.pnumber,
        role: newUser.role,
        age: newUser.age,
        location: newUser.location
      },
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


// READ ALL USERS
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
      error: "Server error",
      details: err.message,
    });
  }
};

// READ ONE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

// UPDATE user
const updateUser = async (req, res) => {
  try {
    const { location, ...otherFields } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      location ? { ...otherFields, location } : otherFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ success: false, error: "Validation failed", details: err.message });
    if (err.code === 11000) return res.status(400).json({ success: false, error: "Duplicate field value", details: err.message });
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

// LOGIN user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: "Invalid credentials" });

    if (user.verificationCode) {
      return res.status(400).json({ success: false, error: "Account not verified yet" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }      // token expires in 1 hour
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pnumber: user.pnumber,
        role: user.role,
        age: user.age,
        location: user.location,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

// VERIFY user account
const verifyUser = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (user.verificationCode !== Number(code)) {
      return res.status(400).json({ success: false, error: "Invalid verification code" });
    }

    // Verification successful, remove code
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};


module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  verifyUser,
};
