const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication Activities
      'login',
      'logout',
      'register',
      'password_reset',
      'password_change',
      'login_page_view',
      'register_page_view',
      'forgot_password_page_view',
      'reset_password_page_view',
      
      // Issue Activities  
      'issue_create',
      'issue_view',
      'issue_edit',
      'issue_delete',
      'issue_vote_up',
      'issue_vote_down',
      'issue_comment',
      'issue_bookmark',
      'issue_unbookmark',
      'issue_bookmark_toggle',
      'report_page_view',
      
      // Content Interaction Activities
      'download_activity',
      'share_activity',
      'like_activity', 
      'dislike_activity',
      
      // Profile Activities
      'profile_view',
      'profile_edit',
      'profile_photo_upload',
      
      // Content Activities
      'download_pdf',
      'share_issue',
      'search_performed',
      'map_view',
      'location_search',
      
      // Admin Activities (for admin users)
      'admin_dashboard_view',
      'admin_user_view',
      'admin_user_profile_view',
      'admin_user_activities_view',
      'admin_user_block',
      'admin_user_unblock',
      'admin_issue_status_change',
      'admin_analytics_export',
      
      // Page Navigation Activities
      'welcome_page_view',
      'dashboard_view',
      'explore_page_view',
      'bookmarks_view',
      'community_reports_view',
      'page_view',
      'session_start',
      'session_end',
      'api_request'
    ]
  },
  category: {
    type: String,
    enum: [
      'authentication',
      'bookmark',
      'download', 
      'share',
      'engagement', // likes/dislikes/votes
      'issue_management',
      'profile',
      'admin',
      'navigation'
    ],
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible object for storing action-specific data
    default: {}
  },
  metadata: {
    // Request metadata
    ipAddress: String,
    userAgent: String,
    deviceType: String, // mobile, desktop, tablet
    browser: String,
    os: String,
    
    // Location metadata (if available)
    country: String,
    city: String,
    
    // Performance metadata
    responseTime: Number, // in milliseconds
    statusCode: Number,
    
    // Additional context
    referrer: String,
    sessionId: String
  },
  targetResource: {
    resourceType: {
      type: String,
      enum: ['issue', 'user', 'comment', 'bookmark', 'admin_action', 'general']
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    resourceTitle: String // For easy reference without population
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  errorMessage: String, // If action failed
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionDuration: Number, // For login/logout actions, track session length in minutes
}, {
  timestamps: true,
  // Optimize for read-heavy operations
  index: [
    { userId: 1, timestamp: -1 },
    { action: 1, timestamp: -1 },
    { 'targetResource.resourceType': 1, timestamp: -1 }
  ]
});

// Static methods for common queries
userActivityLogSchema.statics.getUserActivities = function(userId, options = {}) {
  const {
    limit = 50,
    page = 1,
    action,
    category,
    startDate,
    endDate,
    resourceType
  } = options;

  let query = { userId };
  
  if (action && action.trim()) query.action = action;
  if (category && category.trim()) query.category = category;
  if (resourceType && resourceType.trim()) query['targetResource.resourceType'] = resourceType;


  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('userId', 'fullName username email')
    .lean();
};

userActivityLogSchema.statics.getUserStats = async function(userId, timeframe = '30d') {
  const timeframeMs = {
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };

  const startDate = new Date(Date.now() - timeframeMs[timeframe]);
  
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
        successRate: {
          $avg: { $cond: ['$isSuccessful', 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];

  return this.aggregate(pipeline);
};

userActivityLogSchema.statics.getActivityTrends = async function(userId, timeframe = '30d') {
  const timeframeMs = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };

  const startDate = new Date(Date.now() - timeframeMs[timeframe]);
  
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        totalActivities: { $sum: 1 },
        uniqueActions: { $addToSet: '$action' },
        sessionTime: { $sum: { $ifNull: ['$sessionDuration', 0] } }
      }
    },
    {
      $project: {
        date: '$_id.date',
        totalActivities: 1,
        uniqueActionsCount: { $size: '$uniqueActions' },
        avgSessionTime: { $divide: ['$sessionTime', '$totalActivities'] },
        _id: 0
      }
    },
    {
      $sort: { date: 1 }
    }
  ];

  return this.aggregate(pipeline);
};

userActivityLogSchema.statics.getCategoryStats = async function(userId, timeframe = '30d') {
  const timeframeMs = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };

  const startDate = new Date(Date.now() - timeframeMs[timeframe]);
  
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        actions: { $addToSet: '$action' },
        lastActivity: { $max: '$timestamp' },
        successRate: {
          $avg: { $cond: ['$isSuccessful', 1, 0] }
        }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        actionTypes: { $size: '$actions' },
        lastActivity: 1,
        successRate: { $multiply: ['$successRate', 100] },
        _id: 0
      }
    },
    {
      $sort: { count: -1 }
    }
  ];

  return this.aggregate(pipeline);
};

// Instance methods
userActivityLogSchema.methods.getReadableAction = function() {
  const actionMap = {
    'login': 'Logged in',
    'logout': 'Logged out', 
    'register': 'Registered account',
    'issue_create': 'Created new issue',
    'issue_view': 'Viewed issue',
    'issue_vote_up': 'Upvoted issue',
    'issue_vote_down': 'Downvoted issue',
    'issue_comment': 'Commented on issue',
    'download_pdf': 'Downloaded PDF report',
    'profile_view': 'Viewed profile',
    'map_view': 'Viewed map',
    // Add more mappings as needed
  };
  
  return actionMap[this.action] || this.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Enhanced readable action mapping for new URL-based actions
userActivityLogSchema.methods.getReadableActionFull = function() {
  const fullActionMap = {
    // Authentication Activities
    'login': 'User logged in',
    'logout': 'User logged out', 
    'register': 'User registered account',
    'login_page_view': 'Visited login page',
    'register_page_view': 'Visited registration page',
    'forgot_password_page_view': 'Visited forgot password page',
    'reset_password_page_view': 'Visited password reset page',
    
    // Issue Management
    'issue_create': 'Created new issue',
    'issue_view': 'Viewed issue details',
    'issue_edit': 'Edited issue',
    'issue_vote_up': 'Upvoted issue',
    'issue_vote_down': 'Downvoted issue',
    'issue_comment': 'Commented on issue',
    'issue_bookmark': 'Bookmarked issue',
    'report_page_view': 'Visited report issue page',
    
    // Page Navigation
    'welcome_page_view': 'Visited welcome page',
    'dashboard_view': 'Viewed dashboard',
    'explore_page_view': 'Visited explore page',
    'map_view': 'Viewed map',
    'bookmarks_view': 'Visited bookmarks page',
    'community_reports_view': 'Visited community reports',
    'profile_view': 'Viewed profile page',
    
    // Content Actions
    'download_activity': 'Downloaded content',
    'share_activity': 'Shared content',
    'profile_edit': 'Updated profile',
    
    // Admin Activities
    'admin_dashboard_view': 'Accessed admin dashboard',
    'admin_user_profile_view': 'Viewed user profile (admin)',
    'admin_user_activities_view': 'Viewed user activities (admin)',
    
    // Other
    'search_performed': 'Performed search',
    'page_view': 'Viewed page'
  };
  
  return fullActionMap[this.action] || this.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

module.exports = mongoose.model('UserActivityLog', userActivityLogSchema);