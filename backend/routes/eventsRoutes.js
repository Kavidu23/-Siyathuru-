const express = require('express');
const router = express.Router();

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} = require('../controllers/eventsController');


// CRUD routes
router.get('/', getEvents);           // Get all events
router.get('/:id', getEventById);     // Get single event by ID
router.post('/', createEvent);        // Create new event
router.put('/:id', updateEvent);      // Update event by ID
router.delete('/:id', deleteEvent);   // Delete event by ID


module.exports = router; // CommonJS export