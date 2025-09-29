const User = require('../models/User');
const Issue = require('../models/Issue');

// Block/Unblock user
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, block } = req.body; // block: true to block, false to unblock

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block admin users' });
    }

    if (block) {
      // Block the user
      user.isBlocked = true;
      user.blockedAt = new Date();
      user.blockedBy = req.user.id;
      user.blockReason = reason || 'Miscellaneous reports';

      // Soft delete all issues by this user
      await Issue.updateMany(
        { reportedBy: userId, isDeleted: false },
        { 
          isDeleted: true, 
          deletedAt: new Date(), 
          deletedBy: req.user.id 
        }
      );
    } else {
      // Unblock the user
      user.isBlocked = false;
      user.blockedAt = null;
      user.blockedBy = null;
      user.blockReason = null;

      // Restore all issues by this user (optional - you might want to keep them hidden)
      await Issue.updateMany(
        { reportedBy: userId, isDeleted: true },
        { 
          $unset: { 
            isDeleted: 1, 
            deletedAt: 1, 
            deletedBy: 1 
          } 
        }
      );
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ 
      user: updatedUser, 
      message: block ? 'User blocked successfully' : 'User unblocked successfully' 
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user details with block info
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('blockedBy', 'username fullName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's issue count
    const totalIssues = await Issue.countDocuments({ reportedBy: userId });
    const activeIssues = await Issue.countDocuments({ 
      reportedBy: userId, 
      isDeleted: { $ne: true } 
    });
    const hiddenIssues = await Issue.countDocuments({ 
      reportedBy: userId, 
      isDeleted: true 
    });

    res.json({
      user,
      stats: {
        totalIssues,
        activeIssues,
        hiddenIssues
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all blocked users
const getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await User.find({ isBlocked: true })
      .select('-password')
      .populate('blockedBy', 'username fullName')
      .sort({ blockedAt: -1 });

    res.json({ users: blockedUsers });

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  blockUser,
  getUserDetails,
  getBlockedUsers
};
