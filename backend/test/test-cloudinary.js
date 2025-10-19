require('dotenv').config({ path: __dirname + '/.env' });
const cloudinary = require('cloudinary').v2;

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

(async () => {
    try {
        const result = await cloudinary.uploader.upload(
            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
            { folder: 'test_upload' }
        );
        console.log("✅ Upload success:", result.secure_url);
    } catch (err) {
        console.error("❌ Cloudinary error:", err);
    }
})();
