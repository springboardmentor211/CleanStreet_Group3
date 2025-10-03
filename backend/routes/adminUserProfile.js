const express = require('express');
const router = express.Router();
const AdminUserProfileController = require('../controllers/adminUserProfileController');
const { authenticateToken } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Middleware to ensure admin access
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Apply authentication and activity logging to all routes
router.use(authenticateToken);
router.use(logActivity());
router.use(requireAdmin);

/**
 * @route   GET /api/admin/users/:userId/profile
 * @desc    Get comprehensive user profile for admin view
 * @access  Admin only
 */
router.get('/:userId/profile', AdminUserProfileController.getUserProfile);

/**
 * @route   GET /api/admin/users/:userId/activities
 * @desc    Get paginated user activity logs
 * @access  Admin only
 */
router.get('/:userId/activities', AdminUserProfileController.getActivityLogs);

/**
 * @route   GET /api/admin/users/:userId/export
 * @desc    Export user data (JSON/CSV)
 * @access  Admin only
 */
router.get('/:userId/export', AdminUserProfileController.exportUserData);

module.exports = router;