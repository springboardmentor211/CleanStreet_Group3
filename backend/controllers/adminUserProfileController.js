const User = require('../models/User');
const Issue = require('../models/Issue');
const UserActivityLog = require('../models/UserActivityLog');
const { ActivityLogger } = require('../middleware/activityLogger');

/**
 * Admin User Profile Controller
 * Handles admin-specific user profile operations and analytics
 */

class AdminUserProfileController {
  
  // Get comprehensive user profile data for admin view
  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = '30d' } = req.query;

      // Validate user exists
      const user = await User.findById(userId)
        .select('-password') // Exclude password
        .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's issues statistics
      const issueStats = await AdminUserProfileController.getUserIssueStats(userId);
      
      // Get user's activity statistics
      const activityStats = await AdminUserProfileController.getUserActivityStats(userId, timeframe);
      
      // Get recent activities
      const recentActivities = await AdminUserProfileController.getRecentActivities(userId, 20);
      
      // Get user engagement metrics
      const engagementMetrics = await AdminUserProfileController.getUserEngagementMetrics(userId);
      
      // Get session analytics
      const sessionAnalytics = await AdminUserProfileController.getSessionAnalytics(userId, timeframe);

      // Log admin viewing user profile
      await ActivityLogger.log(req.user._id, 'admin_user_profile_view', {
        targetUserId: userId,
        targetUserEmail: user.email
      });

      return res.status(200).json({
        success: true,
        data: {
          user,
          issueStats,
          activityStats,
          recentActivities,
          engagementMetrics,
          sessionAnalytics
        }
      });

    } catch (error) {
      console.error('Get user profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's issue-related statistics
  static async getUserIssueStats(userId) {
    try {
      const pipeline = [
        { $match: { reportedBy: userId } },
        {
          $group: {
            _id: null,
            totalIssues: { $sum: 1 },
            byStatus: {
              $push: {
                status: '$status',
                category: '$category',
                priority: '$priority',
                upvotes: '$upvotes',
                downvotes: '$downvotes',
                createdAt: '$createdAt'
              }
            }
          }
        }
      ];

      const issueData = await Issue.aggregate(pipeline);
      const stats = issueData[0];

      if (!stats) {
        return {
          totalIssues: 0,
          byStatus: { open: 0, 'in-progress': 0, resolved: 0 },
          byCategory: {},
          byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
          totalVotes: { up: 0, down: 0 },
          averageResolutionTime: 0,
          issuesThisMonth: 0
        };
      }

      // Process status breakdown
      const statusBreakdown = stats.byStatus.reduce((acc, issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1;
        return acc;
      }, {});

      // Process category breakdown
      const categoryBreakdown = stats.byStatus.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {});

      // Process priority breakdown
      const priorityBreakdown = stats.byStatus.reduce((acc, issue) => {
        acc[issue.priority || 'medium'] = (acc[issue.priority || 'medium'] || 0) + 1;
        return acc;
      }, {});

      // Calculate total votes
      const totalVotes = stats.byStatus.reduce((acc, issue) => {
        acc.up += issue.upvotes || 0;
        acc.down += issue.downvotes || 0;
        return acc;
      }, { up: 0, down: 0 });

      // Calculate issues this month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const issuesThisMonth = stats.byStatus.filter(issue => 
        new Date(issue.createdAt) >= currentMonth
      ).length;

      // Calculate average resolution time (for resolved issues)
      const resolvedIssues = stats.byStatus.filter(issue => issue.status === 'resolved');
      const averageResolutionTime = resolvedIssues.length > 0 
        ? resolvedIssues.reduce((sum, issue) => {
            const resolutionTime = (new Date() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24);
            return sum + resolutionTime;
          }, 0) / resolvedIssues.length
        : 0;

      return {
        totalIssues: stats.totalIssues,
        byStatus: {
          open: statusBreakdown.open || 0,
          'in-progress': statusBreakdown['in-progress'] || 0,
          resolved: statusBreakdown.resolved || 0
        },
        byCategory: categoryBreakdown,
        byPriority: priorityBreakdown,
        totalVotes,
        averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
        issuesThisMonth
      };

    } catch (error) {
      console.error('Error getting user issue stats:', error);
      return {
        totalIssues: 0,
        byStatus: { open: 0, 'in-progress': 0, resolved: 0 },
        byCategory: {},
        byPriority: {},
        totalVotes: { up: 0, down: 0 },
        averageResolutionTime: 0,
        issuesThisMonth: 0
      };
    }
  }

  // Get user's activity statistics
  static async getUserActivityStats(userId, timeframe = '30d') {
    try {
      const stats = await UserActivityLog.getUserStats(userId, timeframe);
      const trends = await UserActivityLog.getActivityTrends(userId, timeframe);

      // Calculate additional metrics
      const totalActivities = stats.reduce((sum, stat) => sum + stat.count, 0);
      const uniqueActions = stats.length;
      const mostCommonAction = stats[0];
      
      // Calculate activity frequency
      const timeframeMs = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      const days = timeframeMs[timeframe] || 30;
      const avgActivitiesPerDay = Math.round((totalActivities / days) * 10) / 10;

      return {
        summary: {
          totalActivities,
          uniqueActions,
          avgActivitiesPerDay,
          mostCommonAction: mostCommonAction ? {
            action: mostCommonAction._id,
            count: mostCommonAction.count,
            successRate: Math.round(mostCommonAction.successRate * 100)
          } : null
        },
        byAction: stats,
        trends
      };

    } catch (error) {
      console.error('Error getting user activity stats:', error);
      return {
        summary: {
          totalActivities: 0,
          uniqueActions: 0,
          avgActivitiesPerDay: 0,
          mostCommonAction: null
        },
        byAction: [],
        trends: []
      };
    }
  }

  // Get recent user activities
  static async getRecentActivities(userId, limit = 20) {
    try {
      return await UserActivityLog.getUserActivities(userId, { limit });
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  // Get user engagement metrics
  static async getUserEngagementMetrics(userId) {
    try {
      const pipeline = [
        { $match: { userId: userId } },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$metadata.responseTime' },
            lastActivity: { $max: '$timestamp' }
          }
        }
      ];

      const engagementData = await UserActivityLog.aggregate(pipeline);
      
      // Calculate engagement score based on activity diversity and frequency
      const engagementScore = AdminUserProfileController.calculateEngagementScore(engagementData);
      
      // Get session metrics
      const sessionMetrics = await AdminUserProfileController.getSessionMetrics(userId);

      return {
        engagementScore,
        activityDiversity: engagementData.length,
        sessionMetrics,
        interactions: engagementData.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            avgResponseTime: Math.round(item.avgResponseTime || 0),
            lastActivity: item.lastActivity
          };
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        engagementScore: 0,
        activityDiversity: 0,
        sessionMetrics: {},
        interactions: {}
      };
    }
  }

  // Calculate engagement score (0-100)
  static calculateEngagementScore(engagementData) {
    if (!engagementData.length) return 0;

    const totalActivities = engagementData.reduce((sum, item) => sum + item.count, 0);
    const activityTypes = engagementData.length;
    
    // Weighted scoring
    const activityWeight = Math.min(totalActivities / 100, 1) * 50; // Max 50 points for activity volume
    const diversityWeight = Math.min(activityTypes / 15, 1) * 30; // Max 30 points for diversity
    const recentWeight = AdminUserProfileController.getRecencyWeight(engagementData) * 20; // Max 20 points for recent activity

    return Math.round(activityWeight + diversityWeight + recentWeight);
  }

  // Get weight based on recent activity
  static getRecencyWeight(engagementData) {
    const now = new Date();
    const recentActivities = engagementData.filter(item => {
      const daysSinceActivity = (now - new Date(item.lastActivity)) / (1000 * 60 * 60 * 24);
      return daysSinceActivity <= 7; // Last 7 days
    });

    return Math.min(recentActivities.length / engagementData.length, 1);
  }

  // Get session analytics
  static async getSessionAnalytics(userId, timeframe = '30d') {
    try {
      const timeframeDays = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
      };

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframeDays[timeframe]);

      const pipeline = [
        {
          $match: {
            userId: userId,
            timestamp: { $gte: startDate },
            action: { $in: ['login', 'logout', 'session_start', 'session_end'] }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              action: '$action'
            },
            count: { $sum: 1 },
            avgSessionDuration: { $avg: '$sessionDuration' }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ];

      const sessionData = await UserActivityLog.aggregate(pipeline);
      
      // Process session data
      const sessions = {};
      sessionData.forEach(item => {
        if (!sessions[item._id.date]) {
          sessions[item._id.date] = {};
        }
        sessions[item._id.date][item._id.action] = {
          count: item.count,
          avgDuration: item.avgSessionDuration
        };
      });

      return {
        dailySessions: sessions,
        totalSessions: sessionData.filter(item => item._id.action === 'login').reduce((sum, item) => sum + item.count, 0),
        avgSessionDuration: sessionData
          .filter(item => item._id.action === 'logout' && item.avgSessionDuration)
          .reduce((sum, item, _, arr) => sum + item.avgSessionDuration / arr.length, 0)
      };

    } catch (error) {
      console.error('Error getting session analytics:', error);
      return {
        dailySessions: {},
        totalSessions: 0,
        avgSessionDuration: 0
      };
    }
  }

  // Get session metrics
  static async getSessionMetrics(userId) {
    try {
      const pipeline = [
        {
          $match: {
            userId: userId,
            action: { $in: ['login', 'logout'] }
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: 10 // Last 5 sessions
        }
      ];

      const sessionActivities = await UserActivityLog.aggregate(pipeline);
      
      return {
        recentSessions: sessionActivities.length / 2, // Assuming login/logout pairs
        lastLogin: sessionActivities.find(s => s.action === 'login')?.timestamp,
        lastLogout: sessionActivities.find(s => s.action === 'logout')?.timestamp
      };

    } catch (error) {
      console.error('Error getting session metrics:', error);
      return {
        recentSessions: 0,
        lastLogin: null,
        lastLogout: null
      };
    }
  }

  // Get detailed activity logs with pagination
  static async getActivityLogs(req, res) {
    try {
      const { userId } = req.params;
      const { 
        page = 1, 
        limit = 50, 
        action, 
        startDate, 
        endDate,
        resourceType 
      } = req.query;

      const activities = await UserActivityLog.getUserActivities(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action: action && action.trim() ? action : undefined,
        startDate,
        endDate,
        resourceType: resourceType && resourceType.trim() ? resourceType : undefined
      });

      // Get total count for pagination
      const totalQuery = { userId };
      if (action && action.trim()) totalQuery.action = action;
      if (startDate || endDate) {
        totalQuery.timestamp = {};
        if (startDate) totalQuery.timestamp.$gte = new Date(startDate);
        if (endDate) totalQuery.timestamp.$lte = new Date(endDate);
      }

      const total = await UserActivityLog.countDocuments(totalQuery);
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: {
          activities,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get activity logs error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs'
      });
    }
  }

  // Export user data for admin purposes
  static async exportUserData(req, res) {
    try {
      const { userId } = req.params;
      const { format = 'json' } = req.query;

      // Get comprehensive user data
      const userData = await AdminUserProfileController.getUserProfile(req, res);
      
      if (format === 'csv') {
        // Convert to CSV format
        const csv = AdminUserProfileController.convertToCSV(userData.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=user-${userId}-export.csv`);
        return res.send(csv);
      }

      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=user-${userId}-export.json`);
      return res.json(userData.data);

    } catch (error) {
      console.error('Export user data error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export user data'
      });
    }
  }

  // Convert data to CSV format
  static convertToCSV(data) {
    // Implementation for CSV conversion
    const activities = data.recentActivities || [];
    const csvRows = ['Action,Timestamp,Details,Status'];
    
    activities.forEach(activity => {
      const row = [
        activity.action,
        activity.timestamp,
        JSON.stringify(activity.details),
        activity.isSuccessful ? 'Success' : 'Failed'
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  }
}

module.exports = AdminUserProfileController;