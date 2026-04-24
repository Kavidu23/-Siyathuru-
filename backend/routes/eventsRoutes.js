const express = require('express');
const router = express.Router();

const {
  createEvent,
  getEventsByCommunityId,
  getUpcomingEventsByCommunityId,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent, // NEW
  getEventsByUserId, // NEW
  getNumberOfEvents, // NEW
} = require('../controllers/eventsController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Role shortcuts
const leaderOnly = roleMiddleware(['leader']);
const memberOnly = roleMiddleware(['member']);
const adminOnly = roleMiddleware(['admin']);

// ===== Admin-only routes =====
router.get('/count', authMiddleware, adminOnly, getNumberOfEvents);

// ===== Public routes =====
router.get('/', getEvents); // Get all events
router.get('/community/:communityId', getEventsByCommunityId); // Get all community events
router.get('/community/:communityId/upcoming', getUpcomingEventsByCommunityId); // Get upcoming community events

// ===== Member-only routes =====
router.get('/user/:userId', authMiddleware, memberOnly, getEventsByUserId);
router.post('/join', authMiddleware, memberOnly, joinEvent);

// ===== Leader-only routes =====
router.post('/', authMiddleware, leaderOnly, createEvent);
router.put('/:id', authMiddleware, leaderOnly, updateEvent);
router.delete('/:id', authMiddleware, leaderOnly, deleteEvent);

// Get single event by ID (keep last to avoid shadowing other routes)
router.get('/:id', getEventById);

module.exports = router;
