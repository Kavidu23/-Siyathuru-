const Feedback = require('../models/feedback');

// Create Feedback (POST)
const createFeedback = async (req, res) => {
  try {
    const { userId, name, message } = req.body;

    // Basic validation
    if (!userId || !name || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (userId, name, message) are required',
      });
    }

    if (message.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 100 characters',
      });
    }

    if (userId) {
      const existingFeedback = await Feedback.findOne({ userId });
      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted feedback',
        });
      }
    }

    const newFeedback = await Feedback.create({
      userId,
      name,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: newFeedback,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Get All Feedbacks (GET)
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'name email'); // optional populate

    res.status(200).json({
      success: true,
      message: 'Feedbacks fetched successfully',
      data: feedbacks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

const getNumberOfFeedbacks = async (req, res) => {
  try {
    const feedbackCount = await Feedback.countDocuments();
    res.status(200).json({
      success: true,
      message: 'Total feedback count fetched successfully',
      data: { count: feedbackCount },
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
  createFeedback,
  getFeedbacks,
  getNumberOfFeedbacks,
};
