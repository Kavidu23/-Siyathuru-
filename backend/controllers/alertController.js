const Alert = require('../models/alert'); // alert model path
const User = require('../models/user'); // Ensure User model is imported
const Community = require('../models/communities'); // community model
const sendEmail = require('../utils/sendEmail'); // email service
const mongoose = require('mongoose');

// Create a new alert
const createAlert = async (req, res) => {
  try {
    const { communityId, title, message, severity, isActive } = req.body;

    // 1ï¸âƒ£ Create alert
    const newAlert = await Alert.create({
      communityId,
      title,
      message,
      severity,
      isActive,
    });

    // 2ï¸âƒ£ Send email to all members if alert is active
    if (isActive) {
      // Get community members
      const community = await Community.findById(communityId).populate('members', 'name email');

      if (community && community.members && community.members.length > 0) {
        const emails = community.members.map((m) => m.email).filter(Boolean);

        if (emails.length > 0) {
          const subject = `New Alert: ${title}`;
          const html = `
            <h3>${title}</h3>
            <p>${message}</p>
            <p>Severity: ${severity}</p>
          `;

          try {
            await sendEmail(emails.join(','), subject, message, html);
            console.log(`Emails sent to ${emails.length} members`);
          } catch (emailErr) {
            console.error('Failed to send alert emails:', emailErr.message);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: newAlert,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value',
        details: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Read all alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate({
      path: 'communityId',
      select: 'name leader members', // only needed fields
    });

    res.status(200).json({
      success: true,
      message: 'Alerts fetched successfully',
      data: alerts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
      details: err.message,
    });
  }
};

// Read all alerts for a community
const getAlertsByCommunityId = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!mongoose.isValidObjectId(communityId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid communityId',
      });
    }

    const alerts = await Alert.find({ communityId })
      .populate({
        path: 'communityId',
        select: 'name leader members profileImage',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Community alerts fetched successfully',
      count: alerts.length,
      data: alerts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community alerts',
      details: err.message,
    });
  }
};

const getAlertByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Fetch user with their joined communities
    const user = await User.findById(userId).populate('joinedCommunities', 'name leader members');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // 2. Fetch alerts for communities the user belongs to
    const alerts = await Alert.find({
      communityId: { $in: user.joinedCommunities.map((c) => c._id) },
      isActive: true, // optional: only active alerts
    })
      .populate({
        path: 'communityId',
        select: 'name profileImage leader members', // populate community details
        populate: { path: 'leader members', select: 'name email' }, // nested populate for leader & members
      })
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      count: alerts.length,
      message: 'User-specific alerts fetched successfully',
      data: alerts,
    });
  } catch (err) {
    console.error('Error fetching user alerts:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user alerts',
      details: err.message,
    });
  }
};

// Read single alert by ID
const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert',
      details: err.message,
    });
  }
};

// Update an alert
const updateAlert = async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      data: updatedAlert,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Delete an alert
const deleteAlert = async (req, res) => {
  try {
    const deletedAlert = await Alert.findByIdAndDelete(req.params.id);
    if (!deletedAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

const getNumberOfAlerts = async (req, res) => {
  try {
    const count = await Alert.countDocuments();
    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertsByCommunityId,
  getAlertById,
  updateAlert,
  deleteAlert,
  getAlertByUserId,
  getNumberOfAlerts,
};
