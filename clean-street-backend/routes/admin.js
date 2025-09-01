const express = require('express');
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');
const User = require('../models/User');
const router = express.Router();

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Get all issues (admin view)
router.get('/issues', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'username fullName email')
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

// Update issue status (admin only)
router.put('/issues/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, estimatedResolution } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (status) issue.status = status;
    if (estimatedResolution) issue.estimatedResolution = estimatedResolution;

    await issue.save();
    await issue.populate('reportedBy', 'username fullName');
    await issue.populate('assignedTo', 'username fullName');

    res.json(issue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Assign issue to admin
router.put('/issues/:id/assign', auth, adminAuth, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.assignedTo = assignedTo;
    await issue.save();
    await issue.populate('reportedBy', 'username fullName');
    await issue.populate('assignedTo', 'username fullName');

    res.json(issue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get admin statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIssues = await Issue.countDocuments();
    
    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Issues by status
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Recent registrations (last 7 days)
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      totalUsers,
      totalIssues,
      issuesByCategory,
      issuesByStatus,
      recentRegistrations
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;