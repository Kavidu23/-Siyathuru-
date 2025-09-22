const express = require('express');
const {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
} = require('../controllers/alertController');

const router = express.Router();

// Route to get all alerts
router.get('/', getAlerts); // Get all alerts
router.get('/:id', getAlertById); // Get a single alert by ID
router.post('/', createAlert); // Create new alert
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert); // Delete alert by ID

module.exports = router; // CommonJS export
