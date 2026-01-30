const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

/* CREATE USER */
const createUser = async (req, res) => {
  try {
    const { profileImage, name, email, pnumber, password, role, age, location } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

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
      verificationCode,
      isVerified: false,
    });

    // Send verification email
    try {
      await sendEmail(
        newUser.email,
        "Verify Your Account",
        `Your verification code is ${verificationCode}`,
        `<p>Your verification code is <strong>${verificationCode}</strong></p>`
      );
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "User created successfully. Verification code sent.",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email or phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* VERIFY USER*/
const verifyUser = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    if (user.isVerified)
      return res.status(400).json({
        success: false,
        error: "User already verified",
      });

    if (user.verificationCode !== Number(code)) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    await User.updateOne(
      { email },
      {
        $set: { isVerified: true },
        $unset: { verificationCode: "" },
      }
    );

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* LOGIN USER */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });

    if (!user.isVerified)
      return res.status(400).json({
        success: false,
        error: "Account not verified",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
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
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* GET ALL USERS */
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* GET USER BY ID */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* UPDATE USER */
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({
        success: false,
        error: "Duplicate field value",
      });

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* DELETE USER */
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser)
      return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* EXPORTS */
module.exports = {
  createUser,
  verifyUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
