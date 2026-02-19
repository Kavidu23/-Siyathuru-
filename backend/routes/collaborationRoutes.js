// routes/communitySuggestRouter.js
const express = require('express');
const router = express.Router();

const { suggestCommunities } = require('../controllers/collaborationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only leaders can access
const leaderOnly = roleMiddleware(['leader']);

// Suggest similar communities based on a given community ID
router.get('/:communityId', authMiddleware, leaderOnly, suggestCommunities);

module.exports = router;
