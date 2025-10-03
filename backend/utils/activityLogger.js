const { ActivityLogger } = require('../middleware/activityLogger');

/**
 * Manual Activity Logging Utilities
 * Use these functions to log specific activities in route handlers
 */

const logUserActivity = async (userId, action, details = {}, metadata = {}) => {
  try {
    await ActivityLogger.log(userId, action, details, metadata);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failures shouldn't break the app
  }
};

// Specific activity logging functions
const logLogin = async (userId, metadata = {}) => {
  await logUserActivity(userId, 'login', {}, {
    ...metadata,
    sessionStart: new Date()
  });
};

const logLogout = async (userId, sessionDuration = null) => {
  await logUserActivity(userId, 'logout', {}, {
    sessionDuration: sessionDuration
  });
};

const logIssueCreate = async (userId, issueId, issueTitle, category) => {
  await logUserActivity(userId, 'issue_create', {
    issueTitle,
    issueCategory: category
  }, {
    targetResource: {
      resourceType: 'issue',
      resourceId: issueId,
      resourceTitle: issueTitle
    }
  });
};

const logIssueView = async (userId, issueId, issueTitle) => {
  await logUserActivity(userId, 'issue_view', {}, {
    targetResource: {
      resourceType: 'issue',
      resourceId: issueId,
      resourceTitle: issueTitle
    }
  });
};

const logIssueVote = async (userId, issueId, issueTitle, voteType) => {
  const action = voteType === 'up' ? 'issue_vote_up' : 'issue_vote_down';
  await logUserActivity(userId, action, {
    voteType
  }, {
    targetResource: {
      resourceType: 'issue',
      resourceId: issueId,
      resourceTitle: issueTitle
    }
  });
};

const logIssueComment = async (userId, issueId, issueTitle, commentLength) => {
  await logUserActivity(userId, 'issue_comment', {
    commentLength
  }, {
    targetResource: {
      resourceType: 'issue',
      resourceId: issueId,
      resourceTitle: issueTitle
    }
  });
};

const logDownloadPDF = async (userId, issueId = null, issueTitle = null) => {
  await logUserActivity(userId, 'download_pdf', {
    documentType: 'issue_report'
  }, issueId ? {
    targetResource: {
      resourceType: 'issue',
      resourceId: issueId,
      resourceTitle: issueTitle
    }
  } : {});
};

const logProfileEdit = async (userId, fieldsUpdated = []) => {
  await logUserActivity(userId, 'profile_edit', {
    fieldsUpdated
  }, {
    targetResource: {
      resourceType: 'user',
      resourceId: userId
    }
  });
};

const logBookmarkToggle = async (userId, issueId, issueTitle, isBookmarked) => {
  const action = isBookmarked ? 'issue_bookmark' : 'issue_unbookmark';
  await logUserActivity(userId, action, {}, {
    targetResource: {
      resourceType: 'issue',
      resourceId: issueId,
      resourceTitle: issueTitle
    }
  });
};

const logAdminAction = async (adminUserId, action, targetUserId, details = {}) => {
  await logUserActivity(adminUserId, action, {
    targetUserId,
    ...details
  }, {
    targetResource: {
      resourceType: 'admin_action',
      resourceId: targetUserId
    },
    severity: 'high'
  });
};

module.exports = {
  logUserActivity,
  logLogin,
  logLogout,
  logIssueCreate,
  logIssueView,
  logIssueVote,
  logIssueComment,
  logDownloadPDF,
  logProfileEdit,
  logBookmarkToggle,
  logAdminAction
};