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
      'POST:/api/auth/register': { action: 'register', category: 'authentication' },
      'POST:/api/auth/login': { action: 'login', category: 'authentication' },
      'POST:/api/auth/logout': { action: 'logout', category: 'authentication' },
      'POST:/api/auth/forgot-password': { action: 'password_reset', category: 'authentication' },
      'POST:/api/auth/reset-password': { action: 'password_change', category: 'authentication' },
      'GET:/api/auth/me': { action: 'profile_view', category: 'profile' },
      'PUT:/api/auth/update-profile': { action: 'profile_edit', category: 'profile' },
      'POST:/api/auth/upload-profile-image': { action: 'profile_photo_upload', category: 'profile' },
      
      // Issue routes
      'POST:/api/issues': { action: 'issue_create', category: 'issue_management' },
      'GET:/api/issues/:id': { action: 'issue_view', category: 'navigation' },
      'GET:/api/issues': { action: 'issue_list_view', category: 'navigation' },
      'PUT:/api/issues/:id': { action: 'issue_edit', category: 'issue_management' },
      'DELETE:/api/issues/:id': { action: 'issue_delete', category: 'issue_management' },
      'POST:/api/issues/:id/vote': { action: 'issue_vote', category: 'engagement' },
      'POST:/api/issues/:id/comment': { action: 'issue_comment', category: 'engagement' },
      'GET:/api/issues/user/:id': { action: 'user_issues_view', category: 'navigation' },
      'GET:/api/issues/stats/dashboard': { action: 'dashboard_stats_view', category: 'navigation' },
      
      // Bookmark routes
      'POST:/api/bookmarks/:issueId/toggle': { action: 'issue_bookmark', category: 'bookmark' },
      'GET:/api/bookmarks/:issueId/status': { action: 'bookmark_status_check', category: 'bookmark' },
      'GET:/api/bookmarks': { action: 'bookmarks_view', category: 'navigation' },
      'DELETE:/api/bookmarks/:issueId': { action: 'issue_unbookmark', category: 'bookmark' },
      
      // Admin routes
      'GET:/api/admin/stats': { action: 'admin_dashboard_view', category: 'admin' },
      'GET:/api/admin/users': { action: 'admin_users_view', category: 'admin' },
      'GET:/api/admin/issues': { action: 'admin_issues_view', category: 'admin' },
      'PUT:/api/admin/users/:id/block': { action: 'admin_user_block', category: 'admin' },
      'PUT:/api/admin/issues/:id/status': { action: 'admin_issue_status_change', category: 'admin' },
      'PUT:/api/admin/issues/:id/assign': { action: 'admin_issue_assign', category: 'admin' },
      'GET:/api/admin/trends': { action: 'admin_trends_view', category: 'admin' },
      
      // Admin User Profile routes
      'GET:/api/admin/users/:id/profile': { action: 'admin_user_profile_view', category: 'admin' },
      'GET:/api/admin/users/:id/activities': { action: 'admin_user_activities_view', category: 'admin' },
      'GET:/api/admin/users/:id/export': { action: 'admin_user_data_export', category: 'admin' },
      
      // Profile routes (legacy)
      'GET:/api/users/profile': { action: 'profile_view', category: 'profile' },
      'PUT:/api/users/profile': { action: 'profile_edit', category: 'profile' },
      'POST:/api/users/profile/photo': { action: 'profile_photo_upload', category: 'profile' }
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

      const actionConfig = this.determineAction(req, res, responseData);
      if (!actionConfig) {
        // Log for debugging - what routes are we missing?
        console.log(`No action mapped for: ${req.method}:${req.path}`, {
          route: req.route?.path,
          user: req.user?.username
        });
        return;
      }
      
      const { action, category } = actionConfig;
      console.log(`Activity logged: ${action} (${category}) for user ${req.user?.username} (${userId})`);

      const metadata = this.extractMetadata(req, res, responseTime);
      const details = this.extractDetails(req, res, responseData, action);
      const targetResource = this.extractTargetResource(req, action, responseData);

      const logEntry = new UserActivityLog({
        userId,
        action,
        category,
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
    let actionConfig = null;
    
    // First, try with the actual route path (if available) and construct full API path
    if (req.route?.path && req.baseUrl) {
      const routeKey = `${req.method}:${req.baseUrl}${req.route.path}`;
      actionConfig = this.actionMappings[routeKey];
    }
    
    // If not found, try with normalized paths
    if (!actionConfig) {
      const normalizedPath = this.normalizeRoute(req.path);
      const routeKey = `${req.method}:${normalizedPath}`;
      actionConfig = this.actionMappings[routeKey];
    }

    // Special case handling for dynamic actions that middleware should catch
    if (!actionConfig) {
      
      // Handle vote actions with proper categorization
      if (req.method === 'POST' && (
        req.path.match(/\/api\/issues\/[^\/]+\/vote/) ||
        (req.path.match(/\/[^\/]+\/vote/) && req.baseUrl === '/api/issues')
      )) {
        const voteType = req.body?.type || req.body?.voteType;
        if (voteType === 'up') {
          actionConfig = { action: 'issue_vote_up', category: 'engagement' };
        } else if (voteType === 'down') {
          actionConfig = { action: 'issue_vote_down', category: 'engagement' };
        } else {
          actionConfig = { action: 'issue_vote', category: 'engagement' };
        }
      }
      // Handle bookmark toggle - check both full path and route-relative path
      else if (req.method === 'POST' && (
        (req.path.match(/\/[^\/]+\/toggle/) && req.baseUrl === '/api/bookmarks') ||
        (req.path.match(/\/api\/bookmarks\/[^\/]+\/toggle/))
      )) {
        actionConfig = { action: 'issue_bookmark', category: 'bookmark' };
      }
      // Handle bookmark status check
      else if (req.method === 'GET' && (
        (req.path.match(/\/[^\/]+\/status/) && req.baseUrl === '/api/bookmarks') ||
        (req.path.match(/\/api\/bookmarks\/[^\/]+\/status/))
      )) {
        actionConfig = { action: 'bookmark_status_check', category: 'bookmark' };
      }
      // Handle comment actions
      else if (req.method === 'POST' && (
        req.path.match(/\/api\/issues\/[^\/]+\/comment/) ||
        (req.path.match(/\/[^\/]+\/comment/) && req.baseUrl === '/api/issues')
      )) {
        actionConfig = { action: 'issue_comment', category: 'engagement' };
      }
      // Handle individual issue view
      else if (req.method === 'GET' && (
        req.path.match(/\/api\/issues\/[^\/]+$/) ||
        (req.path.match(/\/[^\/]+$/) && req.baseUrl === '/api/issues')
      )) {
        actionConfig = { action: 'issue_view', category: 'navigation' };
      }
      // Handle issues list view
      else if (req.path === '/api/issues' && req.method === 'GET') {
        actionConfig = { action: 'page_view', category: 'navigation' };
      }
      // Handle admin user profile view
      else if (req.path.match(/\/api\/admin\/users\/[^\/]+\/profile/) && req.method === 'GET') {
        actionConfig = { action: 'admin_user_profile_view', category: 'admin' };
      }
      // Default fallback for API routes
      else if (req.path.startsWith('/api/')) {
        actionConfig = { action: 'api_request', category: 'navigation' };
      }
      // Non-API routes (frontend page views)
      else if (req.method === 'GET' && !req.path.includes('/api/')) {
        actionConfig = { action: 'page_view', category: 'navigation' };
      }
    }

    return actionConfig;
  }

  // Normalize route paths to handle parameters
  normalizeRoute(path) {
    return path
      .replace(/\/[0-9a-fA-F]{24}/g, '/:issueId') // Replace MongoDB ObjectIds with :issueId
      .replace(/\/\d+/g, '/:issueId') // Replace numeric IDs with :issueId
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
  static async log(userId, action, category, details = {}, metadata = {}) {
    try {
      // Handle backward compatibility - if category is an object, it's the old signature
      let actualCategory = category;
      let actualDetails = details;
      let actualMetadata = metadata;
      
      if (typeof category === 'object') {
        // Old signature: log(userId, action, details, metadata)
        actualCategory = 'navigation'; // default category
        actualDetails = category;
        actualMetadata = details || {};
      }

      const logEntry = new UserActivityLog({
        userId,
        action,
        category: actualCategory,
        details: actualDetails,
        metadata: {
          ...actualMetadata,
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