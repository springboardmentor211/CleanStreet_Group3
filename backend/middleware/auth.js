// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const auth = async (req, res, next) => {
//   try {
//     // Get token from header
//     const token = req.header('x-auth-token');

//     // Check if no token
//     if (!token) {
//       return res.status(401).json({ message: 'No token, authorization denied' });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Check if user still exists
//     const user = await User.findById(decoded.user.id).select('-password');
//     if (!user) {
//       return res.status(401).json({ message: 'Token is not valid' });
//     }
    
//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

// const adminAuth = async (req, res, next) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Admin access required' });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = { auth, adminAuth };


const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // console.log('Auth middleware called');
    // console.log('Headers:', req.headers);
    
    const authHeader = req.header('authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Get only the token part
    }
    // console.log('Token Received:', token);
    

    // Check if no token
    if (!token) {
      // console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    // console.log('Token decoded:', decoded);
    
    // Handle different token structures safely
    let userId = null;
    if (decoded.user && (decoded.user.id || decoded.user._id)) {
      userId = decoded.user.id || decoded.user._id;
    } else if (decoded.id || decoded._id) {
      userId = decoded.id || decoded._id;
    } else if (decoded.userId) {
      userId = decoded.userId;
    }

    if (!userId) {
      console.error('No valid user ID found in token:', decoded);
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    // console.log('Looking for user with ID:', userId);
    // console.log('User ID type:', typeof userId);
    
    const mongoose = require('mongoose');
    // console.log('Is valid ObjectId in middleware:', mongoose.Types.ObjectId.isValid(userId));
    
    const user = await User.findById(userId).select('-password');
    // console.log('User found in auth middleware:', !!user);
    
    if (!user) {
      // console.log('User not found for token in middleware');
      // Let's check total users for debugging
      const totalUsers = await User.countDocuments();
      // console.log('Total users in collection (middleware):', totalUsers);
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Add role information to user object for middleware chain
    req.user = {
      ...user.toObject(),
      id: user._id.toString(), // Ensure we have 'id' field pointing to MongoDB's '_id'
      role: decoded.user.role || user.role || 'citizen'
    };
    // console.log('User authenticated:', user.username, 'Role:', req.user.role);
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, adminAuth };