// routes/communityPhotoRouter.js
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const nsfwCheck = require('../middleware/nsfwCheck');

const {
  uploadPhoto,
  getPhotosByCommunity,
  deletePhoto,
} = require('../controllers/communityPhotoController');

const router = express.Router();

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Only leader can access these routes
const leaderOnly = roleMiddleware(['leader']);

// ================= UPLOAD PHOTO =================
router.post('/', authMiddleware, leaderOnly, upload.single('file'), nsfwCheck, uploadPhoto);

// ================= GET PHOTOS BY COMMUNITY =================
router.get('/community/:communityId', authMiddleware, leaderOnly, getPhotosByCommunity);

// ================= DELETE PHOTO =================
router.delete('/:id', authMiddleware, leaderOnly, deletePhoto);

module.exports = router;
