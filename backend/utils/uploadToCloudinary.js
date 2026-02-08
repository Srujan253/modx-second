const cloudinary = require("../config/cloudinary");

/**
 * Upload image to Cloudinary
 * @param {String} fileBuffer - Base64 string or file buffer
 * @param {String} folder - Cloudinary folder name (e.g., 'profiles', 'projects')
 * @returns {Promise<String>} - Secure URL of uploaded image
 */
const uploadToCloudinary = async (fileBuffer, folder = "modx") => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

/**
 * Upload base64 image to Cloudinary
 * @param {String} base64String - Base64 encoded image
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} - Secure URL of uploaded image
 */
const uploadBase64ToCloudinary = async (base64String, folder = "modx") => {
  try {
    console.log("📤 Attempting Cloudinary upload to folder:", folder);
    console.log("📦 Image size:", Math.round(base64String.length / 1024), "KB");
    
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto:good" },
      ],
    });
    
    console.log("✅ Upload successful! URL:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    throw new Error("Failed to upload image to Cloudinary");
  }
};

module.exports = {
  uploadToCloudinary,
  uploadBase64ToCloudinary,
};
