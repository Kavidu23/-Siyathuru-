const express = require("express");
const router = express.Router();
const {
    createCommunity,
    getCommunities,
    getCommunityById,
    getCommunitiesByLeader,
    updateCommunity,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
} = require("../controllers/communityController");

const upload = require("../middleware/upload"); // multer + Cloudinary
const authMiddleware = require("../middleware/authMiddleware");

// CRUD routes
router.get("/", getCommunities);            // Get all communities
router.get("/:id", getCommunityById);       // Get a single community by ID
router.get("/leader/:leaderId", getCommunitiesByLeader); // Get communities by leader ID

// CREATE new community with image upload
router.post(
    "/",
    authMiddleware,
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
    ]),
    createCommunity
);

// UPDATE community with optional image upload
router.put(
    "/:id",
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
    ]),
    updateCommunity
);

router.delete("/:id", deleteCommunity);     // Delete community by ID

// Join community
router.post("/:id/join", joinCommunity);

// Leave community
router.post("/:id/leave", leaveCommunity);

module.exports = router;
