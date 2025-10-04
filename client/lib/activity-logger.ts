/**
 * Frontend Activity Logger Utility
 * Logs user activities from the frontend to the backend activity logging system
 */

interface ActivityLogData {
  action: string;
  category: string;
  details?: Record<string, any>;
  targetResource?: {
    resourceType: string;
    resourceId: string;
    resourceTitle?: string;
  };
}

class ActivityLogger {
  private static baseUrl = 'http://localhost:5000/api';

  /**
   * Log an activity to the backend
   */
  static async log(data: ActivityLogData): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Silently skip logging if user is not authenticated
        return;
      }

      const response = await fetch(`${this.baseUrl}/activity-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          metadata: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            frontendLog: true
          }
        })
      });

      if (!response.ok) {
        console.warn('Activity logging failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Silently fail - logging should never break the app
      console.debug('Activity logging error:', error);
    }
  }

  /**
   * Log bookmark activity (save/unsave)
   */
  static async logBookmark(action: 'bookmark' | 'unbookmark', issueId: string, issueTitle?: string): Promise<void> {
    await this.log({
      action: action === 'bookmark' ? 'issue_bookmark' : 'issue_unbookmark',
      category: 'bookmark',
      details: {
        bookmarkAction: action,
        issueId
      },
      targetResource: {
        resourceType: 'issue',
        resourceId: issueId,
        resourceTitle: issueTitle
      }
    });
  }

  /**
   * Log download activity
   */
  static async logDownload(downloadType: 'pdf' | 'csv' | 'image', resourceId?: string, resourceTitle?: string): Promise<void> {
    await this.log({
      action: 'download_activity',
      category: 'download',
      details: {
        downloadType,
        resourceId,
        downloadTime: new Date().toISOString()
      },
      targetResource: resourceId ? {
        resourceType: downloadType === 'pdf' ? 'issue' : 'general',
        resourceId,
        resourceTitle
      } : undefined
    });
  }

  /**
   * Log share activity
   */
  static async logShare(shareType: 'link' | 'social', resourceId?: string, resourceTitle?: string): Promise<void> {
    await this.log({
      action: 'share_activity',
      category: 'share',
      details: {
        shareType,
        resourceId,
        sharedUrl: window.location.href
      },
      targetResource: resourceId ? {
        resourceType: 'issue',
        resourceId,
        resourceTitle
      } : undefined
    });
  }

  /**
   * Log like/dislike activity (voting)
   */
  static async logEngagement(action: 'up' | 'down' | 'like' | 'dislike', resourceId: string, resourceTitle?: string): Promise<void> {
    let logAction: string;
    if (action === 'up' || action === 'like') {
      logAction = 'issue_vote_up';
    } else if (action === 'down' || action === 'dislike') {
      logAction = 'issue_vote_down';
    } else {
      logAction = 'like_activity';
    }

    await this.log({
      action: logAction,
      category: 'engagement',
      details: {
        voteType: action,
        resourceId
      },
      targetResource: {
        resourceType: 'issue',
        resourceId,
        resourceTitle
      }
    });
  }

  /**
   * Log issue creation activity
   */
  static async logIssueCreate(issueId: string, issueTitle: string, category: string): Promise<void> {
    await this.log({
      action: 'issue_create',
      category: 'issue_management',
      details: {
        issueCategory: category,
        createdAt: new Date().toISOString()
      },
      targetResource: {
        resourceType: 'issue',
        resourceId: issueId,
        resourceTitle: issueTitle
      }
    });
  }

  /**
   * Log general navigation/page view
   */
  static async logPageView(pageName: string, additionalDetails?: Record<string, any>): Promise<void> {
    await this.log({
      action: 'page_view',
      category: 'navigation',
      details: {
        pageName,
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        ...additionalDetails,
        viewTime: new Date().toISOString()
      }
    });
  }

  /**
   * Log route navigation based on URL patterns
   */
  static async logRouteNavigation(pathname: string): Promise<void> {
    let action = 'page_view';
    let category = 'navigation';
    let pageName = 'Unknown Page';

    // Map URLs to specific actions and categories
    if (pathname === '/' || pathname === '/welcome') {
      action = 'welcome_page_view';
      pageName = 'Welcome Page';
    } else if (pathname === '/login') {
      action = 'login_page_view';
      category = 'authentication';
      pageName = 'Login Page';
    } else if (pathname === '/register') {
      action = 'register_page_view';
      category = 'authentication';
      pageName = 'Register Page';
    } else if (pathname === '/dashboard') {
      action = 'dashboard_view';
      pageName = 'Dashboard';
    } else if (pathname === '/explore') {
      action = 'explore_page_view';
      pageName = 'Explore Page';
    } else if (pathname === '/maps') {
      action = 'map_view';
      pageName = 'Maps Page';
    } else if (pathname === '/report') {
      action = 'report_page_view';
      category = 'issue_management';
      pageName = 'Report Issue Page';
    } else if (pathname === '/bookmarks') {
      action = 'bookmarks_view';
      category = 'bookmark';
      pageName = 'Bookmarks Page';
    } else if (pathname === '/community-reports') {
      action = 'community_reports_view';
      pageName = 'Community Reports Page';
    } else if (pathname === '/profile') {
      action = 'profile_view';
      category = 'profile';
      pageName = 'Profile Page';
    } else if (pathname.startsWith('/issue/')) {
      action = 'issue_view';
      category = 'navigation';
      pageName = 'Issue Detail Page';
    } else if (pathname.startsWith('/admin')) {
      action = 'admin_dashboard_view';
      category = 'admin';
      pageName = 'Admin Dashboard';
      
      // More specific admin pages
      if (pathname.includes('/user-activities/')) {
        action = 'admin_user_activities_view';
        pageName = 'Admin User Activities';
      } else if (pathname.includes('/users/')) {
        action = 'admin_user_profile_view';
        pageName = 'Admin User Profile';
      }
    } else if (pathname === '/forgot-password') {
      action = 'forgot_password_page_view';
      category = 'authentication';
      pageName = 'Forgot Password Page';
    } else if (pathname.startsWith('/reset-password')) {
      action = 'reset_password_page_view';
      category = 'authentication';
      pageName = 'Reset Password Page';
    }

    await this.log({
      action,
      category,
      details: {
        pageName,
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        referrer: document.referrer,
        viewTime: new Date().toISOString()
      }
    });
  }
}

export default ActivityLogger;