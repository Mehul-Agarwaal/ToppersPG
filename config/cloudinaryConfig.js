const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage to upload files to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pg-dashboard', // The folder name on Cloudinary
    
    // Generate a unique public ID for each file
    public_id: (req, file) => `resident-${file.fieldname}-${Date.now()}`,
  },
});

// Initialize multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload
};
