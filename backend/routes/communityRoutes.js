const express = require("express");
const {
    createCommunity,
    getCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity,
} = require("../controllers/communityController");

const upload = require("../middleware/upload"); // multer + Cloudinary

const router = express.Router();

// CRUD routes
router.get("/", getCommunities);            // Get all communities
router.get("/:id", getCommunityById);       // Get a single community by ID

// CREATE new community with image upload
router.post(
    "/",
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

module.exports = router;
