const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload as public (raw for PDFs)
const uploadPublicPDF = (buffer, folder = "global_connect_resumes") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw", // PDFs, docs
        type: "upload", // makes it public
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
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.warn("Cloudinary delete error", err);
  }
};

// Public URL for PDF
const getPublicResumeUrl = (publicId) => {
  if (!publicId) return null;
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload", // public access
  });
};

module.exports = { uploadPublicPDF, deleteByPublicId, getPublicResumeUrl };
