const express = require('express');
const UserActivityLog = require('../models/UserActivityLog');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

/**
 * POST /api/activity-logs
 * Log activity from frontend
 */
router.post('/', auth, async (req, res) => {
  try {
    const { action, category, details = {}, targetResource, metadata = {} } = req.body;
    const userId = req.user._id;

    if (!action || !category) {
      return res.status(400).json({ 
        error: 'Action and category are required' 
      });
    }

    // Validate category
    const validCategories = [
      'authentication', 'bookmark', 'download', 'share', 
      'engagement', 'issue_management', 'profile', 'admin', 'navigation'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category' 
      });
    }

    // Log the activity directly using UserActivityLog model
    const logEntry = new UserActivityLog({
      userId,
      action,
      category,
      details: {
        ...details,
        clientInitiated: true
      },
      metadata: {
        ...metadata,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        frontendLog: true
      },
      targetResource,
      timestamp: new Date()
    });

    await logEntry.save();

    res.status(201).json({ 
      success: true, 
      message: 'Activity logged successfully',
      logId: logEntry._id
    });
  } catch (error) {
    console.error('Activity logging API error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /api/activity-logs/user/:userId
 * Get user activities (admin only or own activities)
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 50, 
      category,
      action,
      startDate,
      endDate
    } = req.query;

    // Check if user can access these logs
    const isAdmin = req.user.role === 'admin';
    const isOwnLogs = req.user._id.toString() === userId;

    if (!isAdmin && !isOwnLogs) {
      return res.status(403).json({ 
        error: 'Access denied: Can only view own activity logs' 
      });
    }

    const activities = await UserActivityLog.getUserActivities(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      action,
      startDate,
      endDate
    });

    // Get total count for pagination
    let query = { userId };
    if (category) query.category = category;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const totalCount = await UserActivityLog.countDocuments(query);

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: totalCount > (parseInt(page) * parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities' 
    });
  }
});

/**
 * GET /api/activity-logs/stats/:userId
 * Get activity statistics by category
 */
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Check if user can access these stats
    const isAdmin = req.user.role === 'admin';
    const isOwnStats = req.user._id.toString() === userId;

    if (!isAdmin && !isOwnStats) {
      return res.status(403).json({ 
        error: 'Access denied: Can only view own activity stats' 
      });
    }

    const [categoryStats, generalStats] = await Promise.all([
      UserActivityLog.getCategoryStats(userId, timeframe),
      UserActivityLog.getUserStats(userId, timeframe)
    ]);

    res.json({
      categoryStats,
      generalStats,
      timeframe
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activity statistics' 
    });
  }
});

module.exports = router;