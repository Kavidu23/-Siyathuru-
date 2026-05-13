const express = require('express');
const router = express.Router();

const {
  requestVerification,
  verifyCommunity,
} = require('../controllers/communityVerificationController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Leader-only middleware
const leaderOnly = roleMiddleware(['leader']);
const leaderOrAdmin = roleMiddleware(['leader', 'admin']);

// ===== Routes =====

// Request verification (leader only)
router.post('/request', authMiddleware, leaderOnly, requestVerification);

// Verify community (leader only)
router.post('/verify', authMiddleware, leaderOrAdmin, verifyCommunity);

module.exports = router;
