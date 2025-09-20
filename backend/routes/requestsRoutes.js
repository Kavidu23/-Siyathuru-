const express = require('express');

const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
} = require('../controllers/requestsController');

const router = express.Router();

// CRUD routes
router.get('/', getRequests);           // Get all requests
router.get('/:id', getRequestById);     // Get single request by ID
router.post('/', createRequest);        // Create new request
router.put('/:id', updateRequest);      // Update request by ID
router.delete('/:id', deleteRequest);   // Delete request by ID

module.exports = router; // CommonJS export


