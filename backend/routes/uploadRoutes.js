const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const nsfwCheck = require('../middleware/nsfwCheck');
const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// POST upload endpoint
router.post('/', upload.single('file'), nsfwCheck, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Upload to Cloudinary using the buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'siyathuru/profiles' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { url: result.secure_url },
      url: result.secure_url, // backward compatibility
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: err.message,
    });
  }
});

module.exports = router;
