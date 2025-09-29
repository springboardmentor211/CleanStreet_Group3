// Quick test script to debug authentication issue
const jwt = require('jsonwebtoken');

// Test if we can decode a JWT token
const token = ""; // Paste your token here from browser localStorage

if (token) {
  try {
    const decoded = jwt.decode(token);
    console.log("Decoded token:", decoded);
    console.log("User ID:", decoded.user?.id);
    console.log("Expires:", new Date(decoded.exp * 1000));
    console.log("Is expired:", Date.now() >= decoded.exp * 1000);
  } catch (error) {
    console.error("Error decoding token:", error);
  }
} else {
  console.log("No token provided");
}

// Test MongoDB connection and check users
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function testDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet');
    console.log("Connected to MongoDB");
    
    const users = await User.find({}).select('_id username email fullName');
    console.log("All users in database:", users);
    
    if (users.length === 0) {
      console.log("No users found in database!");
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error("Database error:", error);
  }
}

// Uncomment to test database
// testDB();