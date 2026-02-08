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

/**
 * Upload base64 document (PDF, DOC, etc.) to Cloudinary
 * @param {String} base64String - Base64 encoded document
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} - Secure URL of uploaded document
 */
const uploadDocumentToCloudinary = async (base64String, folder = "modx") => {
  try {
    console.log("📄 Attempting Cloudinary document upload to folder:", folder);
    console.log("📦 Document size:", Math.round(base64String.length / 1024), "KB");
    
    // Generate a timestamp-based filename
    const timestamp = Date.now();
    const publicId = `${folder}/resume_${timestamp}`;
    
    const result = await cloudinary.uploader.upload(base64String, {
      public_id: publicId,
      resource_type: "image", // PDFs work best as 'image' type for browser viewing
      format: "pdf",
      type: "upload", // Explicitly set upload type
      access_mode: "public", // Make publicly accessible like profile images
    });
    
    console.log("✅ Document upload successful! URL:", result.secure_url);
    console.log("📋 Public ID:", result.public_id);
    console.log("📋 Format:", result.format);
    console.log("📋 Resource type:", result.resource_type);
    console.log("📋 Access mode:", result.access_mode);
    
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary document upload error:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    throw new Error("Failed to upload document to Cloudinary");
  }
};

module.exports = {
  uploadToCloudinary,
  uploadBase64ToCloudinary,
  uploadDocumentToCloudinary,
};
