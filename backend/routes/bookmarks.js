const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Issue = require('../models/Issue');
const { auth } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Apply activity logging to all routes
router.use(logActivity());

// @desc    Toggle bookmark for an issue
// @route   POST /api/bookmarks/:issueId/toggle
// @access  Private
router.post('/:issueId/toggle', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user._id;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Get user and check if issue is already bookmarked
    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedIssues.includes(issueId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedIssues = user.bookmarkedIssues.filter(
        id => id.toString() !== issueId.toString()
      );
      await user.save();

      return res.json({
        success: true,
        message: 'Bookmark removed successfully',
        isBookmarked: false
      });
    } else {
      // Add bookmark
      user.bookmarkedIssues.push(issueId);
      await user.save();

      return res.json({
        success: true,
        message: 'Issue bookmarked successfully',
        isBookmarked: true
      });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling bookmark'
    });
  }
});

// @desc    Get bookmark status for an issue
// @route   GET /api/bookmarks/:issueId/status
// @access  Private
router.get('/:issueId/status', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedIssues.includes(issueId);

    res.json({
      success: true,
      isBookmarked
    });
  } catch (error) {
    console.error('Get bookmark status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookmark status'
    });
  }
});

// @desc    Get all bookmarked issues for current user
// @route   GET /api/bookmarks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).populate({
      path: 'bookmarkedIssues',
      match: { isDeleted: { $ne: true } },
      populate: [
        {
          path: 'reportedBy',
          select: 'fullName username profileImage'
        }
      ],
      options: {
        sort: { createdAt: -1 },
        skip: skip,
        limit: limit
      }
    });

    const bookmarkedIssues = user.bookmarkedIssues || [];
    const totalBookmarks = await User.aggregate([
      { $match: { _id: userId } },
      { $project: { bookmarkCount: { $size: '$bookmarkedIssues' } } }
    ]);

    res.json({
      success: true,
      data: {
        issues: bookmarkedIssues,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((totalBookmarks[0]?.bookmarkCount || 0) / limit),
          totalItems: totalBookmarks[0]?.bookmarkCount || 0,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookmarks'
    });
  }
});

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:issueId
// @access  Private
router.delete('/:issueId', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.bookmarkedIssues = user.bookmarkedIssues.filter(
      id => id.toString() !== issueId.toString()
    );
    await user.save();

    res.json({
      success: true,
      message: 'Bookmark removed successfully',
      isBookmarked: false
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing bookmark'
    });
  }
});

module.exports = router;