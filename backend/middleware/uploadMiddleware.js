const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    let options = {
      folder: folder
    };

    if (file.originalname) {
      const ext = path.extname(file.originalname).substring(1);
      const baseName = path.basename(file.originalname, '.' + ext).replace(/[^a-zA-Z0-9]/g, '_');
      
      if (file.mimetype.startsWith('image/')) {
        options.resource_type = 'image';
        options.public_id = `${baseName}_${Date.now()}`;
      } else {
        options.resource_type = 'raw';
        options.public_id = `${baseName}_${Date.now()}.${ext}`;
      }
    } else {
      options.resource_type = 'auto';
    }

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
  });
};

const deleteFromCloudinary = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || !url.includes('res.cloudinary.com')) {
      return resolve(null);
    }
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return resolve(null);
      const afterUpload = parts[1].replace(/^v\d+\//, '');
      const publicId = afterUpload.replace(/\.[^.]+$/, '');
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
