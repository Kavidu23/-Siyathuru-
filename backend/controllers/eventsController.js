const events = require('../models/events');

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
const deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await events.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                error: "Event not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
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
