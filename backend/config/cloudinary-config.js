// Cloudinary Configuration - Hardcoded values (no environment variables)
// These values are taken from the original configuration

const CLOUDINARY_CREDENTIALS = {
  cloud_name: 'doiho5wlh',
  api_key: '479196295749123',
  api_secret: 'rXOdnxA0oNTxxuB4fl92TkCsO5o'
};

// Cloudinary folder structure
const CLOUDINARY_FOLDERS = {
  avatars: 'cleanstreet/avatars',
  issues: 'cleanstreet/issues',
  general: 'cleanstreet/general',
  uploads: 'cleanstreet/uploads'
};

// Transformation presets
const TRANSFORMATION_PRESETS = {
  avatar: [
    { width: 200, height: 200, crop: 'fill', gravity: 'face' },
    { quality: 'auto:good' }
  ],
  issueImage: [
    { width: 800, height: 600, crop: 'limit' },
    { quality: 'auto:good' }
  ],
  general: [
    { width: 1000, height: 1000, crop: 'limit' },
    { quality: 'auto:good' }
  ]
};

module.exports = {
  CLOUDINARY_CREDENTIALS,
  CLOUDINARY_FOLDERS,
  TRANSFORMATION_PRESETS
};