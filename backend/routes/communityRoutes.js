const express = require("express");
const {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity,
} = require("../controllers/communityController");

const router = express.Router();

// CRUD routes
router.get("/", getCommunities);            // Get all communities
router.get("/:id", getCommunityById);       // Get a single community by ID
router.post("/", createCommunity);          // Create new community
router.put("/:id", updateCommunity);        // Update community by ID
router.delete("/:id", deleteCommunity);     // Delete community by ID

module.exports = router; // CommonJS export
