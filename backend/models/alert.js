const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true // adds createdAt & updatedAt automatically
});

module.exports = mongoose.model('Alert', alertSchema);