const express = require("express");
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    verifyUser,
    loginUser,
} = require("../controllers/userController");

const router = express.Router();

// CRUD routes
router.get("/", getUsers);              // Get all users
router.get("/:id", getUserById);       // Get single user by ID
router.post("/", createUser);          // Create new user
router.post("/login", loginUser);      // Login user with email and password
router.post("/verify", verifyUser);   // Verify user account with code
router.put("/:id", updateUser);        // Update user by ID
router.delete("/:id", deleteUser);     // Delete user by ID

module.exports = router; // ✅ CommonJS export
