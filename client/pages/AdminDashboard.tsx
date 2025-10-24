// Enhanced Admin Dashboard with Download Functionality
// To enable full download features, install these libraries:
// npm install html2canvas jspdf

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useAuth } from '@/lib/auth-context';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Eye,
  Download,
  FileImage,
  FileBarChart,
  Ban,
  UserCheck,
  Shield,
  AlertCircle,
  Activity
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
  isBlocked?: boolean;
  blockedAt?: string;
  blockedBy?: {
    username: string;
    fullName: string;
  };
  blockReason?: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [downloadingChart, setDownloadingChart] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [issuesPerPage] = useState(10);
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [animateCharts, setAnimateCharts] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchAdminData();
  }, [currentPage]);

  // Trigger animations when switching to analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      // Reset animation first
      setAnimateCharts(false);
      // Trigger animation after a short delay
      const timer = setTimeout(() => {
        setAnimateCharts(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

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

      // Fetch trends
      try {
        const response = await adminAPI.getTrends();
        setTrends(response.monthlyTrends || response.data?.monthlyTrends || []);
      } catch (err) {
        console.error('Error fetching trends:', err);
        // Set empty trends data as fallback
        setTrends([]);
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

  const handleBlockUser = async (user: User, block: boolean, reason?: string) => {
    try {
      setBlockingUserId(user._id);
      await adminAPI.blockUser(user._id, block, reason);
      
      // Refresh users data
      fetchAdminData();
      
      // Close dialog and reset state
      setShowBlockDialog(false);
      setSelectedUser(null);
      setBlockReason('');
      
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
    } finally {
      setBlockingUserId(null);
    }
  };

  const openBlockDialog = (user: User) => {
    setSelectedUser(user);
    setShowBlockDialog(true);
    setBlockReason('Miscellaneous reports');
  };

  // Download utilities
  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadChartAsPNG = async (elementId: string, filename: string) => {
    try {
      setDownloadingChart(elementId);
      // console.log('Starting image download for:', elementId);
      
      const element = document.getElementById(elementId);
      if (!element) {
        alert('Chart element not found');
        setDownloadingChart(null);
        return;
      }

      // console.log('Element found, starting html2canvas...');

      // Use the imported html2canvas with simpler options first
      const canvas = await html2canvas(element, {
        backgroundColor: '#0B0F19',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: true
      });
      
      // console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);
      
      canvas.toBlob((blob: Blob | null) => {
        // console.log('Blob created:', blob);
        if (blob) {
          // console.log('Creating download link...');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          // console.log('Download triggered successfully');
        } else {
          console.error('Failed to create blob');
          alert('Failed to create image blob');
        }
        setDownloadingChart(null);
      }, 'image/png');

    } catch (error) {
      console.error('Error downloading chart:', error);
      
      // Fallback: Try SVG export for charts with SVG elements
      try {
        const element = document.getElementById(elementId);
        if (element) {
          const svgs = element.querySelectorAll('svg');
          if (svgs.length > 0) {
            const svg = svgs[0];
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            canvas.width = svg.getBoundingClientRect().width * 2;
            canvas.height = svg.getBoundingClientRect().height * 2;
            
            img.onload = () => {
              if (ctx) {
                ctx.fillStyle = '#0B0F19';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${filename}.png`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }
                  setDownloadingChart(null);
                });
              }
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
          } else {
            alert('Unable to capture chart image. Please try again.');
            setDownloadingChart(null);
          }
        } else {
          setDownloadingChart(null);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        alert('Error capturing chart image');
        setDownloadingChart(null);
      }
    }
  };

  const downloadPageAsPDF = async () => {
    try {
      // Check if jsPDF is available (you can install it with: npm install jspdf)
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const { jsPDF } = (window as any);
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Add title
        doc.setFontSize(20);
        doc.text('CleanStreet Analytics Report', 20, 20);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
        
        // Add stats summary
        if (stats) {
          doc.text(`Total Users: ${stats.totalUsers}`, 20, 50);
          doc.text(`Total Issues: ${stats.totalIssues}`, 20, 60);
          doc.text(`Recent Registrations: ${stats.recentRegistrations}`, 20, 70);
        }
        
        // Add category data
        if (stats?.issuesByCategory) {
          doc.text('Issues by Category:', 20, 90);
          stats.issuesByCategory.forEach((item, index) => {
            doc.text(`${item._id}: ${item.count}`, 25, 100 + (index * 10));
          });
        }
        
        // Add status data
        if (stats?.issuesByStatus) {
          doc.text('Issues by Status:', 20, 140);
          stats.issuesByStatus.forEach((item, index) => {
            doc.text(`${item._id}: ${item.count}`, 25, 150 + (index * 10));
          });
        }
        
        // Save the PDF
        doc.save('cleanstreet-analytics-report.pdf');
      } else {
        // Fallback to print dialog
        const originalTitle = document.title;
        document.title = 'CleanStreet Analytics Report';
        
        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>CleanStreet Analytics Report</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .section { margin-bottom: 20px; }
                  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                  @media print { body { margin: 0; } }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>CleanStreet Analytics Report</h1>
                  <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="stats">
                  <div class="section">
                    <h3>Summary Statistics</h3>
                    <p>Total Users: ${stats?.totalUsers || 0}</p>
                    <p>Total Issues: ${stats?.totalIssues || 0}</p>
                    <p>Recent Registrations: ${stats?.recentRegistrations || 0}</p>
                  </div>
                  <div class="section">
                    <h3>Issues by Category</h3>
                    ${stats?.issuesByCategory?.map(item => `<p>${item._id}: ${item.count}</p>`).join('') || '<p>No data available</p>'}
                  </div>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
        
        document.title = originalTitle;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
    }
  };

  // Data preparation functions
  const getCategoryCSVData = () => {
    if (!stats?.issuesByCategory) return [];
    return stats.issuesByCategory.map(item => ({
      Category: item._id,
      Count: item.count,
      Percentage: ((item.count / stats.totalIssues) * 100).toFixed(2) + '%'
    }));
  };

  const getStatusCSVData = () => {
    if (!stats?.issuesByStatus) return [];
    return stats.issuesByStatus.map(item => ({
      Status: item._id,
      Count: item.count,
      Percentage: ((item.count / stats.totalIssues) * 100).toFixed(2) + '%'
    }));
  };

  const getTrendsCSVData = () => {
    return trends.map(trend => ({
      Month: trend.month,
      Year: trend.year,
      'Issue Count': trend.count
    }));
  };

  const getPriorityCSVData = () => {
    const priorities = [
      { name: 'Critical', count: 3 },
      { name: 'High', count: 8 },
      { name: 'Medium', count: 15 },
      { name: 'Low', count: 6 }
    ];
    return priorities.map(p => ({
      Priority: p.name,
      Count: p.count
    }));
  };

  const downloadAllCSVs = () => {
    downloadCSV(getCategoryCSVData(), 'issues-by-category');
    setTimeout(() => downloadCSV(getStatusCSVData(), 'issues-by-status'), 100);
    setTimeout(() => downloadCSV(getTrendsCSVData(), 'issue-trends'), 200);
    setTimeout(() => downloadCSV(getPriorityCSVData(), 'priority-distribution'), 300);
  };

  // Simple test for html2canvas
  const testHtml2Canvas = async () => {
    try {
      // console.log('Testing html2canvas...');
      const testDiv = document.createElement('div');
      testDiv.innerHTML = 'Test';
      testDiv.style.padding = '20px';
      testDiv.style.background = 'blue';
      testDiv.style.color = 'white';
      document.body.appendChild(testDiv);
      
      const canvas = await html2canvas(testDiv);
      document.body.removeChild(testDiv);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'test.png';
          link.click();
          URL.revokeObjectURL(url);
          // console.log('html2canvas test successful!');
        }
      });
    } catch (error) {
      console.error('html2canvas test failed:', error);
    }
  };

  // Alternative download method using canvas directly
  const downloadChartAsImage = (elementId: string, filename: string) => {
    try {
      setDownloadingChart(elementId);
      // console.log('Trying alternative download method for:', elementId);
      
      const element = document.getElementById(elementId);
      if (!element) {
        alert('Chart element not found');
        setDownloadingChart(null);
        return;
      }

      // Try direct canvas approach for SVG charts
      const svgs = element.querySelectorAll('svg');
      if (svgs.length > 0) {
        const svg = svgs[0];
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = svg.getBoundingClientRect().width * 2;
          canvas.height = svg.getBoundingClientRect().height * 2;
          
          if (ctx) {
            ctx.fillStyle = '#0B0F19';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.png`;
                link.click();
                URL.revokeObjectURL(url);
                // console.log('SVG download completed');
              }
              setDownloadingChart(null);
            });
          }
          URL.revokeObjectURL(svgUrl);
        };
        
        img.src = svgUrl;
      } else {
        // Fallback to html2canvas
        downloadChartAsPNG(elementId, filename);
      }
    } catch (error) {
      console.error('Error in alternative download:', error);
      setDownloadingChart(null);
    }
  };

  const downloadAllCharts = async () => {
    try {
      await downloadChartAsPNG('category-chart', 'category-chart');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await downloadChartAsPNG('status-chart', 'status-chart');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await downloadChartAsPNG('trends-chart', 'trends-chart');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await downloadChartAsPNG('priority-chart', 'priority-chart');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await downloadChartAsPNG('performance-chart', 'performance-chart');
    } catch (error) {
      console.error('Error downloading all charts:', error);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  <Ban className="h-8 w-8 text-red-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/60">Blocked Users</p>
                    <p className="text-2xl font-bold text-white">{users.filter(u => u.isBlocked).length}</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#111827] border-white/30">
            <TabsTrigger value="issues" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">Issues Management</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">Users Management</TabsTrigger>
            <TabsTrigger value="blocked" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">
              <Ban className="h-4 w-4 mr-1" />
              Blocked Users
            </TabsTrigger>
            {/* <TabsTrigger value="activity" className="data-[state=active]:bg-[#2759C5] data-[state=active]:text-white text-white/60">
              <Activity className="h-4 w-4 mr-1" />
              User Activity
            </TabsTrigger> */}
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
                <CardTitle className="text-white">
                  Users Management ({users.filter(user => user.role !== 'admin' && !user.isBlocked).length} users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(user => user.role !== 'admin' && !user.isBlocked).length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">No active users found</p>
                      <p className="text-white/40 text-sm">Active users will appear here when they register</p>
                    </div>
                  ) : (
                    users.filter(user => user.role !== 'admin' && !user.isBlocked).map((user) => (
                    <div key={user._id} className="border border-white/30 rounded-lg p-4 bg-[#111827]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{user.fullName}</h3>
                          <p className="text-white/60">@{user.username}</p>
                          <p className="text-white/60">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="bg-[#2759C5] text-white">
                              {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'outline'} className={user.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {user.isBlocked && (
                              <Badge className="bg-red-600/20 text-red-300 border border-red-600/30 flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/50 mt-1">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          {user.isBlocked && user.blockedAt && (
                            <div className="mt-2 text-sm text-red-300/80">
                              <p>Blocked: {new Date(user.blockedAt).toLocaleDateString()}</p>
                              {user.blockedBy && (
                                <p>By: {user.blockedBy.fullName}</p>
                              )}
                              {user.blockReason && (
                                <p>Reason: {user.blockReason}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5] flex items-center gap-1"
                            onClick={() => navigate(`/admin/userprofile/${user._id}`)}
                          >
                            <Eye className="h-3 w-3" />
                            View Profile
                          </Button>
                          
                          {user.isBlocked ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                              onClick={() => handleBlockUser(user, false)}
                              disabled={blockingUserId === user._id}
                            >
                              {blockingUserId === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                              ) : (
                                <UserCheck className="h-3 w-3" />
                              )}
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-1"
                              onClick={() => openBlockDialog(user)}
                              disabled={blockingUserId === user._id}
                            >
                              {blockingUserId === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                              ) : (
                                <Ban className="h-3 w-3" />
                              )}
                              Block User
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-400" />
                  Blocked Users ({users.filter(user => user.isBlocked).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(user => user.isBlocked).length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">No blocked users</p>
                      <p className="text-white/40 text-sm">Users blocked for miscellaneous reports will appear here</p>
                    </div>
                  ) : (
                    users.filter(user => user.isBlocked).map((user) => (
                      <div key={user._id} className="border border-red-600/30 rounded-lg p-4 bg-red-900/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{user.fullName}</h3>
                            <p className="text-white/60">@{user.username}</p>
                            <p className="text-white/60">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="bg-[#2759C5] text-white">
                                {user.role}
                              </Badge>
                              <Badge className="bg-red-600/20 text-red-300 border border-red-600/30 flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </Badge>
                            </div>
                            <div className="mt-3 text-sm space-y-1">
                              <p className="text-white/50">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                              {user.blockedAt && (
                                <p className="text-red-300/80">
                                  Blocked: {new Date(user.blockedAt).toLocaleDateString()}
                                </p>
                              )}
                              {user.blockedBy && (
                                <p className="text-red-300/80">
                                  By: {user.blockedBy.fullName}
                                </p>
                              )}
                              {user.blockReason && (
                                <p className="text-red-300/80">
                                  Reason: {user.blockReason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5] flex items-center gap-1"
                              onClick={() => navigate(`/admin/userprofile/${user._id}`)}
                            >
                              <Eye className="h-3 w-3" />
                              View Profile
                            </Button>
                            
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                              onClick={() => handleBlockUser(user, false)}
                              disabled={blockingUserId === user._id}
                            >
                              {blockingUserId === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                              ) : (
                                <UserCheck className="h-3 w-3" />
                              )}
                              Unblock
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-background border-white/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  User Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Activity Category Cards */}
                  <div className="bg-[#111827] border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <LogOut className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Authentication</h3>
                        <p className="text-white/60 text-sm">Login/Logout activities</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Bookmarks</h3>
                        <p className="text-white/60 text-sm">Save/Unsave activities</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Download className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Downloads</h3>
                        <p className="text-white/60 text-sm">PDF & file downloads</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Engagement</h3>
                        <p className="text-white/60 text-sm">Likes, shares & votes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Recent User Activities</h3>
                  
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">No user activities to display</p>
                      <p className="text-white/40 text-sm">User activities will appear here as they interact with the platform</p>
                    </div>
                  ) : (
                    users.filter(user => user.role !== 'admin' && !user.isBlocked).slice(0, 5).map((user) => (
                      <div key={user._id} className="border border-white/30 rounded-lg p-4 bg-[#111827]">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{user.fullName}</h3>
                            <p className="text-white/60">@{user.username}</p>
                            <p className="text-white/60">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="bg-[#2759C5] text-white">
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
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 flex items-center gap-1"
                              onClick={() => navigate(`/admin/user-activities/${user._id}`)}
                            >
                              <Activity className="h-3 w-3" />
                              View Activities
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5] flex items-center gap-1"
                              onClick={() => navigate(`/admin/userprofile/${user._id}`)}
                            >
                              <Eye className="h-3 w-3" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {users.filter(user => user.role !== 'admin' && !user.isBlocked).length > 5 && (
                  <div className="text-center mt-6">
                    <p className="text-white/60 text-sm">
                      Showing 5 of {users.filter(user => user.role !== 'admin' && !user.isBlocked).length} users
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" id="analytics-content">
            {/* Analytics Download Controls */}
            <div className={`mb-6 p-4 bg-[#111827] rounded-lg border border-white/30 transition-all duration-1000 ease-out ${
              activeTab === 'analytics' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Analytics Export</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={downloadAllCSVs}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5] flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All CSVs
                  </Button>
                  {/* <Button
                    onClick={testHtml2Canvas}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-600 hover:border-red-600 hover:text-white flex items-center gap-2"
                  >
                    Test HTML2Canvas
                  </Button> */}
                  <Button
                    onClick={downloadAllCharts}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0] flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Download All Charts
                  </Button>
                  {/* <Button
                    onClick={downloadPageAsPDF}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-[#832E2E] hover:border-[#832E2E] flex items-center gap-2"
                  >
                    <FileBarChart className="h-4 w-4" />
                    Export as PDF
                  </Button> */}
                </div>
              </div>
            </div>
            
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-1200 ease-out ${
              activeTab === 'analytics' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              {/* Issues by Category - Bar Chart */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Issues by Category</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadCSV(getCategoryCSVData(), 'issues-by-category')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        title="Download as CSV"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => {
                          // console.log('Image download button clicked');
                          downloadChartAsImage('category-chart', 'category-chart');
                        }}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0]"
                        title="Download as Image"
                        disabled={downloadingChart === 'category-chart'}
                      >
                        {downloadingChart === 'category-chart' ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                        ) : (
                          <FileImage className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="category-chart">
                  <div className="space-y-4">
                    {stats?.issuesByCategory.map((item, index) => {
                      const maxCount = Math.max(...(stats?.issuesByCategory?.map(i => i.count) || [1]));
                      const percentage = (item.count / maxCount) * 100;
                      return (
                        <div key={item._id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{item._id}</span>
                            <span 
                              className={`text-sm text-white/60 transition-all duration-1200 ease-out ${
                                animateCharts ? 'opacity-100' : 'opacity-0'
                              }`}
                              style={{ 
                                transitionDelay: `${index * 300 + 1200}ms`
                              }}
                            >
                              {animateCharts ? item.count : 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#2759C5] to-[#3576E0] rounded-full transition-all duration-2000 ease-out"
                              style={{ 
                                width: animateCharts ? `${percentage}%` : '0%',
                                transitionDelay: `${index * 300}ms`
                              }}
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
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Issues by Status</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadCSV(getStatusCSVData(), 'issues-by-status')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        title="Download as CSV"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => downloadChartAsPNG('status-chart', 'status-chart')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0]"
                        title="Download as Image"
                      >
                        <FileImage className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="status-chart">
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
                            
                            return stats.issuesByStatus.map((item, index) => {
                              const percentage = (item.count / total) * 100;
                              const animatedPercentage = animateCharts ? percentage : 0;
                              const strokeDasharray = `${animatedPercentage * 3.77} 377`;
                              const strokeDashoffset = animateCharts ? -cumulativePercentage * 3.77 : 0;
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
                                  className="transition-all duration-2500 ease-out"
                                  style={{ 
                                    transitionDelay: `${index * 400}ms`
                                  }}
                                />
                              );
                            });
                          })()}
                        </svg>
                        
                        {/* Center Total */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-2xl font-bold text-white transition-all duration-1800 ease-out ${
                              animateCharts ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                            }`}
                            style={{ transitionDelay: '800ms' }}>
                              {stats.issuesByStatus.reduce((sum, item) => sum + item.count, 0)}
                            </div>
                            <div className={`text-sm text-white/60 transition-all duration-1200 ease-out ${
                              animateCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                            }`}
                            style={{ transitionDelay: '1000ms' }}>
                              Total Issues
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {stats?.issuesByStatus.map((item, index) => {
                      const colors = {
                        'open': 'bg-red-500',
                        'in-progress': 'bg-yellow-500', 
                        'resolved': 'bg-green-500',
                        'closed': 'bg-gray-500'
                      };
                      return (
                        <div 
                          key={item._id} 
                          className={`flex items-center gap-2 transition-all duration-1400 ease-out ${
                            animateCharts ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                          }`}
                          style={{ transitionDelay: `${1500 + index * 200}ms` }}
                        >
                          <div className={`w-3 h-3 rounded-full transition-all duration-800 ${colors[item._id] || 'bg-blue-500'} ${
                            animateCharts ? 'scale-100' : 'scale-0'
                          }`} 
                          style={{ transitionDelay: `${1300 + index * 200}ms` }} />
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
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Issue Trends</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadCSV(getTrendsCSVData(), 'issue-trends')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        title="Download as CSV"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => downloadChartAsPNG('trends-chart', 'trends-chart')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0]"
                        title="Download as Image"
                      >
                        <FileImage className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="trends-chart">
                  <div className="space-y-4">
                    {trends && trends.length > 0 ? (
                      <>
                        {(() => {
                          const maxValue = Math.max(...trends.map(t => t.count), 1);
                          
                          return (
                            <div className="h-64 flex items-end justify-between px-4">
                              {trends.map((trend, index) => {
                                const height = maxValue > 0 ? (trend.count / maxValue) * 200 : 0;
                                const animatedHeight = animateCharts ? Math.max(height, 2) : 2;
                                return (
                                  <div key={`${trend.year}-${trend.monthNumber}`} className="flex flex-col items-center gap-2">
                                    <div className="flex items-end h-48">
                                      <div
                                        className="bg-gradient-to-t from-[#2759C5] to-[#ACCFFF] rounded-t-lg w-12 transition-all duration-2000 ease-out hover:from-[#3576E0] hover:to-[#2759C5] cursor-pointer relative group"
                                        style={{ 
                                          height: `${animatedHeight}px`,
                                          transitionDelay: `${index * 250}ms`
                                        }}
                                      >
                                        <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs transition-opacity duration-800 whitespace-nowrap ${
                                          animateCharts ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
                                        }`}
                                        style={{ transitionDelay: `${index * 250 + 1200}ms` }}>
                                          {trend.count} issues
                                        </div>
                                      </div>
                                    </div>
                                    <span className={`text-sm text-white/60 transition-all duration-1000 ease-out ${
                                      animateCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                    }`}
                                    style={{ transitionDelay: `${index * 250 + 600}ms` }}>
                                      {trend.month}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                        <div className="text-center">
                          <p className={`text-sm text-white/60 transition-all duration-1200 ease-out ${
                            animateCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          }`}
                          style={{ transitionDelay: '1500ms' }}>
                            Issues reported per month (Last 6 months)
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-white/60 mb-2">📊</div>
                          <p className="text-sm text-white/60">Loading trends data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card className="bg-background border-white/30">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Priority Distribution</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadCSV(getPriorityCSVData(), 'priority-distribution')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        title="Download as CSV"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => downloadChartAsPNG('priority-chart', 'priority-chart')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0]"
                        title="Download as Image"
                      >
                        <FileImage className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="priority-chart">
                  <div className="space-y-4">
                    {(() => {
                      const priorities = [
                        { name: 'Critical', count: 3, color: 'from-red-600 to-red-400' },
                        { name: 'High', count: 8, color: 'from-orange-600 to-orange-400' },
                        { name: 'Medium', count: 15, color: 'from-yellow-600 to-yellow-400' },
                        { name: 'Low', count: 6, color: 'from-green-600 to-green-400' }
                      ];
                      const maxCount = Math.max(...priorities.map(p => p.count));
                      
                      return priorities.map((priority, index) => {
                        const percentage = (priority.count / maxCount) * 100;
                        return (
                          <div key={priority.name} className="space-y-2">
                            <div className={`flex justify-between items-center transition-all duration-1000 ease-out ${
                              animateCharts ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                            }`}
                            style={{ transitionDelay: `${index * 300}ms` }}>
                              <span className="font-medium text-white">{priority.name}</span>
                              <span className={`text-sm text-white/60 transition-all duration-800 ease-out ${
                                animateCharts ? 'opacity-100' : 'opacity-0'
                              }`}
                              style={{ transitionDelay: `${index * 300 + 800}ms` }}>
                                {priority.count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${priority.color} rounded-full transition-all duration-2000 ease-out`}
                                style={{ 
                                  width: animateCharts ? `${percentage}%` : '0%',
                                  transitionDelay: `${index * 300 + 400}ms`
                                }}
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
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Resolution Performance</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadCSV([{
                          'Average Days to Resolve': '2.3',
                          'Resolution Rate': '78%',
                          'Fastest Resolution': '24h',
                          'Resolved This Week': '12'
                        }], 'resolution-performance')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#2759C5] hover:border-[#2759C5]"
                        title="Download as CSV"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => downloadChartAsPNG('performance-chart', 'performance-chart')}
                        variant="outline"
                        size="sm"
                        className="border-white/30 text-white hover:bg-[#3576E0] hover:border-[#3576E0]"
                        title="Download as Image"
                      >
                        <FileImage className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent id="performance-chart">
                  <div className="space-y-6">
                    {/* Average Resolution Time */}
                    <div className="text-center">
                      <div className={`text-3xl font-bold text-[#2759C5] mb-2 transition-all duration-1800 ease-out ${
                        animateCharts ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
                      }`}
                      style={{ transitionDelay: '500ms' }}>
                        2.3
                      </div>
                      <div className={`text-sm text-white/60 transition-all duration-1200 ease-out ${
                        animateCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: '900ms' }}>
                        Average Days to Resolve
                      </div>
                    </div>
                    
                    {/* Resolution Rate Progress */}
                    <div className="space-y-2">
                      <div className={`flex justify-between transition-all duration-1000 ease-out ${
                        animateCharts ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}
                      style={{ transitionDelay: '1200ms' }}>
                        <span className="text-sm text-white">Resolution Rate</span>
                        <span className="text-sm text-white/60">78%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-2500 ease-out"
                          style={{ 
                            width: animateCharts ? '78%' : '0%',
                            transitionDelay: '1500ms'
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                      <div className={`text-center transition-all duration-1200 ease-out ${
                        animateCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: '1800ms' }}>
                        <div className={`text-xl font-semibold text-white transition-all duration-800 ease-out ${
                          animateCharts ? 'scale-100' : 'scale-0'
                        }`}
                        style={{ transitionDelay: '2200ms' }}>
                          24h
                        </div>
                        <div className="text-xs text-white/60">Fastest Resolution</div>
                      </div>
                      <div className={`text-center transition-all duration-1200 ease-out ${
                        animateCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: '1900ms' }}>
                        <div className={`text-xl font-semibold text-white transition-all duration-800 ease-out ${
                          animateCharts ? 'scale-100' : 'scale-0'
                        }`}
                        style={{ transitionDelay: '2300ms' }}>
                          12
                        </div>
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

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-[#111827] border-white/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <Shield className="h-5 w-5" />
              Block User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to block {selectedUser?.fullName} (@{selectedUser?.username})?
              <br />
              This will hide all their reports from the public view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="blockReason" className="text-sm font-medium text-white">
                Block Reason
              </Label>
              <Input
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                className="bg-[#1f2937] border-white/30 text-white placeholder:text-white/40"
                maxLength={500}
              />
            </div>
            
            <div className="bg-red-900/20 border border-red-600/30 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-300">
                  <p className="font-medium">Warning:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• All user's reports will be hidden from public view</li>
                    <li>• User will be marked as blocked in the system</li>
                    <li>• This action can be reversed by unblocking the user</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent border-white/30 text-white hover:bg-white/10"
              onClick={() => {
                setShowBlockDialog(false);
                setSelectedUser(null);
                setBlockReason('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => selectedUser && handleBlockUser(selectedUser, true, blockReason)}
              disabled={!blockReason.trim()}
            >
              {blockingUserId === selectedUser?._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b border-white" />
              ) : (
                'Block User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;