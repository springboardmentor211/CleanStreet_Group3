const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'doiho5wlh',
  api_key: '479196295749123',
  api_secret: 'rXOdnxA0oNTxxuB4fl92TkCsO5o'
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder path
 * @param {Object} options - Additional upload options
 * @returns {Promise} Cloudinary upload result
 */
const uploadImage = (buffer, folder = 'cleanstreet', options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      resource_type: 'image',
      folder: folder,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    };

    const uploadOptions = { ...defaultOptions, ...options };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise} Cloudinary delete result
 */
const deleteImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Upload avatar with specific transformations
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise} Cloudinary upload result
 */
const uploadAvatar = (buffer) => {
  return uploadImage(buffer, 'cleanstreet/avatars', {
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' }
    ]
  });
};

/**
 * Upload issue image with specific transformations
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise} Cloudinary upload result
 */
const uploadIssueImage = (buffer) => {
  return uploadImage(buffer, 'cleanstreet/issues', {
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadAvatar,
  uploadIssueImage
};