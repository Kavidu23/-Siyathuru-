const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Community name
    type: { type: String, required: true }, // e.g., 'Youth Club', 'Charity', 'Sports'
    mission: { type: String }, // Mission statement
    description: { type: String }, // Longer description

    bannerImage: { type: String }, // URL to banner image
    profileImage: { type: String }, // URL to profile image

    location: {
      address: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },

    contact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },

    media: {
      facebook: { type: String },
      instagram: { type: String },
      whatsapp: { type: String },
      reddit: { type: String },
    },

    isPrivate: { type: Boolean, default: false }, // Require join requests or not
    isVerified: { type: Boolean, default: false }, // Admin verification status

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members list
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Community creator

    joinRequests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now },
      },
    ],

    established: { type: Date }, // Optional: historical date
  },
  { timestamps: true }, // Adds createdAt & updatedAt automatically
);

module.exports = mongoose.model('Community', communitySchema);
