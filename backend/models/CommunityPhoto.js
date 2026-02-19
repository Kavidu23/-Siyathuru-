// models/CommunityPhoto.js
const mongoose = require('mongoose');

const communityPhotoSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

module.exports = mongoose.model('CommunityPhoto', communityPhotoSchema);
