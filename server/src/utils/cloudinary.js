const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Fixed: Added resource_type: "auto"
const uploadStream = (buffer, folder = "global_connect_profiles") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // 🔥 Allows PDF, images, videos, etc.
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Delete by publicId
const deleteByPublicId = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
  } catch (err) {
    console.warn("Cloudinary delete error", err);
  }
};

// Generate signed URL for private resume (raw resource)
const getSignedResumeUrl = (publicId, expiresInSec = 60) => {
  if (!publicId) return null;

  return cloudinary.url(publicId, {
    resource_type: "raw", 
    type: "authenticated",
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSec,
  });
};

module.exports = { uploadStream, deleteByPublicId, getSignedResumeUrl };