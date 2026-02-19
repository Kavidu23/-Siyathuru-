const express = require('express');
const router = express.Router();
const {
  createCommunity,
  getCommunities,
  getCommunityById,
  getCommunitiesByLeader,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  removeMember,
} = require('../controllers/communityController');

const upload = require('../middleware/upload'); // multer + Cloudinary
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ===== Role middleware shortcuts =====
const leaderOnly = roleMiddleware(['leader']);
const memberOnly = roleMiddleware(['member']);
const adminOnly = roleMiddleware(['admin']);

// ===== CRUD routes =====

// Public routes
router.get('/', getCommunities); // Get all communities
router.get('/:id', getCommunityById); // Get a single community by ID

// Leader-only: get communities they lead
router.get('/leader/:leaderId', authMiddleware, leaderOnly, getCommunitiesByLeader);

// Create new community (authenticated only)
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]),
  createCommunity,
);

// Update community (authenticated only)
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]),
  updateCommunity,
);

// Delete community (admin only)
router.delete('/:id', authMiddleware, adminOnly, deleteCommunity);

// Join community (member only)
router.post('/:id/join', authMiddleware, memberOnly, joinCommunity);

// Leave community (member only)
router.post('/:id/leave', authMiddleware, memberOnly, leaveCommunity);

// Remove member (leader only)
router.delete('/:id/members/:memberId', authMiddleware, leaderOnly, removeMember);

module.exports = router;
