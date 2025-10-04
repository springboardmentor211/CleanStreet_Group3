import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  ArrowLeft, 
  Filter, 
  Calendar,
  Download,
  User,
  BarChart3,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface UserActivity {
  _id: string;
  action: string;
  category: string;
  details: Record<string, any>;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
  };
  targetResource?: {
    resourceType: string;
    resourceId: string;
    resourceTitle?: string;
  };
  isSuccessful: boolean;
  timestamp: string;
}

interface ActivityStats {
  categoryStats: Array<{
    category: string;
    count: number;
    actionTypes: number;
    lastActivity: string;
    successRate: number;
  }>;
  generalStats: Array<{
    _id: string;
    count: number;
    lastActivity: string;
    successRate: number;
  }>;
}

const AdminUserActivityPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  // Debug auth state
  console.log('Current user:', user);
  console.log('User role:', user?.role);
  console.log('User ID:', user?.id);
  console.log('URL userId param:', userId);

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  const categories = [
    { key: '', label: 'All Categories', color: 'bg-gray-500' },
    { key: 'authentication', label: 'Authentication', color: 'bg-blue-500' },
    { key: 'bookmark', label: 'Bookmarks', color: 'bg-amber-500' },
    { key: 'download', label: 'Downloads', color: 'bg-green-500' },
    { key: 'share', label: 'Sharing', color: 'bg-purple-500' },
    { key: 'engagement', label: 'Engagement', color: 'bg-rose-500' },
    { key: 'issue_management', label: 'Issues', color: 'bg-orange-500' },
    { key: 'profile', label: 'Profile', color: 'bg-cyan-500' },
    { key: 'admin', label: 'Admin Actions', color: 'bg-red-500' },
    { key: 'navigation', label: 'Navigation', color: 'bg-indigo-500' }
  ];

  const timeframes = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchActivities();
    fetchStats();
  }, [userId, selectedCategory, timeframe, currentPage]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUserProfile(data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token for activities API:', token ? 'Present' : 'Missing');
      console.log('UserId for activities:', userId);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(
        `http://localhost:5000/api/activity-logs/user/${userId}?${params}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        console.error('Activities API error:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        return;
      }
      
      const data = await response.json();
      
      setActivities(data.activities || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token for stats API:', token ? 'Present' : 'Missing');
      console.log('UserId for stats:', userId);
      
      const response = await fetch(
        `http://localhost:5000/api/activity-logs/stats/${userId}?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        console.error('Stats API error:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        return;
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const actionLabels: Record<string, string> = {
      'login': 'Logged In',
      'logout': 'Logged Out',
      'issue_create': 'Created Issue',
      'issue_view': 'Viewed Issue',
      'issue_vote_up': 'Upvoted Issue',
      'issue_vote_down': 'Downvoted Issue',
      'issue_bookmark': 'Bookmarked Issue',
      'issue_unbookmark': 'Removed Bookmark',
      'issue_bookmark_toggle': 'Toggled Bookmark',
      'like_activity': 'Liked Content',
      'dislike_activity': 'Disliked Content',
      'download_activity': 'Downloaded File',
      'share_activity': 'Shared Content',
      'page_view': 'Viewed Page',
      'profile_view': 'Viewed Profile',
      'profile_edit': 'Updated Profile'
    };
    return actionLabels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryStyle = (category: string) => {
    const categoryConfig = categories.find(c => c.key === category);
    return categoryConfig?.color || 'bg-gray-500';
  };

  const downloadActivitiesCSV = () => {
    const headers = ['Timestamp', 'Action', 'Category', 'Success', 'Device', 'Details'];
    const csvData = activities.map(activity => [
      formatTimestamp(activity.timestamp),
      getActionLabel(activity.action),
      activity.category,
      activity.isSuccessful ? 'Yes' : 'No',
      activity.metadata?.deviceType || 'Unknown',
      activity.targetResource?.resourceTitle || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user-activities-${userProfile?.username || userId}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">User Activity Analysis</h1>
                {userProfile && (
                  <p className="text-white/60">
                    {userProfile.fullName} (@{userProfile.username})
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={downloadActivitiesCSV}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#111827] border-white/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* User Profile Summary */}
            {userProfile && (
              <Card className="bg-background border-white/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-white/60 text-sm">Full Name</p>
                    <p className="text-white font-semibold">{userProfile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Email</p>
                    <p className="text-white font-semibold">{userProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Joined</p>
                    <p className="text-white font-semibold">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Categories Overview */}
            {stats && stats.categoryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.categoryStats.map((category) => (
                  <Card key={category.category} className="bg-background border-white/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${getCategoryStyle(category.category)} text-white`}>
                          {categories.find(c => c.key === category.category)?.label || category.category}
                        </Badge>
                        <span className="text-2xl font-bold text-white">{category.count}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Action Types</span>
                          <span className="text-white">{category.actionTypes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Success Rate</span>
                          <span className="text-white">{Math.round(category.successRate)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Last Activity</span>
                          <span className="text-white">
                            {new Date(category.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Log
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-[#111827] border border-white/30 text-white rounded-md px-3 py-1 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2759C5] mx-auto"></div>
                      <p className="text-white/60 mt-2">Loading activities...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">No activities found for the selected filters</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity._id} className="border border-white/30 rounded-lg p-4 bg-[#111827]">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`${getCategoryStyle(activity.category)} text-white text-xs`}>
                                {categories.find(c => c.key === activity.category)?.label || activity.category}
                              </Badge>
                              <span className="text-white font-medium">
                                {getActionLabel(activity.action)}
                              </span>
                              {activity.isSuccessful ? (
                                <Badge className="bg-green-600/20 text-green-300 border border-green-600/30 text-xs">
                                  Success
                                </Badge>
                              ) : (
                                <Badge className="bg-red-600/20 text-red-300 border border-red-600/30 text-xs">
                                  Failed
                                </Badge>
                              )}
                            </div>
                            
                            {activity.targetResource && (
                              <p className="text-white/70 text-sm mb-2">
                                Target: {activity.targetResource.resourceTitle || activity.targetResource.resourceId}
                              </p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                              <div>
                                <span className="font-medium">Time:</span> {formatTimestamp(activity.timestamp)}
                              </div>
                              <div>
                                <span className="font-medium">Device:</span> {activity.metadata?.deviceType || 'Unknown'}
                              </div>
                            </div>
                            
                            {Object.keys(activity.details).length > 0 && (
                              <div className="mt-3 p-3 bg-white/5 rounded-md">
                                <p className="text-white/60 text-xs mb-2">Activity Details:</p>
                                <div className="space-y-1">
                                  {Object.entries(activity.details).map(([key, value]) => (
                                    <div key={key} className="text-white/80 text-xs">
                                      <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                                      <span className="text-white">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/30">
                    <div className="text-sm text-white/60">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeframe Selection */}
              <Card className="bg-background border-white/30 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics Dashboard
                    </CardTitle>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="bg-[#111827] border border-white/30 text-white rounded-md px-3 py-2"
                    >
                      {timeframes.map((tf) => (
                        <option key={tf.key} value={tf.key}>
                          {tf.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
              </Card>

              {/* Most Active Categories */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Most Active Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.categoryStats.slice(0, 5).map((category, index) => {
                      const maxCount = Math.max(...(stats.categoryStats.map(c => c.count)));
                      const percentage = (category.count / maxCount) * 100;
                      
                      return (
                        <div key={category.category}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">
                              {categories.find(c => c.key === category.category)?.label || category.category}
                            </span>
                            <span className="text-white/60">{category.count}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getCategoryStyle(category.category)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-md">
                      <span className="text-white/60">Total Activities</span>
                      <span className="text-white font-bold">
                        {stats?.categoryStats.reduce((sum, cat) => sum + cat.count, 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-md">
                      <span className="text-white/60">Category Types</span>
                      <span className="text-white font-bold">
                        {stats?.categoryStats.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-md">
                      <span className="text-white/60">Average Success Rate</span>
                      <span className="text-white font-bold">
                        {stats?.categoryStats.length ? 
                          Math.round(stats.categoryStats.reduce((sum, cat) => sum + cat.successRate, 0) / stats.categoryStats.length) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUserActivityPage;