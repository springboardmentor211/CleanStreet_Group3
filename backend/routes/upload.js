const express = require('express');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage, uploadAvatar, deleteImage } = require('../utils/cloudinary');
const router = express.Router();

// Upload single image
router.post('/image', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadImage(req.file.buffer, 'cleanstreet/general');
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Upload multiple images
router.post('/images', [auth, upload.array('images', 8)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadImage(file.buffer, 'cleanstreet/general')
    );
    
    const results = await Promise.all(uploadPromises);
    
    const imageData = results.map(result => ({
      imageUrl: result.secure_url,
      publicId: result.public_id
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: imageData
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// Upload profile avatar
router.post('/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    // Upload to Cloudinary with avatar-specific transformations
    const result = await uploadAvatar(req.file.buffer);
    
    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Delete image by public ID
router.delete('/image/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

module.exports = router;