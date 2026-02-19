const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser,
  loginUser,
  logoutUser,
  getUserByCommunity,
  getMe,
} = require('../controllers/userController');

const { requestPasswordReset, resetPassword } = require('../controllers/userPasswordController');

// AUTH routes
router.post('/login', loginUser); // Login user
router.post('/logout', logoutUser); // Logout user
router.post('/verify', verifyUser); // Verify user
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// CURRENT USER
router.get('/me', getMe); // Must come BEFORE /:id

// CRUD routes
router.get('/', getUsers); // Get all users
router.get('/:id', getUserById); // Get single user by ID
router.get('/:communityId', getUserByCommunity); // Get users by community ID
router.post('/', createUser); // Create new user
router.put('/:id', updateUser); // Update user by ID
router.delete('/:id', deleteUser); // Delete user by ID

module.exports = router;
