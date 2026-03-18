const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getAlertByUserId,
  getNumberOfAlerts,
} = require('../controllers/alertController');

// ===== Routes accessible by MEMBER + LEADER =====

// Get all alerts
router.get('/', authMiddleware, roleMiddleware(['member', 'leader']), getAlerts);

//Get number of alerts
router.get('/count', authMiddleware, roleMiddleware(['admin']), getNumberOfAlerts);

// Get alerts by user id
router.get('/user/:userId', authMiddleware, roleMiddleware(['member', 'leader']), getAlertByUserId);

// Get single alert by id
router.get('/:id', authMiddleware, roleMiddleware(['member', 'leader']), getAlertById);

// ===== Routes LEADER ONLY =====

// Create alert
router.post('/', authMiddleware, roleMiddleware(['leader']), createAlert);

// Update alert
router.put('/:id', authMiddleware, roleMiddleware(['leader']), updateAlert);

// Delete alert
router.delete('/:id', authMiddleware, roleMiddleware(['leader']), deleteAlert);

module.exports = router;
