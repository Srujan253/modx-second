const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug: Log configuration (without exposing secret)
console.log("☁️ Cloudinary Configuration:");
console.log("  Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("  API Key:", process.env.CLOUDINARY_API_KEY);
console.log("  API Secret:", process.env.CLOUDINARY_API_SECRET ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "NOT SET");

module.exports = cloudinary;
