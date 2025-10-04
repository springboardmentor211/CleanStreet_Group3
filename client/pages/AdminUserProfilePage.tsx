import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Activity,
  FileText,
  TrendingUp,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Eye,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  LogIn,
  LogOut,
  Search,
  Settings,
  Shield,
  BarChart3,
  Users,
  FileBarChart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  isBlocked: boolean;
  profileImage?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
}

interface ActivityLog {
  _id: string;
  action: string;
  timestamp: string;
  details: any;
  metadata: {
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    responseTime?: number;
  };
  targetResource?: {
    resourceType: string;
    resourceId: string;
    resourceTitle?: string;
  };
  isSuccessful: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserData {
  user: UserProfile;
  issueStats: any;
  activityStats: any;
  recentActivities: ActivityLog[];
  engagementMetrics: any;
  sessionAnalytics: any;
}

const AdminUserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeframe, setTimeframe] = useState('30d');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activityFilters, setActivityFilters] = useState({
    action: 'all',
    category: 'all',
    resourceType: 'all',
    startDate: '',
    endDate: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, timeframe]);

  useEffect(() => {
    if (userId) {
      fetchActivityLogs();
    }
  }, [userId, currentPage, activityFilters]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserProfile(userId!, timeframe);
      
      if (response.success) {
        setUserData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setActivityLoading(true);
      
      // Convert 'all' values back to empty strings for the API
      const apiFilters = {
        action: activityFilters.action === 'all' ? '' : activityFilters.action,
        category: activityFilters.category === 'all' ? '' : activityFilters.category,
        resourceType: activityFilters.resourceType === 'all' ? '' : activityFilters.resourceType,
        startDate: activityFilters.startDate,
        endDate: activityFilters.endDate
      };
      
      // Debug: Log filters being sent to API
      console.log('Fetching activities with filters:', apiFilters);
      
      const response = await adminAPI.getUserActivityLogs(userId!, {
        page: currentPage,
        limit: 20,
        ...apiFilters
      });
      
      if (response.success) {
        setActivityLogs(response.data.activities);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleExportUserData = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);
      const response = await adminAPI.exportUserData(userId!, format);
      
      // Handle file download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-${userId}-data.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting user data:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-400" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-red-400" />;
      case 'issue_view':
        return <Eye className="h-4 w-4 text-blue-400" />;
      case 'issue_create':
        return <FileText className="h-4 w-4 text-purple-400" />;
      case 'issue_vote_up':
        return <ThumbsUp className="h-4 w-4 text-green-400" />;
      case 'issue_vote_down':
        return <ThumbsDown className="h-4 w-4 text-red-400" />;
      case 'issue_comment':
        return <MessageCircle className="h-4 w-4 text-yellow-400" />;
      case 'download_pdf':
        return <Download className="h-4 w-4 text-orange-400" />;
      case 'search_performed':
        return <Search className="h-4 w-4 text-cyan-400" />;
      case 'profile_edit':
        return <Settings className="h-4 w-4 text-indigo-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600/20 text-red-300 border-red-600/30';
      case 'high':
        return 'bg-orange-600/20 text-orange-300 border-orange-600/30';
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30';
      case 'low':
        return 'bg-green-600/20 text-green-300 border-green-600/30';
      default:
        return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
    }
  };

  const getActionReadableName = (action: string) => {
    const actionMap: { [key: string]: string } = {
      // Authentication
      'login': 'Logged In',
      'logout': 'Logged Out',
      'register': 'Account Registered',
      'login_page_view': 'Visited Login Page',
      'register_page_view': 'Visited Register Page',
      'forgot_password_page_view': 'Visited Forgot Password',
      'reset_password_page_view': 'Visited Reset Password',
      
      // Issue Management
      'issue_create': 'Created Issue',
      'issue_view': 'Viewed Issue Details',
      'issue_edit': 'Edited Issue',
      'issue_vote_up': 'Upvoted Issue',
      'issue_vote_down': 'Downvoted Issue',
      'issue_comment': 'Commented on Issue',
      'issue_bookmark': 'Bookmarked Issue',
      'report_page_view': 'Visited Report Page',
      
      // Downloads & Sharing
      'download_activity': 'Downloaded Content',
      'download_pdf': 'Downloaded PDF Report',
      'share_activity': 'Shared Content',
      
      // Profile Activities
      'profile_view': 'Viewed Profile',
      'profile_edit': 'Updated Profile',
      
      // Navigation & Pages
      'welcome_page_view': 'Visited Welcome Page',
      'dashboard_view': 'Visited Dashboard',
      'explore_page_view': 'Visited Explore Page',
      'map_view': 'Viewed Map',
      'bookmarks_view': 'Visited Bookmarks',
      'community_reports_view': 'Visited Community Reports',
      'page_view': 'Viewed Page',
      
      // Admin Activities
      'admin_dashboard_view': 'Accessed Admin Dashboard',
      'admin_user_profile_view': 'Viewed User Profile (Admin)',
      'admin_user_activities_view': 'Viewed User Activities (Admin)',
      
      // Other
      'search_performed': 'Performed Search'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2759C5] mx-auto"></div>
          <p className="mt-4 text-white/60">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Button onClick={() => navigate('/admin')} className="bg-[#2759C5] hover:bg-[#3576E0]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">User Profile</h1>
                <p className="text-white/60">{userData.user.fullName} (@{userData.user.username})</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate(`/admin/user-activities/${userId}`)}
                variant="outline"
                className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
              >
                <Activity className="h-4 w-4 mr-2" />
                View Activity Analysis
              </Button>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32 bg-[#1f2937] border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/30">
                  <SelectItem value="1d">Last Day</SelectItem>
                  <SelectItem value="7d">Last Week</SelectItem>
                  <SelectItem value="30d">Last Month</SelectItem>
                  <SelectItem value="90d">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => handleExportUserData('json')}
                disabled={isExporting}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-background border-white/30">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {userData.user.profileImage ? (
                    <img 
                      src={userData.user.profileImage} 
                      alt={userData.user.fullName}
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-[#2759C5]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2759C5] to-[#3576E0] flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-white">{userData.user.fullName}</h2>
                  <p className="text-white/60">@{userData.user.username}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Badge className={userData.user.role === 'admin' ? 'bg-purple-600' : 'bg-[#2759C5]'}>
                      {userData.user.role}
                    </Badge>
                    <Badge className={userData.user.isActive ? 'bg-green-600' : 'bg-red-600'}>
                      {userData.user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {userData.user.isBlocked && (
                      <Badge className="bg-red-600/20 text-red-300 border border-red-600/30">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/70">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{userData.user.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Joined {new Date(userData.user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {userData.user.location && (
                    <div className="flex items-center gap-3 text-white/70">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{userData.user.location}</span>
                    </div>
                  )}
                  
                  {userData.user.bio && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/80">{userData.user.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Issues Stats */}
              <Card className="bg-background border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-[#2759C5]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/60">Total Issues</p>
                      <p className="text-2xl font-bold text-white">{userData.issueStats.totalIssues}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Stats */}
              <Card className="bg-background border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-[#3576E0]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/60">Activities</p>
                      <p className="text-2xl font-bold text-white">{userData.activityStats.summary.totalActivities}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Score */}
              <Card className="bg-background border-white/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-[#ACCFFF]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/60">Engagement</p>
                      <p className="text-2xl font-bold text-white">{userData.engagementMetrics.engagementScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issue Status Breakdown */}
            <Card className="bg-background border-white/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Issue Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{userData.issueStats.byStatus.open}</div>
                    <div className="text-sm text-white/60">Open</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{userData.issueStats.byStatus['in-progress']}</div>
                    <div className="text-sm text-white/60">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{userData.issueStats.byStatus.resolved}</div>
                    <div className="text-sm text-white/60">Resolved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="bg-[#111827] border-white/30">
            <TabsTrigger value="activities" className="data-[state=active]:bg-[#2759C5] text-white/60 data-[state=active]:text-white">
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2759C5] text-white/60 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-[#2759C5] text-white/60 data-[state=active]:text-white">
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Activity Logs
                  </CardTitle>
                  
                  {/* Activity Filters */}
                  <div className="flex items-center gap-2">
                    <Select 
                      value={activityFilters.action} 
                      onValueChange={(value) => {
                        setActivityFilters(prev => ({ ...prev, action: value }));
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                    >
                      <SelectTrigger className="w-40 bg-[#1f2937] border-white/30 text-white">
                        <SelectValue placeholder="Filter by action" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2937] border-white/30">
                        <SelectItem value="all">All Actions</SelectItem>
                        
                        {/* Authentication Actions */}
                        <SelectItem value="login">Login Actions</SelectItem>
                        <SelectItem value="logout">Logout Actions</SelectItem>
                        <SelectItem value="register">Register Actions</SelectItem>
                        <SelectItem value="login_page_view">Login Page Visits</SelectItem>
                        <SelectItem value="register_page_view">Register Page Visits</SelectItem>
                        
                        {/* Issue Management */}
                        <SelectItem value="issue_view">Issue Detail Views</SelectItem>
                        <SelectItem value="issue_create">Issue Creation</SelectItem>
                        <SelectItem value="issue_vote_up">Upvotes</SelectItem>
                        <SelectItem value="issue_vote_down">Downvotes</SelectItem>
                        <SelectItem value="issue_bookmark">Bookmarks</SelectItem>
                        <SelectItem value="issue_comment">Comments</SelectItem>
                        <SelectItem value="report_page_view">Report Page Visits</SelectItem>
                        
                        {/* Page Navigation */}
                        <SelectItem value="dashboard_view">Dashboard Visits</SelectItem>
                        <SelectItem value="explore_page_view">Explore Page Visits</SelectItem>
                        <SelectItem value="map_view">Map Views</SelectItem>
                        <SelectItem value="bookmarks_view">Bookmarks Page Visits</SelectItem>
                        <SelectItem value="community_reports_view">Community Reports Visits</SelectItem>
                        <SelectItem value="profile_view">Profile Views</SelectItem>
                        
                        {/* Actions */}
                        <SelectItem value="download_activity">Downloads</SelectItem>
                        <SelectItem value="share_activity">Shares</SelectItem>
                        <SelectItem value="profile_edit">Profile Edits</SelectItem>
                        
                        {/* Admin Actions */}
                        <SelectItem value="admin_dashboard_view">Admin Dashboard</SelectItem>
                        <SelectItem value="admin_user_profile_view">Admin User Profiles</SelectItem>
                        <SelectItem value="admin_user_activities_view">Admin User Activities</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={activityFilters.category} 
                      onValueChange={(value) => {
                        setActivityFilters(prev => ({ ...prev, category: value }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-40 bg-[#1f2937] border-white/30 text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2937] border-white/30">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                        <SelectItem value="bookmark">Bookmarks</SelectItem>
                        <SelectItem value="download">Downloads</SelectItem>
                        <SelectItem value="share">Sharing</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="issue_management">Issue Management</SelectItem>
                        <SelectItem value="profile">Profile</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="navigation">Navigation</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={activityFilters.resourceType} 
                      onValueChange={(value) => {
                        setActivityFilters(prev => ({ ...prev, resourceType: value }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-40 bg-[#1f2937] border-white/30 text-white">
                        <SelectValue placeholder="Resource type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2937] border-white/30">
                        <SelectItem value="all">All Resources</SelectItem>
                        <SelectItem value="issue">Issues</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="comment">Comments</SelectItem>
                        <SelectItem value="bookmark">Bookmarks</SelectItem>
                        <SelectItem value="admin_action">Admin Actions</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={() => {
                        setActivityFilters({
                          action: 'all',
                          category: 'all',
                          resourceType: 'all',
                          startDate: '',
                          endDate: ''
                        });
                        setCurrentPage(1);
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    >
                      Clear Filters
                    </Button>
                    
                    <Button 
                      onClick={fetchActivityLogs}
                      disabled={activityLoading}
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    >
                      {activityLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Filter className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {activityLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2759C5] mx-auto"></div>
                      <p className="text-white/60 mt-2">Loading activities...</p>
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No activities found</p>
                    </div>
                  ) : (
                    activityLogs.map((activity, index) => (
                      <div key={activity._id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(activity.action)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-white">
                              {getActionReadableName(activity.action)}
                            </span>
                            <Badge className={getSeverityColor(activity.severity)}>
                              {activity.severity}
                            </Badge>
                            {activity.isSuccessful ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                            {activity.metadata?.deviceType && (
                              <span>{activity.metadata.deviceType}</span>
                            )}
                            {activity.metadata?.responseTime && (
                              <span>{activity.metadata.responseTime}ms</span>
                            )}
                          </div>
                          
                          {activity.targetResource?.resourceTitle && (
                            <div className="mt-1 text-sm text-white/70">
                              Target: {activity.targetResource.resourceTitle}
                            </div>
                          )}
                          
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-2 text-xs bg-white/5 rounded p-2">
                              <pre className="text-white/60 overflow-x-auto">
                                {JSON.stringify(activity.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    >
                      Previous
                    </Button>
                    
                    <span className="flex items-center px-4 text-white/60">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Distribution */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.activityStats.byAction.slice(0, 5).map((stat: any) => {
                      const maxCount = userData.activityStats.byAction[0]?.count || 1;
                      const percentage = (stat.count / maxCount) * 100;
                      return (
                        <div key={stat._id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{getActionReadableName(stat._id)}</span>
                            <span className="text-sm text-white/60">{stat.count}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-[#2759C5] to-[#3576E0] rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Engagement Score</span>
                      <span className="font-bold text-white">{userData.engagementMetrics.engagementScore}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Activity Diversity</span>
                      <span className="font-bold text-white">{userData.engagementMetrics.activityDiversity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Avg Activities/Day</span>
                      <span className="font-bold text-white">{userData.activityStats.summary.avgActivitiesPerDay}</span>
                    </div>
                    
                    {userData.activityStats.summary.mostCommonAction && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-white/70 mb-1">Most Common Activity:</p>
                        <p className="font-medium text-white">
                          {getActionReadableName(userData.activityStats.summary.mostCommonAction.action)}
                        </p>
                        <p className="text-xs text-white/60">
                          {userData.activityStats.summary.mostCommonAction.count} times ({userData.activityStats.summary.mostCommonAction.successRate}% success rate)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userData.sessionAnalytics.totalSessions}</div>
                    <div className="text-sm text-white/60">Total Sessions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(userData.sessionAnalytics.avgSessionDuration || 0)}m
                    </div>
                    <div className="text-sm text-white/60">Avg Session Duration</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {userData.engagementMetrics.sessionMetrics?.lastLogin ? 
                        formatTimeAgo(userData.engagementMetrics.sessionMetrics.lastLogin) : 
                        'Never'
                      }
                    </div>
                    <div className="text-sm text-white/60">Last Login</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUserProfilePage;