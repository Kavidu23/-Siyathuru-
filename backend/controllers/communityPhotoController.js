// controllers/communityPhotoController.js
const CommunityPhoto = require('../models/CommunityPhoto');
const cloudinary = require('../config/cloudinary');

// ================= UPLOAD PHOTO =================
const uploadPhoto = async (req, res) => {
  try {
    const { communityId, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: `siyathuru/communities/${communityId}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Save to DB
    const newPhoto = await CommunityPhoto.create({
      communityId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      caption: caption || '',
    });

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: newPhoto,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo',
      details: err.message,
    });
  }
};

// ================= GET PHOTOS =================
const getPhotosByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const photos = await CommunityPhoto.find({ communityId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos,
    });
  } catch (err) {
    console.error('Fetch photos error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos',
      details: err.message,
    });
  }
};

// ================= DELETE PHOTO =================
const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await CommunityPhoto.findById(id);
    if (!photo) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.publicId, { resource_type: 'image' });

    // Delete from DB
    await photo.deleteOne();

    res.status(200).json({ success: true, message: 'Photo deleted successfully' });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo',
      details: err.message,
    });
  }
};

module.exports = { uploadPhoto, getPhotosByCommunity, deletePhoto };
