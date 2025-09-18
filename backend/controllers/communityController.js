const Community = require("../models/communities");

// CREATE a new community
const createCommunity = async (req, res) => {
    try {
        const {
            name,
            type,
            mission,
            description,
            bannerImage,
            profileImage,
            location,
            contact,
            isPrivate,
            members,
            leader,
            established
        } = req.body;

        const newCommunity = await Community.create({
            name,
            type,
            mission,
            description,
            bannerImage,
            profileImage,
            location,
            contact,
            isPrivate,
            members,
            leader,
            established
        });

        res.status(201).json({
            success: true,
            message: "Community created successfully",
            data: newCommunity
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

// READ all communities
const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find();
        res.status(200).json({
            success: true,
            message: "Communities fetched successfully",
            data: communities
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch communities",
            details: err.message
        });
    }
};

// READ single community by ID
const getCommunityById = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({
                success: false,
                error: "Community not found"
            });
        }
        res.status(200).json({
            success: true,
            data: community
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch community",
            details: err.message
        });
    }
};

// UPDATE a community
const updateCommunity = async (req, res) => {
    try {
        const updatedCommunity = await Community.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCommunity) {
            return res.status(404).json({
                success: false,
                error: "Community not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Community updated successfully",
            data: updatedCommunity
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

// DELETE a community
const deleteCommunity = async (req, res) => {
    try {
        const deletedCommunity = await Community.findByIdAndDelete(req.params.id);
        if (!deletedCommunity) {
            return res.status(404).json({
                success: false,
                error: "Community not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Community deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
};

module.exports = {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity
};
