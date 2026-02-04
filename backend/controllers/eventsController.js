const events = require('../models/events');
const sendEmail = require('../utils/sendEmail');

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
            attendees
        } = req.body;

        const newEvent = await events.create({
            communityId,
            title,
            description,
            location,
            eventDate,
            eventTime,
            bannerImage,
            attendees
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: newEvent
        });
    }

    catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: err.message
            });
        }
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Duplicate field value",
                details: err.message
            });
        }
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        })

    }
};

// Read all events
const getEvents = async (req, res) => {
    try {
        const allEvents = await events.find();
        res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: allEvents
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
}

// Read a single event by ID
const getEventById = async (req, res) => {
    try {
        const event = await events.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Event not found"
            });
        }
        res.status(200).json({
            success: true,
            data: event
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
};


// Update an event
const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await events.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                error: "Event not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: updatedEvent
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: err.message
            });
        }
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Duplicate field value",
                details: err.message
            });
        }
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
};

// Delete an event
// Delete an event + notify attendees
const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;

        // 1️⃣ FIND EVENT WITH ATTENDEES POPULATED
        const event = await events
            .findById(eventId)
            .populate("attendees", "email name")
            .populate("communityId", "name");

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Event not found",
            });
        }

        // 2️⃣ PREPARE EMAIL LIST
        const attendeeEmails = event.attendees.map((u) => u.email);

        // 3️⃣ SEND EMAIL TO EACH ATTENDEE
        const emailPromises = attendeeEmails.map((email) => {
            const html = `
        <h3>Event Cancelled</h3>

        <p>Hello,</p>

        <p>The event <b>${event.title}</b> from community 
        <b>${event.communityId?.name || "your community"}</b> 
        has been cancelled by the organizer.</p>

        <p><b>Event Details:</b></p>
        <ul>
          <li>Date: ${new Date(event.eventDate).toDateString()}</li>
          <li>Time: ${event.eventTime}</li>
          <li>Location: ${event.location}</li>
        </ul>

        <p>Sorry for the inconvenience.</p>

        <p>— Siyathuru Team</p>
      `;

            return sendEmail(
                email,
                `Event Cancelled: ${event.title}`,
                `The event ${event.title} has been cancelled.`,
                html
            );
        });

        // Run emails in background (don’t block delete)
        Promise.allSettled(emailPromises);

        // 4️⃣ DELETE EVENT
        await events.findByIdAndDelete(eventId);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully & notifications sent",
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
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
                error: "eventId and userId required",
            });
        }

        const event = await events.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Event not found",
            });
        }

        // CHECK ALREADY JOINED
        if (event.attendees.includes(userId)) {
            return res.status(400).json({
                success: false,
                error: "User already joined this event",
            });
        }

        event.attendees.push(userId);
        await event.save();

        res.status(200).json({
            success: true,
            message: "Joined event successfully",
            data: event,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
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
                error: "User not found",
            });
        }

        // 2. FIND EVENTS FROM USER COMMUNITIES
        const userEvents = await events
            .find({
                communityId: { $in: user.joinedCommunities },
            })
            .populate("communityId", "name profileImage")
            .populate("attendees", "name email")
            .sort({ eventDate: 1 });

        res.status(200).json({
            success: true,
            count: userEvents.length,
            data: userEvents,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch user events",
            details: err.message,
        });
    }
};


module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    joinEvent,
    getEventsByUserId
};
