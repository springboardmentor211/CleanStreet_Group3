const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { blockUser, getUserDetails, getBlockedUsers } = require('../controllers/adminController');
const router = express.Router();

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

    // Build filter object - exclude soft deleted issues
    const filter = { isDeleted: { $ne: true } };
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
    const users = await User.find()
      .select('-password')
      .populate('blockedBy', 'username fullName')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Block/Unblock user
router.put('/users/:userId/block', auth, adminAuth, blockUser);

// Get user details with block info
router.get('/users/:userId/details', auth, adminAuth, getUserDetails);

// Get blocked users
router.get('/users/blocked', auth, adminAuth, getBlockedUsers);

// Get admin statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIssues = await Issue.countDocuments({ isDeleted: { $ne: true } });
    
    // Issues by category (exclude soft deleted)
    const issuesByCategory = await Issue.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Issues by status (exclude soft deleted)
    const issuesByStatus = await Issue.aggregate([
      { $match: { isDeleted: { $ne: true } } },
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

// Get monthly issue trends
router.get('/trends', auth, adminAuth, async (req, res) => {
  try {
    // Get issues from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    // Create array for last 6 months with proper month names
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      // Find matching data or default to 0
      const monthData = monthlyTrends.find(trend => 
        trend._id.year === year && trend._id.month === month
      );
      
      months.push({
        month: monthName,
        count: monthData ? monthData.count : 0,
        year: year,
        monthNumber: month
      });
    }
    
    res.json({ monthlyTrends: months });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;