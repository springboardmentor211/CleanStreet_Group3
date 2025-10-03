const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/email');
const upload = require('../middleware/upload');
const { uploadAvatar, deleteImage } = require('../utils/cloudinary');
const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username', 'Username is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('fullName', 'Full name is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, fullName, phoneNumber } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      fullName,
      phoneNumber
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role || 'citizen'
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for hardcoded admin credentials first
    if (email === 'admin@cleanstreet.com' && password === 'admin123') {
      // Create or find admin user
      let adminUser = await User.findOne({ email: 'admin@cleanstreet.com' });
      
      if (!adminUser) {
        // Create admin user if it doesn't exist
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        adminUser = new User({
          username: 'admin',
          email: 'admin@cleanstreet.com',
          password: hashedPassword,
          fullName: 'System Administrator',
          role: 'admin'
        });
        
        await adminUser.save();
      }

      // Return token for admin
      const payload = {
        user: {
          id: adminUser.id,
          role: 'admin'
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: adminUser.id,
              username: adminUser.username,
              email: adminUser.email,
              fullName: adminUser.fullName,
              role: 'admin'
            }
          });
        }
      );
      return;
    }

    // Check if user exists
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role || 'citizen'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role || 'citizen'
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if the email exists or not
      return res.json({ message: 'If an account exists with this email, password reset instructions will be sent' });
    }

    // Create reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET + user.password,
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({ success: true, message: 'Password reset link has been sent to your email.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', [
  body('token', 'Reset token is required').not().isEmpty(),
  body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  console.log('=== Reset Password Route Called ===');
  console.log('Request body:', req.body);
  console.log('Request body keys:', Object.keys(req.body));
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;
  console.log('Extracted token length:', token ? token.length : 'No token');
  console.log('Extracted newPassword length:', newPassword ? newPassword.length : 'No newPassword');

  try {
    // Find user by token and check if token is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires +password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Verify token using user's password hash
    try {
      jwt.verify(token, process.env.JWT_SECRET + user.password);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // console.log('=== /auth/me endpoint called ===');
    // console.log('req.user from auth middleware:', req.user);
    // console.log('req.user.id:', req.user.id);
    // console.log('req.user.id type:', typeof req.user.id);
    // console.log('req.user.id length:', req.user.id ? req.user.id.length : 'No ID');
    
    // Check if it's a valid ObjectId format
    const mongoose = require('mongoose');
    // console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(req.user.id));
    
    // Try to find user with detailed logging
    // console.log('Attempting to find user by ID...');
    let user = await User.findById(req.user.id).select('-password');
    // console.log('User found by req.user.id:', user);
    
    // If not found by req.user.id, try by req.user._id
    if (!user && req.user._id) {
      // console.log('Trying with req.user._id:', req.user._id);
      user = await User.findById(req.user._id).select('-password');
      // console.log('User found by req.user._id:', user);
    }
    
    // console.log('User object keys:', user ? Object.keys(user.toObject()) : 'No user found');
    
    // Let's also try to find ANY users in the collection for debugging
    const totalUsers = await User.countDocuments();
    // console.log('Total users in collection:', totalUsers);
    
    if (totalUsers > 0) {
      const sampleUsers = await User.find({}).limit(3).select('_id username email');
      // console.log('Sample users in database:', sampleUsers);
    }
    
    if (!user) {
      // console.log('No user found with ID:', req.user.id);
      // Let's try to find by other fields to see if the user exists with different ID
      if (req.user.email) {
        const userByEmail = await User.findOne({ email: req.user.email });
        // console.log('User found by email:', userByEmail ? userByEmail._id : 'Not found');
      }
      return res.status(404).json({ message: 'User not found' });
    }
    
    // console.log('Sending user data:', user.toObject());
    res.json(user);
  } catch (err) {
    console.error('Error in /auth/me:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', [
  auth,
  body('fullName', 'Full name is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, phoneNumber, location, bio } = req.body;
  const profileFields = {};
  
  if (fullName) profileFields.fullName = fullName;
  if (phoneNumber) profileFields.phoneNumber = phoneNumber;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;

  try {
    const userId = req.user.id || req.user._id;
    let user = await User.findByIdAndUpdate(
      userId,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Debug endpoint to check users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('_id username email fullName role createdAt');
    res.json({
      total: await User.countDocuments(),
      users: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check specific user ID
router.get('/debug/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // console.log('Debug: Looking for user ID:', id);
    
    const mongoose = require('mongoose');
    // console.log('Debug: Is valid ObjectId:', mongoose.Types.ObjectId.isValid(id));
    
    const user = await User.findById(id);
    // console.log('Debug: User found:', !!user);
    
    if (user) {
      res.json({
        found: true,
        user: user
      });
    } else {
      res.json({
        found: false,
        id: id,
        totalUsers: await User.countDocuments()
      });
    }
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test reset password body
router.post('/debug/reset-password-test', async (req, res) => {
  try {
    console.log('Debug reset password test - Request body:', req.body);
    console.log('Debug reset password test - Body keys:', Object.keys(req.body));
    
    const { token, newPassword } = req.body;
    
    res.json({
      success: true,
      received: {
        token: token ? `Token of length ${token.length}` : 'No token',
        newPassword: newPassword ? `Password of length ${newPassword.length}` : 'No newPassword'
      },
      body: req.body
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Upload profile image
router.post('/upload-profile-image', [auth, upload.single('profileImage')], async (req, res) => {
  try {
    // console.log('=== Profile Image Upload Route Called ===');
    // console.log('File received:', !!req.file);
    // console.log('User from auth middleware:', req.user ? 'Present' : 'Missing');
    
    if (!req.file) {
      // console.log('No file in request');
      return res.status(400).json({ message: 'No profile image provided' });
    }
    
    // Find the user first to get current profile image
    const userId = req.user.id || req.user._id;
    // console.log('Profile image upload - User ID:', userId);
    // console.log('User ID type:', typeof userId);
    // console.log('req.user object keys:', Object.keys(req.user || {}));
    
    const user = await User.findById(userId);
    if (!user) {
      // console.log('User not found for profile image upload with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete old profile image if it exists
    if (user.profileImagePublicId) {
      try {
        await deleteImage(user.profileImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old profile image:', deleteError);
        // Continue with upload even if deletion fails
      }
    }
    
    // Upload new profile image to Cloudinary
    const result = await uploadAvatar(req.file.buffer);
    
    // Update user with new profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profileImage: result.secure_url,
        profileImagePublicId: result.public_id
      },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: result.secure_url,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





module.exports = router;