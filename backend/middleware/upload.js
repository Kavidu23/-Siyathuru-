const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ✅ define storage with resizing and folder
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "communities",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [
            { width: 1280, height: 720, crop: "limit", quality: "auto" }, // ↓ auto-optimize size
        ],
    },
});

const upload = multer({ storage });

module.exports = upload;
