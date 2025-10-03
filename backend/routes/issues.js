const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadIssueImage } = require('../utils/cloudinary');
const Issue = require('../models/Issue');
const User = require('../models/User');
const router = express.Router();

// Get all issues with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      status,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - exclude soft deleted issues
    const filter = { isDeleted: { $ne: true } };
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'username fullName')
      .populate('assignedTo', 'username fullName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get user's vote status if authenticated
    let userId = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Handle different token structures safely
        if (decoded.user && (decoded.user.id || decoded.user._id)) {
          userId = decoded.user.id || decoded.user._id;
        } else if (decoded.id || decoded._id) {
          userId = decoded.id || decoded._id;
        } else if (decoded.userId) {
          userId = decoded.userId;
        }
      } catch (err) {
        // Token invalid or expired, continue without user vote info
        console.log('Token parsing error in GET /issues:', err.message);
      }
    }

    // Add user vote information to each issue
    const issuesWithUserVotes = issues.map(issue => {
      const issueObj = issue.toObject();
      
      if (userId) {
        // Filter out votes with null users first, then find the matching vote
        const validVotes = issue.voters.filter(vote => vote && vote.user);
        const existingVote = validVotes.find(vote => 
          vote.user.toString() === userId.toString()
        );
        issueObj.userVote = existingVote ? existingVote.voteType : null;
      } else {
        issueObj.userVote = null;
      }
      
      return issueObj;
    });

    const total = await Issue.countDocuments(filter);

    res.json({
      issues: issuesWithUserVotes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('GET /issues error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'Error in GET /issues route'
    });
  }
});

// Get a specific issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('reportedBy', 'username fullName')
      .populate('assignedTo', 'username fullName')
      .populate('comments.user', 'username fullName');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Get user's vote status if authenticated
    let userVote = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Handle different token structures safely
        let userId = null;
        if (decoded.user && (decoded.user.id || decoded.user._id)) {
          userId = decoded.user.id || decoded.user._id;
        } else if (decoded.id || decoded._id) {
          userId = decoded.id || decoded._id;
        } else if (decoded.userId) {
          userId = decoded.userId;
        }
        
        if (userId) {
          // Filter out votes with null users first, then find the matching vote
          const validVotes = issue.voters.filter(vote => vote && vote.user);
          const existingVote = validVotes.find(vote => 
            vote.user.toString() === userId.toString()
          );
          userVote = existingVote ? existingVote.voteType : null;
        }
      } catch (err) {
        // Token invalid or expired, continue without user vote info
        console.log('Token parsing error in GET /issues/:id:', err.message);
      }
    }

    const issueData = issue.toObject();
    issueData.userVote = userVote;

    res.json(issueData);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).send('Server error');
  }
});

// Create a new issue
router.post('/', [
  auth,
  upload.array('images', 8), // Accept up to 8 images
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['Pothole', 'Garbage', 'Streetlight', 'Water', 'Other']).withMessage('Invalid category'),
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    console.log('=== Create Issue Request ===');
    console.log('Body:', req.body);
    console.log('Files count:', req.files ? req.files.length : 0);
    console.log('User:', req.user ? req.user.username : 'No user');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    let { title, description, category, location, priority } = req.body;

    // Parse location if it's a string
    if (location && typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid location format' });
      }
    }

    // Upload images to Cloudinary if files are present
    let images = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} images to Cloudinary...`);
      
      try {
        const uploadPromises = req.files.map(file => uploadIssueImage(file.buffer));
        const uploadResults = await Promise.all(uploadPromises);
        images = uploadResults.map(result => result.secure_url);
        console.log('Images uploaded successfully:', images);
      } catch (uploadError) {
        console.error('Error uploading images to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Error uploading images. Please try again.' });
      }
    }

    const issue = new Issue({
      title,
      description,
      category,
      address: req.body.address,
      location,
      images,
      priority: priority || 'Medium',
      reportedBy: req.user.id || req.user._id
    });

    await issue.save();
    await issue.populate('reportedBy', 'username fullName');

    res.status(201).json(issue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update an issue
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is the reporter or an admin
    const userId = req.user.id || req.user._id;
    if (issue.reportedBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    if (assignedTo) issue.assignedTo = assignedTo;

    await issue.save();
    await issue.populate('reportedBy', 'username fullName');
    await issue.populate('assignedTo', 'username fullName');

    res.json(issue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete an issue
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is the reporter or an admin
    const userIdForDelete = req.user.id || req.user._id;
    if (issue.reportedBy.toString() !== userIdForDelete && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: 'Issue removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).send('Server error');
  }
});

// Vote for an issue
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const { type } = req.body; // 'up' or 'down'
    const userId = req.user.id || req.user._id;

    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Find existing vote by this user (filter out null votes first)
    const existingVoteIndex = issue.voters.findIndex(vote => 
      vote && vote.user && vote.user.toString() === userId.toString()
    );

    if (existingVoteIndex !== -1) {
      const existingVote = issue.voters[existingVoteIndex];
      
      // If same vote type, undo the vote
      if (existingVote.voteType === type) {
        // Remove the vote
        issue.voters.splice(existingVoteIndex, 1);
        if (type === 'up') {
          issue.upvotes = Math.max(0, issue.upvotes - 1);
        } else {
          issue.downvotes = Math.max(0, issue.downvotes - 1);
        }
      } else {
        // Change vote type
        // First, decrease the count for the old vote
        if (existingVote.voteType === 'up') {
          issue.upvotes = Math.max(0, issue.upvotes - 1);
          issue.downvotes += 1;
        } else {
          issue.downvotes = Math.max(0, issue.downvotes - 1);
          issue.upvotes += 1;
        }
        // Update the vote type
        issue.voters[existingVoteIndex].voteType = type;
      }
    } else {
      // New vote
      if (type === 'up') {
        issue.upvotes += 1;
      } else {
        issue.downvotes += 1;
      }
      
      issue.voters.push({
        user: userId,
        voteType: type
      });
    }

    await issue.save();

    // Get user's current vote status (filter out null votes first)
    const validVotes = issue.voters.filter(vote => vote && vote.user);
    const currentUserVote = validVotes.find(vote => 
      vote.user.toString() === userId.toString()
    );

    res.json({ 
      success: true,
      upvotes: issue.upvotes,
      downvotes: issue.downvotes,
      userVote: currentUserVote ? currentUserVote.voteType : null
    });
  } catch (error) {
    console.error('Vote error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a comment to an issue
router.post('/:id/comment', [
  auth,
  body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const { text } = req.body;

    issue.comments.push({
      user: req.user.id || req.user._id,
      text
    });

    await issue.save();
    await issue.populate('comments.user', 'username fullName');

    res.json(issue.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get issues by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { reportedBy: req.params.userId, isDeleted: { $ne: true } };
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(filter);

    res.json({
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments({ isDeleted: { $ne: true } });
    
    // Handle both old and new status values for backward compatibility
    const openIssues = await Issue.countDocuments({ 
      $or: [
        // New status values
        { status: 'Received' }, 
        { status: 'Open' }, 
        { status: 'Pending' },
        // Old status values (for existing data)
        { status: 'open' },
        { status: 'pending' }
      ], 
      isDeleted: { $ne: true } 
    });
    
    const inProgressIssues = await Issue.countDocuments({ 
      $or: [
        // New status values
        { status: 'In Progress' }, 
        { status: 'Assigned' }, 
        { status: 'Under Review' },
        // Old status values (for existing data)
        { status: 'in-progress' },
        { status: 'assigned' },
        { status: 'under-review' }
      ], 
      isDeleted: { $ne: true } 
    });
    
    const resolvedIssues = await Issue.countDocuments({ 
      $or: [
        // New status value
        { status: 'Resolved' },
        // Old status value (for existing data)
        { status: 'resolved' }
      ], 
      isDeleted: { $ne: true } 
    });

    // Get recent activity (last 10 resolved or updated issues)
    const recentActivity = await Issue.find({
      isDeleted: { $ne: true },
      $or: [
        { status: { $in: ['resolved', 'Resolved', 'closed', 'Closed'] } },
        { updatedAt: { $gte: new Date(Date.now() - 72 * 60 * 60 * 1000) } }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('reportedBy', 'username fullName');

    console.log('Dashboard Stats:', {
      total: totalIssues,
      open: openIssues,
      inProgress: inProgressIssues,
      resolved: resolvedIssues
    });

    res.json({
      total: totalIssues,
      open: openIssues,
      inProgress: inProgressIssues,
      resolved: resolvedIssues,
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get user-specific recent activity for dashboard
router.get('/stats/user-activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 3 } = req.query;

    // Get recent issues by the specific user (last 3 issues)
    const userRecentActivity = await Issue.find({
      reportedBy: userId,
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('reportedBy', 'username fullName');

    res.json({
      recentActivity: userRecentActivity
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;