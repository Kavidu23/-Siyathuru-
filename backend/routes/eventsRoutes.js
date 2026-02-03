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

// Get events for a user based on their joined communities
router.get('/user/:userId', getEventsByUserId);

// User join event (RSVP)
router.post('/join', joinEvent);


router.get('/', getEvents);           // Get all events

router.get('/:id', getEventById);     // Get single event by ID

router.post('/', createEvent);        // Create new event

router.put('/:id', updateEvent);      // Update event by ID

router.delete('/:id', deleteEvent);   // Delete event by ID


module.exports = router;
