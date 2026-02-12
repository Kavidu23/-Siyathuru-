const express = require('express');
const router = express.Router();

const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
} = require('../controllers/requestsController');

const authMiddleware = require('../middleware/authMiddleware');

// Apply authMiddleware to all routes
router.use(authMiddleware);

// ===== CRUD routes =====
router.get('/', getRequests);           // Get all requests
router.get('/:id', getRequestById);     // Get single request by ID
router.post('/', createRequest);        // Create new request
router.put('/:id', updateRequest);      // Update request by ID
router.delete('/:id', deleteRequest);   // Delete request by ID

module.exports = router;