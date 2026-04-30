const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'skillhive' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, filename: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

module.exports = { uploadToCloudinary };