// routes/communityPhotoRouter.js
const express = require('express');
const multer = require('multer');
const { uploadPhoto, getPhotosByCommunity, deletePhoto } = require('../controllers/communityPhotoController');

const router = express.Router();

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ================= UPLOAD PHOTO =================
router.post('/', upload.single('file'), uploadPhoto);

// ================= GET PHOTOS BY COMMUNITY =================
router.get('/community/:communityId', getPhotosByCommunity);

// ================= DELETE PHOTO =================
router.delete('/:id', deletePhoto);

module.exports = router;
