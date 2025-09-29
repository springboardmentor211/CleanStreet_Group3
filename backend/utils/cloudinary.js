const cloudinary = require('cloudinary').v2;
const { 
  CLOUDINARY_CREDENTIALS, 
  CLOUDINARY_FOLDERS, 
  TRANSFORMATION_PRESETS 
} = require('../config/cloudinary-config');

// Configure Cloudinary using configuration from config file
cloudinary.config(CLOUDINARY_CREDENTIALS);

/**
 * Upload image to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder path
 * @param {Object} options - Additional upload options
 * @returns {Promise} Cloudinary upload result
 */
const uploadImage = (buffer, folder = CLOUDINARY_FOLDERS.general, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      resource_type: 'image',
      folder: folder,
      transformation: TRANSFORMATION_PRESETS.general
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
  return uploadImage(buffer, CLOUDINARY_FOLDERS.avatars, {
    transformation: TRANSFORMATION_PRESETS.avatar
  });
};

/**
 * Upload issue image with specific transformations
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise} Cloudinary upload result
 */
const uploadIssueImage = (buffer) => {
  return uploadImage(buffer, CLOUDINARY_FOLDERS.issues, {
    transformation: TRANSFORMATION_PRESETS.issueImage
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadAvatar,
  uploadIssueImage
};