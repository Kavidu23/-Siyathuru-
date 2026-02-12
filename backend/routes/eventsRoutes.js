const express = require('express');
const router = express.Router();

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    joinEvent,          // NEW
    getEventsByUserId,  // NEW
} = require('../controllers/eventsController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Role shortcuts
const leaderOnly = roleMiddleware(['leader']);
const memberOnly = roleMiddleware(['member']);

// ===== Public routes =====
router.get('/', getEvents);           // Get all events
router.get('/:id', getEventById);     // Get single event by ID

// ===== Member-only routes =====
router.get('/user/:userId', authMiddleware, memberOnly, getEventsByUserId);
router.post('/join', authMiddleware, memberOnly, joinEvent);

// ===== Leader-only routes =====
router.post('/', authMiddleware, leaderOnly, createEvent);
router.put('/:id', authMiddleware, leaderOnly, updateEvent);
router.delete('/:id', authMiddleware, leaderOnly, deleteEvent);

module.exports = router;