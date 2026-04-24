const events = require('../models/events');
const sendEmail = require('../utils/sendEmail');
const mongoose = require('mongoose');

const buildEventDateTime = (eventDate, eventTime) => {
  if (!eventDate) return null;
  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) return null;

  if (!eventTime) return date;

  const timeMatch = String(eventTime)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!timeMatch) return date;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toLowerCase();

  if (meridiem) {
    if (hours === 12) {
      hours = meridiem === 'am' ? 0 : 12;
    } else if (meridiem === 'pm') {
      hours += 12;
    }
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      communityId,
      title,
      description,
      location,
      eventDate,
      eventTime,
      bannerImage,
      attendees,
    } = req.body;

    const newEvent = await events.create({
      communityId,
      title,
      description,
      location,
      eventDate,
      eventTime,
      bannerImage,
      attendees,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value',
        details: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Read all events for a community (no time filter)
const getEventsByCommunityId = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!mongoose.isValidObjectId(communityId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid communityId',
      });
    }

    const communityEvents = await events.find({ communityId }).sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      message: 'Community events fetched successfully',
      count: communityEvents.length,
      data: communityEvents,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community events',
      details: err.message,
    });
  }
};

// Read upcoming (future) events for a community (date+time aware)
const getUpcomingEventsByCommunityId = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!mongoose.isValidObjectId(communityId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid communityId',
      });
    }

    const all = await events.find({ communityId }).sort({ eventDate: 1 });
    const now = new Date();

    const upcoming = all.filter((ev) => {
      const dt = buildEventDateTime(ev.eventDate, ev.eventTime);
      return dt ? dt > now : false;
    });

    res.status(200).json({
      success: true,
      message: 'Upcoming community events fetched successfully',
      count: upcoming.length,
      data: upcoming,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming community events',
      details: err.message,
    });
  }
};

// Read all events
const getEvents = async (req, res) => {
  try {
    const allEvents = await events.find();
    res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      data: allEvents,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Read a single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await events.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value',
        details: err.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// Delete an event
// Delete an event + notify attendees
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // 1ï¸âƒ£ FIND EVENT WITH ATTENDEES POPULATED
    const event = await events
      .findById(eventId)
      .populate('attendees', 'email name')
      .populate('communityId', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // 2ï¸âƒ£ PREPARE EMAIL LIST
    const attendeeEmails = event.attendees.map((u) => u.email);

    // 3ï¸âƒ£ SEND EMAIL TO EACH ATTENDEE
    const emailPromises = attendeeEmails.map((email) => {
      const html = `
        <h3>Event Cancelled</h3>

        <p>Hello,</p>

        <p>The event <b>${event.title}</b> from community 
        <b>${event.communityId?.name || 'your community'}</b> 
        has been cancelled by the organizer.</p>

        <p><b>Event Details:</b></p>
        <ul>
          <li>Date: ${new Date(event.eventDate).toDateString()}</li>
          <li>Time: ${event.eventTime}</li>
          <li>Location: ${event.location}</li>
        </ul>

        <p>Sorry for the inconvenience.</p>

        <p>â€” Siyathuru Team</p>
      `;

      return sendEmail(
        email,
        `Event Cancelled: ${event.title}`,
        `The event ${event.title} has been cancelled.`,
        html,
      );
    });

    // Run emails in background (donâ€™t block delete)
    Promise.allSettled(emailPromises);

    // 4ï¸âƒ£ DELETE EVENT
    await events.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully & notifications sent',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// ================= USER JOIN EVENT =================

const joinEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'eventId and userId required',
      });
    }

    const event = await events.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // CHECK ALREADY JOINED
    if (event.attendees.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User already joined this event',
      });
    }

    event.attendees.push(userId);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Joined event successfully',
      data: event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message,
    });
  }
};

// ============ GET EVENTS BY USER COMMUNITIES ============

const getEventsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. FIND USER
    const user = await require('../models/user').findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // 2. FIND EVENTS FROM USER COMMUNITIES
    const userEvents = await events
      .find({
        communityId: { $in: user.joinedCommunities },
      })
      .populate('communityId', 'name profileImage')
      .populate('attendees', 'name email')
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: userEvents.length,
      data: userEvents,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user events',
      details: err.message,
    });
  }
};

const getNumberOfEvents = async (req, res) => {
  try {
    const eventCount = await events.countDocuments();
    res.status(200).json({
      success: true,
      count: eventCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event count',
      details: err.message,
    });
  }
};

module.exports = {
  createEvent,
  getEventsByCommunityId,
  getUpcomingEventsByCommunityId,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  getEventsByUserId,
  getNumberOfEvents,
};
