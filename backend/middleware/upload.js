const multer = require('multer');
const { uploadImage } = require('../utils/cloudinary');

// Configure multer for memory storage (we'll upload to cloudinary from memory)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = { upload, uploadToCloudinary: uploadImage };