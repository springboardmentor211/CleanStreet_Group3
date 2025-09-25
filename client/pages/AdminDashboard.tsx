import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalIssues: number;
  issuesByCategory: { _id: string; count: number }[];
  issuesByStatus: { _id: string; count: number }[];
  recentRegistrations: number;
}

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  reportedBy: {
    username: string;
    fullName: string;
    email: string;
  };
  assignedTo?: {
    username: string;
    fullName: string;
  };
  createdAt: string;
  location: {
    address: string;
  };
}

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [issuesPerPage] = useState(10);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchAdminData();
  }, [currentPage]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      try {
        const response = await adminAPI.getStats();
        setStats(response.data || response);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }

      // Fetch issues with pagination
      try {
        const response = await adminAPI.getAllIssues({ 
          page: currentPage, 
          limit: issuesPerPage 
        });
        setIssues(response.issues || response.data?.issues || []);
        setTotalPages(response.totalPages || Math.ceil((response.total || 0) / issuesPerPage));
      } catch (err) {
        console.error('Error fetching issues:', err);
      }

      // Fetch users
      try {
        const response = await adminAPI.getAllUsers();
        setUsers(response.data || response || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
      
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      await adminAPI.updateIssueStatus(issueId, newStatus);
      // Refresh issues
      fetchAdminData();
    } catch (err) {
      console.error('Error updating issue status:', err);
    }
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substr(0, maxLength) + '...';
  };

  const handleViewDetails = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-600/20 text-red-300 border border-red-600/30';
      case 'in-progress': return 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30';
      case 'resolved': return 'bg-green-600/20 text-green-300 border border-green-600/30';
      default: return 'bg-gray-600/20 text-gray-300 border border-gray-600/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-600/20 text-red-300 border border-red-600/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30';
      case 'low': return 'bg-green-600/20 text-green-300 border border-green-600/30';
      default: return 'bg-gray-600/20 text-gray-300 border border-gray-600/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2759C5] mx-auto"></div>
          <p className="mt-4 text-white/60">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/60">Welcome, {user.fullName}</p>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2 bg-[#832E2E] border-[#832E2E] text-white hover:bg-[#832E2E]/80">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-background border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-[#2759C5]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/60">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-[#3576E0]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/60">Total Issues</p>
                    <p className="text-2xl font-bold text-white">{stats.totalIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-[#ACCFFF]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/60">New Users (7 days)</p>
                    <p className="text-2xl font-bold text-white">{stats.recentRegistrations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/60">Resolved Issues</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.issuesByStatus.find(s => s._id === 'resolved')?.count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="issues" className="space-y-6">
          <TabsList className="bg-[#111827] border-white/30">
            <TabsTrigger value="issues" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">Issues Management</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">Users Management</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue._id} className="border border-white/30 rounded-lg p-4 space-y-3 bg-[#111827] hover:bg-[#1f2937] transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1" onClick={() => handleViewDetails(issue._id)}>
                          <h3 className="font-semibold text-lg text-white hover:text-[#2759C5] transition-colors">{issue.title}</h3>
                          <p className="text-white/60 text-sm mt-1">{truncateDescription(issue.description)}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="bg-[#2759C5] text-white">{issue.category}</Badge>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status}
                            </Badge>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority} priority
                            </Badge>
                          </div>
                          <div className="text-sm text-white/50 mt-2">
                            <p>Reported by: {issue.reportedBy.fullName} ({issue.reportedBy.email})</p>
                            <p>Location: {issue.location.address}</p>
                            <p>Date: {new Date(issue.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5] flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(issue._id);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0]"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateIssueStatus(issue._id, 'in-progress');
                            }}
                            disabled={issue.status === 'in-progress'}
                          >
                            In Progress
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-[#2759C5] hover:bg-[#3576E0] text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateIssueStatus(issue._id, 'resolved');
                            }}
                            disabled={issue.status === 'resolved'}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNumber <= totalPages) {
                          return (
                            <Button
                              key={pageNumber}
                              size="sm"
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              className={currentPage === pageNumber 
                                ? "bg-[#2759C5] text-white" 
                                : "border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                              }
                              onClick={() => goToPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                        return null;
                      })}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <CardTitle className="text-white">Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="border border-white/30 rounded-lg p-4 bg-[#111827]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white">{user.fullName}</h3>
                          <p className="text-white/60">@{user.username}</p>
                          <p className="text-white/60">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className={user.role === 'admin' ? 'bg-[#832E2E] text-white' : 'bg-[#2759C5] text-white'}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'outline'} className={user.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/50 mt-1">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues by Category - Bar Chart */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Issues by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.issuesByCategory.map((item) => {
                      const maxCount = Math.max(...(stats?.issuesByCategory?.map(i => i.count) || [1]));
                      const percentage = (item.count / maxCount) * 100;
                      return (
                        <div key={item._id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{item._id}</span>
                            <span className="text-sm text-white/60">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#2759C5] to-[#3576E0] rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Issues by Status - Donut Chart */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Issues by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    {stats?.issuesByStatus.length > 0 && (
                      <div className="relative w-48 h-48">
                        {/* Donut Chart */}
                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                          <circle
                            cx="100"
                            cy="100"
                            r="60"
                            stroke="currentColor"
                            strokeWidth="20"
                            fill="transparent"
                            className="text-gray-700"
                          />
                          {(() => {
                            const total = stats.issuesByStatus.reduce((sum, item) => sum + item.count, 0);
                            let cumulativePercentage = 0;
                            const colors = {
                              'open': '#ef4444',
                              'in-progress': '#f59e0b', 
                              'resolved': '#10b981',
                              'closed': '#6b7280'
                            };
                            
                            return stats.issuesByStatus.map((item) => {
                              const percentage = (item.count / total) * 100;
                              const strokeDasharray = `${percentage * 3.77} 377`;
                              const strokeDashoffset = -cumulativePercentage * 3.77;
                              cumulativePercentage += percentage;
                              
                              return (
                                <circle
                                  key={item._id}
                                  cx="100"
                                  cy="100"
                                  r="60"
                                  stroke={colors[item._id] || '#2759C5'}
                                  strokeWidth="20"
                                  fill="transparent"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-1000 ease-out"
                                />
                              );
                            });
                          })()}
                        </svg>
                        
                        {/* Center Total */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              {stats.issuesByStatus.reduce((sum, item) => sum + item.count, 0)}
                            </div>
                            <div className="text-sm text-white/60">Total Issues</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {stats?.issuesByStatus.map((item) => {
                      const colors = {
                        'open': 'bg-red-500',
                        'in-progress': 'bg-yellow-500', 
                        'resolved': 'bg-green-500',
                        'closed': 'bg-gray-500'
                      };
                      return (
                        <div key={item._id} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[item._id] || 'bg-blue-500'}`} />
                          <span className="text-sm text-white capitalize">{item._id}</span>
                          <span className="text-sm text-white/60 ml-auto">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend - Bar Chart */}
              <Card className="bg-background border-white/30 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Issue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simulated monthly data - you can replace with real API data */}
                    {(() => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                      const data = [12, 19, 15, 25, 22, 18]; // Simulated data
                      const maxValue = Math.max(...data);
                      
                      return (
                        <div className="h-64 flex items-end justify-between px-4">
                          {data.map((value, index) => {
                            const height = (value / maxValue) * 200;
                            return (
                              <div key={months[index]} className="flex flex-col items-center gap-2">
                                <div className="flex items-end h-48">
                                  <div
                                    className="bg-gradient-to-t from-[#2759C5] to-[#ACCFFF] rounded-t-lg w-12 transition-all duration-1000 ease-out hover:from-[#3576E0] hover:to-[#2759C5] cursor-pointer relative group"
                                    style={{ height: `${height}px` }}
                                  >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                      {value}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm text-white/60">{months[index]}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <div className="text-center">
                      <p className="text-sm text-white/60">Issues reported per month (Last 6 months)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const priorities = [
                        { name: 'Critical', count: 3, color: 'from-red-600 to-red-400' },
                        { name: 'High', count: 8, color: 'from-orange-600 to-orange-400' },
                        { name: 'Medium', count: 15, color: 'from-yellow-600 to-yellow-400' },
                        { name: 'Low', count: 6, color: 'from-green-600 to-green-400' }
                      ];
                      const maxCount = Math.max(...priorities.map(p => p.count));
                      
                      return priorities.map((priority) => {
                        const percentage = (priority.count / maxCount) * 100;
                        return (
                          <div key={priority.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-white">{priority.name}</span>
                              <span className="text-sm text-white/60">{priority.count}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${priority.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Resolution Time Analytics */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <CardTitle className="text-white">Resolution Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Average Resolution Time */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#2759C5] mb-2">2.3</div>
                      <div className="text-sm text-white/60">Average Days to Resolve</div>
                    </div>
                    
                    {/* Resolution Rate Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Resolution Rate</span>
                        <span className="text-sm text-white/60">78%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full w-[78%] transition-all duration-1000 ease-out" />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-white">24h</div>
                        <div className="text-xs text-white/60">Fastest Resolution</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-white">12</div>
                        <div className="text-xs text-white/60">Resolved This Week</div>
                      </div>
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

export default AdminDashboard;