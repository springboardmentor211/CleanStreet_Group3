const UserActivityLog = require('../models/UserActivityLog');
const useragent = require('useragent');

/**
 * Activity Logger Middleware
 * Logs user activities automatically based on route patterns and request data
 */

class ActivityLogger {
  constructor() {
    this.actionMappings = {
      // Authentication routes
      'POST:/api/auth/register': 'register',
      'POST:/api/auth/login': 'login',
      'POST:/api/auth/logout': 'logout',
      'POST:/api/auth/forgot-password': 'password_reset',
      'POST:/api/auth/reset-password': 'password_change',
      'GET:/api/auth/me': 'profile_view',
      'PUT:/api/auth/update-profile': 'profile_edit',
      'POST:/api/auth/upload-profile-image': 'profile_photo_upload',
      
      // Issue routes
      'POST:/api/issues': 'issue_create',
      'GET:/api/issues/:id': 'issue_view',
      'GET:/api/issues': 'issue_list_view',
      'PUT:/api/issues/:id': 'issue_edit',
      'DELETE:/api/issues/:id': 'issue_delete',
      'POST:/api/issues/:id/vote': 'issue_vote',
      'POST:/api/issues/:id/comment': 'issue_comment',
      'GET:/api/issues/user/:id': 'user_issues_view',
      'GET:/api/issues/stats/dashboard': 'dashboard_stats_view',
      
      // Bookmark routes
      'POST:/api/bookmarks/:id/toggle': 'issue_bookmark_toggle',
      'GET:/api/bookmarks/:id/status': 'bookmark_status_check',
      'GET:/api/bookmarks': 'bookmarks_view',
      'DELETE:/api/bookmarks/:id': 'issue_unbookmark',
      
      // Admin routes
      'GET:/api/admin/stats': 'admin_dashboard_view',
      'GET:/api/admin/users': 'admin_users_view',
      'GET:/api/admin/issues': 'admin_issues_view',
      'PUT:/api/admin/users/:id/block': 'admin_user_block',
      'PUT:/api/admin/issues/:id/status': 'admin_issue_status_change',
      'PUT:/api/admin/issues/:id/assign': 'admin_issue_assign',
      'GET:/api/admin/trends': 'admin_trends_view',
      
      // Admin User Profile routes
      'GET:/api/admin/users/:id/profile': 'admin_user_profile_view',
      'GET:/api/admin/users/:id/activities': 'admin_user_activities_view',
      'GET:/api/admin/users/:id/export': 'admin_user_data_export',
      
      // Profile routes (legacy)
      'GET:/api/users/profile': 'profile_view',
      'PUT:/api/users/profile': 'profile_edit',
      'POST:/api/users/profile/photo': 'profile_photo_upload'
    };
  }

  // Main middleware function
  logActivity() {
    return async (req, res, next) => {
      const startTime = Date.now();
      
      // Store original res.json to capture response
      const originalJson = res.json;
      let responseData = null;
      let statusCode = 200;
      
      res.json = function(data) {
        responseData = data;
        statusCode = res.statusCode;
        return originalJson.call(this, data);
      };

      // Continue with the request
      next();

      // Log after response (in background)
      res.on('finish', async () => {
        try {
          await this.logUserActivity(req, res, {
            responseData,
            statusCode,
            responseTime: Date.now() - startTime
          });
        } catch (error) {
          console.error('Error logging user activity:', error);
        }
      });
    };
  }

  // Core logging function
  async logUserActivity(req, res, options = {}) {
    try {
      const { responseData, statusCode, responseTime } = options;
      
      // Skip logging for certain conditions
      if (this.shouldSkipLogging(req, res)) {
        return;
      }

      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        return; // Only log authenticated user activities
      }

      const action = this.determineAction(req, res, responseData);
      if (!action) {
        // Log for debugging - what routes are we missing?
        console.log(`No action mapped for: ${req.method}:${req.path}`, {
          route: req.route?.path,
          user: req.user?.username
        });
        return;
      }
      
      console.log(`Activity logged: ${action} for user ${req.user?.username} (${userId})`);

      const metadata = this.extractMetadata(req, res, responseTime);
      const details = this.extractDetails(req, res, responseData, action);
      const targetResource = this.extractTargetResource(req, action, responseData);

      const logEntry = new UserActivityLog({
        userId,
        action,
        details,
        metadata,
        targetResource,
        severity: this.determineSeverity(action, statusCode),
        isSuccessful: statusCode >= 200 && statusCode < 400,
        errorMessage: statusCode >= 400 ? responseData?.message || responseData?.error : null,
        timestamp: new Date()
      });

      await logEntry.save();
      
    } catch (error) {
      console.error('Activity logging error:', error);
      // Don't throw - logging failures shouldn't break the app
    }
  }

  // Determine if we should skip logging this request
  shouldSkipLogging(req, res) {
    const skipPaths = [
      '/api/health',
      '/api/ping',
      '/favicon.ico',
      '/static/',
      '/_next/',
      '/api/activity-logs' // Prevent logging loops
    ];
    
    const skipMethods = ['OPTIONS'];
    
    return skipPaths.some(path => req.path.includes(path)) || 
           skipMethods.includes(req.method) ||
           req.path.includes('activity-logs');
  }

  // Determine action based on route and request
  determineAction(req, res, responseData) {
    // Try multiple route key approaches
    let action = null;
    
    // First, try with the actual route path (if available)
    if (req.route?.path) {
      const routeKey = `${req.method}:${this.normalizeRoute(req.route.path)}`;
      action = this.actionMappings[routeKey];
    }
    
    // If not found, try with the request path
    if (!action) {
      const normalizedPath = this.normalizeRoute(req.path);
      const routeKey = `${req.method}:${normalizedPath}`;
      action = this.actionMappings[routeKey];
    }

    // Special case handling for dynamic actions
    if (!action) {
      if (req.path.includes('/issues/') && req.method === 'POST' && req.path.includes('/vote')) {
        action = req.body?.type === 'up' ? 'issue_vote_up' : 'issue_vote_down';
      } else if (req.path.includes('/issues/') && req.method === 'POST' && req.path.includes('/comment')) {
        action = 'issue_comment';
      } else if (req.path.includes('/bookmarks/') && req.method === 'POST' && req.path.includes('/toggle')) {
        action = 'issue_bookmark_toggle';
      } else if (req.path.includes('/issues/') && req.method === 'GET' && req.path !== '/api/issues') {
        action = 'issue_view';
      } else if (req.path === '/api/issues' && req.method === 'GET') {
        action = 'issue_list_view';
      } else if (req.path.includes('/admin/users/') && req.method === 'GET' && req.path.includes('/profile')) {
        action = 'admin_user_profile_view';
      } else if (req.method === 'GET' && !req.path.includes('/api/')) {
        action = 'page_view';
      }
    }

    return action;
  }

  // Normalize route paths to handle parameters
  normalizeRoute(path) {
    return path
      .replace(/\/:[^\/]+/g, '/:id') // Replace :userId, :issueId, etc. with :id
      .replace(/\/[0-9a-fA-F]{24}/g, '/:id') // Replace MongoDB ObjectIds with :id
      .replace(/\/\d+/g, '/:id') // Replace numeric IDs with :id
      .replace(/\/$/, ''); // Remove trailing slash
  }

  // Extract metadata about the request
  extractMetadata(req, res, responseTime) {
    const agent = useragent.parse(req.headers['user-agent'] || '');
    
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceType: this.getDeviceType(agent),
      browser: agent.toAgent(),
      os: agent.os.toString(),
      responseTime,
      statusCode: res.statusCode,
      referrer: req.headers.referer,
      sessionId: req.sessionID || req.headers['x-session-id']
    };
  }

  // Get device type from user agent
  getDeviceType(agent) {
    if (agent.device.toString() !== 'Other') {
      return 'mobile';
    } else if (agent.os.toString().includes('Mobile')) {
      return 'mobile';
    } else if (agent.os.toString().includes('Tablet')) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Extract action-specific details
  extractDetails(req, res, responseData, action) {
    const details = {
      method: req.method,
      path: req.path,
      query: req.query
    };

    // Add action-specific details
    switch (action) {
      case 'issue_create':
        details.issueTitle = req.body?.title;
        details.issueCategory = req.body?.category;
        break;
      case 'issue_vote_up':
      case 'issue_vote_down':
        details.voteType = req.body?.type;
        break;
      case 'issue_comment':
        details.commentLength = req.body?.text?.length;
        break;
      case 'download_pdf':
        details.documentType = 'issue_report';
        break;
      case 'search_performed':
        details.searchQuery = req.query?.q || req.body?.query;
        details.searchType = req.query?.type;
        break;
      case 'admin_user_block':
      case 'admin_user_unblock':
        details.targetUserId = req.params?.id;
        details.reason = req.body?.reason;
        break;
      case 'profile_edit':
        details.fieldsUpdated = Object.keys(req.body || {});
        break;
    }

    return details;
  }

  // Extract target resource information
  extractTargetResource(req, action, responseData) {
    let resourceType = 'general';
    let resourceId = null;
    let resourceTitle = null;

    if (action.includes('issue')) {
      resourceType = 'issue';
      resourceId = req.params?.id || responseData?.issue?._id || responseData?._id;
      resourceTitle = responseData?.issue?.title || responseData?.title || req.body?.title;
    } else if (action.includes('user') || action.includes('profile')) {
      resourceType = 'user';
      resourceId = req.params?.id || req.user?._id;
      resourceTitle = responseData?.user?.fullName || responseData?.fullName;
    } else if (action.includes('comment')) {
      resourceType = 'comment';
      resourceId = responseData?.comment?._id || responseData?._id;
    } else if (action.includes('admin')) {
      resourceType = 'admin_action';
    }

    return resourceType !== 'general' ? {
      resourceType,
      resourceId,
      resourceTitle
    } : null;
  }

  // Determine severity level
  determineSeverity(action, statusCode) {
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    
    const highSeverityActions = [
      'register', 'login', 'logout', 'password_reset',
      'admin_user_block', 'admin_issue_status_change'
    ];
    
    if (highSeverityActions.includes(action)) return 'high';
    
    const mediumSeverityActions = [
      'issue_create', 'issue_delete', 'profile_edit'
    ];
    
    if (mediumSeverityActions.includes(action)) return 'medium';
    
    return 'low';
  }

  // Manual logging method for custom activities
  static async log(userId, action, details = {}, metadata = {}) {
    try {
      const logEntry = new UserActivityLog({
        userId,
        action,
        details,
        metadata: {
          ...metadata,
          manualLog: true
        },
        timestamp: new Date()
      });

      await logEntry.save();
      return logEntry;
    } catch (error) {
      console.error('Manual activity logging error:', error);
      return null;
    }
  }

  // Batch logging for performance
  static async logBatch(activities) {
    try {
      const logs = activities.map(activity => new UserActivityLog(activity));
      await UserActivityLog.insertMany(logs);
      return logs;
    } catch (error) {
      console.error('Batch activity logging error:', error);
      return [];
    }
  }
}

// Export both the class and a configured instance
const activityLogger = new ActivityLogger();

module.exports = {
  ActivityLogger,
  activityLogger,
  logActivity: activityLogger.logActivity.bind(activityLogger)
};