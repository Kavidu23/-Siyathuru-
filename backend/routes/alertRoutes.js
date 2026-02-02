const express = require('express');
const router = express.Router();

const {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
    getAlertByUserId
} = require('../controllers/alertController');

// Route to get all alerts
router.get('/', getAlerts); // Get all alerts
router.get('/user/:userId', getAlertByUserId); // Get alerts for communities joined by a specific user
router.get('/:id', getAlertById); // Get a single alert by ID
router.post('/', createAlert); // Create new alert
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert); // Delete alert by ID


module.exports = router; // CommonJS export
