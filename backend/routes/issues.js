const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Issue = require('../models/Issue');
const User = require('../models/User');
const router = express.Router();

// Get all issues with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
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

    res.json(issue);
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
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    // Extract image file paths from req.files
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    const issue = new Issue({
      title,
      description,
      category,
      address: req.body.address,
      location,
      images,
      priority: priority || 'Medium',
      reportedBy: req.user.id
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
    if (issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
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
    if (issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
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
    const userId = req.user.id;

    // Check if user already voted
    const hasVoted = issue.voters.includes(userId);
    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted on this issue' });
    }

    // Update vote count
    if (type === 'up') {
      issue.upvotes += 1;
    } else if (type === 'down') {
      issue.downvotes += 1;
    } else {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Add user to voters list
    issue.voters.push(userId);
    await issue.save();

    res.json({ 
      success: true,
      upvotes: issue.upvotes,
      downvotes: issue.downvotes
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
      user: req.user.id,
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
    const openIssues = await Issue.countDocuments({ status: 'open', isDeleted: { $ne: true } });
    const inProgressIssues = await Issue.countDocuments({ status: 'in-progress', isDeleted: { $ne: true } });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved', isDeleted: { $ne: true } });

    // Get recent activity (last 10 resolved or updated issues)
    const recentActivity = await Issue.find({
      isDeleted: { $ne: true },
      $or: [
        { status: 'resolved' },
        { updatedAt: { $gte: new Date(Date.now() - 72 * 60 * 60 * 1000) } }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('reportedBy', 'username fullName');

    res.json({
      total: totalIssues,
      open: openIssues,
      inProgress: inProgressIssues,
      resolved: resolvedIssues,
      recentActivity
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;