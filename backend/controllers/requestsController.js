const Request = require('../models/requests');

// Create a new request
const createRequest = async (req, res) => {
  try {
    const { userId, communityId, status } = req.body;

    const newRequest = await Request.create({
      userId,
      communityId,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: newRequest,
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

// Get all requests
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find();

    res.status(200).json({
      success: true,
      message: 'Requests fetched successfully',
      data: requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Get a request by ID
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Update a request
const updateRequest = async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest,
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

// Delete a request
const deleteRequest = async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
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
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
};
