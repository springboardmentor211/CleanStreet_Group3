const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const bookmarkRoutes = require('./routes/bookmarks');

const app = express();

// Security middleware
app.use(helmet());


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
});
app.use(limiter);


// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allowed frontend origins (add your frontend port here)
    const allowedOrigins = [
      'http://localhost:8080', // Your frontend port
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Set CORS headers for static image files (fix NotSameOrigin for images)
app.use('/uploads/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Clean Street API is running!',
    version: '1.0.0'
  });
});

// Test issues endpoint
app.get('/api/test-issues', async (req, res) => {
  try {
    const Issue = require('./models/Issue');
    const count = await Issue.countDocuments({ isDeleted: { $ne: true } });
    const issues = await Issue.find({ isDeleted: { $ne: true } }).limit(5);
    res.json({
      success: true,
      message: 'Issues endpoint working',
      totalIssues: count,
      sampleIssues: issues
    });
  } catch (error) {
    console.error('Test issues error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug endpoint to check current status values in database
app.get('/api/debug-status', async (req, res) => {
  try {
    const Issue = require('./models/Issue');
    
    // Get all unique status values from the database
    const statusCounts = await Issue.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const totalIssues = await Issue.countDocuments({ isDeleted: { $ne: true } });
    
    // Also get sample issues to see their actual status values
    const sampleIssues = await Issue.find({ isDeleted: { $ne: true } })
      .select('title status createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      totalIssues,
      statusBreakdown: statusCounts,
      sampleIssues,
      message: 'Current status values in database'
    });
  } catch (error) {
    console.error('Debug status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create test issues with proper status values (for testing)
app.post('/api/create-test-issues', async (req, res) => {
  try {
    const Issue = require('./models/Issue');
    const User = require('./models/User');
    
    // Find a user to assign as reporter (or create one)
    let testUser = await User.findOne({ email: 'test@cleanstreet.com' });
    if (!testUser) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      testUser = new User({
        username: 'testuser',
        email: 'test@cleanstreet.com',
        password: await bcrypt.hash('testpass123', salt),
        fullName: 'Test User'
      });
      await testUser.save();
    }
    
    const testIssues = [
      {
        title: 'Test Pothole Issue',
        description: 'A large pothole on Main Street causing traffic issues',
        category: 'Pothole',
        address: '123 Main Street, City',
        location: { type: 'Point', coordinates: [-74.006, 40.7128] },
        status: 'Received',
        priority: 'High',
        reportedBy: testUser._id
      },
      {
        title: 'Test Garbage Collection',
        description: 'Overflowing garbage bins on Elm Street',
        category: 'Garbage',
        address: '456 Elm Street, City',
        location: { type: 'Point', coordinates: [-74.007, 40.7129] },
        status: 'In Progress',
        priority: 'Medium',
        reportedBy: testUser._id
      },
      {
        title: 'Test Streetlight Repair',
        description: 'Broken streetlight creating safety hazard',
        category: 'Streetlight',
        address: '789 Oak Avenue, City',
        location: { type: 'Point', coordinates: [-74.008, 40.7130] },
        status: 'Resolved',
        priority: 'Medium',
        reportedBy: testUser._id
      }
    ];
    
    const createdIssues = await Issue.insertMany(testIssues);
    
    res.json({
      success: true,
      message: 'Test issues created successfully',
      createdCount: createdIssues.length,
      issues: createdIssues
    });
  } catch (error) {
    console.error('Create test issues error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup invalid votes endpoint (run once to fix existing data)
app.post('/api/cleanup-votes', async (req, res) => {
  try {
    const Issue = require('./models/Issue');
    const issues = await Issue.find({});
    
    let cleanedCount = 0;
    for (let issue of issues) {
      const originalVotersCount = issue.voters.length;
      // Remove votes with null or undefined users
      issue.voters = issue.voters.filter(vote => vote && vote.user);
      
      if (issue.voters.length !== originalVotersCount) {
        cleanedCount++;
        await issue.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Cleanup completed',
      issuesProcessed: issues.length,
      issuesCleaned: cleanedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Migrate status values from old format to new format
app.post('/api/migrate-status', async (req, res) => {
  try {
    const Issue = require('./models/Issue');
    
    // Status mapping from old to new
    const statusMapping = {
      'open': 'Received',
      'in-progress': 'In Progress', 
      'resolved': 'Resolved',
      'closed': 'Closed',
      'pending': 'Pending'
    };
    
    let migratedCount = 0;
    
    for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
      const result = await Issue.updateMany(
        { status: oldStatus, isDeleted: { $ne: true } },
        { $set: { status: newStatus } }
      );
      migratedCount += result.modifiedCount;
      console.log(`Migrated ${result.modifiedCount} issues from '${oldStatus}' to '${newStatus}'`);
    }
    
    // Also handle any issues with null/undefined status
    const nullStatusResult = await Issue.updateMany(
      { $or: [{ status: null }, { status: { $exists: false } }], isDeleted: { $ne: true } },
      { $set: { status: 'Received' } }
    );
    migratedCount += nullStatusResult.modifiedCount;
    console.log(`Set default status for ${nullStatusResult.modifiedCount} issues with null/undefined status`);
    
    res.json({
      success: true,
      message: 'Status migration completed',
      migratedCount,
      statusMapping
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Database connection
// console.log("MONGODB_URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT,  "0.0.0.0",() => {
  console.log(`Clean Street server is running on port ${PORT}`);
});