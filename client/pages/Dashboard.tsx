import { Layout } from "@/components/Layout";
import { useEffect, useState, useRef } from "react";
import { issuesAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  Plus, 
  Eye, 
  Map
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCurrent(0);
      return;
    }

    const animateCount = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Smooth easing
      
      setCurrent(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCurrent(end);
      }
    };

    startTime.current = null;
    requestAnimationFrame(animateCount);
  }, [end, duration]);

  return <>{current}</>;
}

function StatCard({ title, value, icon }: StatCardProps) {
  const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;
  
  return (
    <div className="border border-white/30 rounded-lg bg-background p-6 flex flex-col items-center justify-center min-h-[186px] transform transition-all duration-300 hover:scale-105 hover:border-cs-blue-secondary/50">
      <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      <div className="text-white text-[30px] font-bold mb-2 tabular-nums">
        <AnimatedCounter end={numericValue} />
      </div>
      <div className="text-white text-2xl font-light text-center">
        {title}
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}

function QuickAction({ title, icon, onClick, primary = false }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-[78px] rounded-xl border flex items-center px-6 space-x-4 hover:opacity-80 transition-opacity ${
        primary 
          ? 'bg-cs-blue-secondary border-black' 
          : 'bg-background border-white/30'
      }`}
    >
      {icon}
      <span className="text-white text-[32px] font-light">
        {title}
      </span>
    </button>
  );
}

interface ActivityItemProps {
  title: string;
  time: string;
}

function ActivityItem({ title, time }: ActivityItemProps) {
  return (
    <div className="border-b border-white/30 last:border-b-0 py-6">
      <div className="text-white text-[32px] font-light mb-2">
        {title}
      </div>
      <div className="text-white text-xl font-thin">
        {time}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, tCategory, tStatus } = useI18n();
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [userRecentActivity, setUserRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // Fetch overall statistics for all users
        const res = await issuesAPI.getDashboardStats();
        setMetrics({
          total: res.total || 0,
          open: res.open || 0,
          inProgress: res.inProgress || 0,
          resolved: res.resolved || 0,
        });
        // console.log("Fetched Dashboard Metrics:", res);
      } catch (err) {
        console.error("Dashboard metrics error:", err);
      }
    }

    async function fetchUserRecentActivity() {
      // Try to get user ID from auth context or localStorage
      const userId = user?.id || (() => {
        try {
          const storedUser = localStorage.getItem('currentUser');
          return storedUser ? JSON.parse(storedUser).id : null;
        } catch {
          return null;
        }
      })();

      if (userId) {
        setLoadingActivity(true);
        try {
          // Fetch recent activity for the logged-in user only
          const res = await issuesAPI.getUserRecentActivity(userId, 3);
          setUserRecentActivity(Array.isArray(res.recentActivity) ? res.recentActivity : []);
          // console.log("Fetched User Recent Activity:", res);
        } catch (err) {
          console.error("User recent activity error:", err);
          setUserRecentActivity([]);
        } finally {
          setLoadingActivity(false);
        }
      } else {
        setLoadingActivity(false);
      }
    }

    fetchDashboardStats();
    fetchUserRecentActivity();
  }, [user]);

  const stats = [
    {
      title: t('totalIssues'),
      value: metrics.total,
      icon: <FileText className="w-[35px] h-[35px] text-white" />
    },
    {
      title: t('open'), 
      value: metrics.open,
      icon: <Clock className="w-[35px] h-[35px] text-white" />
    },
    {
      title: t('inProgress'),
      value: metrics.inProgress, 
      icon: <RefreshCw className="w-[35px] h-[35px] text-white" />
    },
    {
      title: t('resolved'),
      value: metrics.resolved,
      icon: <CheckCircle className="w-[35px] h-[35px] text-white" />
    }
  ];

  const defaultActivity = [
    {
      title: t('noRecentIssuesFound'),
      time: t('startByReportingIssue')
    }
  ];

  const recentActivity = userRecentActivity.length > 0 
    ? userRecentActivity 
    : defaultActivity;
  
  // console.log("Recent Activities: ", recentActivity);

  const navigate = useNavigate();

  const handleReportIssue = () => {
    navigate("/report");
  };

  const handleViewComplaints = () => {
    navigate("/complaints");
  };

  const handleIssueMap = () => {
    navigate("/maps");
  };

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto">
        {/* Page Title */}
        <h1 className="text-white text-2xl sm:text-3xl lg:text-[40px] font-bold mb-8 sm:mb-12">
          {user?.fullName ? `${t('welcomeBackUser')}, ${user.fullName}!` : t('dashboard')}
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="xl:col-span-2">
            <h2 className="text-white text-xl sm:text-2xl lg:text-[36px] font-bold mb-6">
              {t('myRecentIssues')}
            </h2>
            <div className="border border-white/30 rounded-cs-card bg-background p-6 min-h-[387px]">
              {/* Add Button */}
              <div className="flex items-center mb-6">
                <button
                  className="w-12 h-12 rounded-full bg-cs-blue-primary flex items-center justify-center focus:outline-none"
                  onClick={handleReportIssue}
                  title={t('reportNewIssue')}
                >
                  <Plus className="w-7 h-7 text-white" />
                </button>
              </div>

              {/* Activity List */}
              <div className="space-y-0">
                {loadingActivity ? (
                  <div className="py-6 text-center">
                    <div className="text-white text-xl font-thin">{t('loadingRecentIssues')}</div>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="border-b border-white/30 last:border-b-0 py-6">
                      <div className="text-white text-[32px] font-light mb-2">
                        {activity.title || t('noRecentIssuesFound')}
                      </div>
                      <div className="text-white text-xl font-thin">
                        {activity.createdAt 
                          ? new Date(activity.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : activity.time || t('startByReportingIssue')
                        }
                      </div>
                      {activity.category && (
                        <div className="text-cs-blue-secondary text-lg font-normal mt-1">
                          {t('categoryLabel')}: {tCategory(activity.category)}
                        </div>
                      )}
                      {activity.status && (
                        <div className="text-white/70 text-lg font-normal mt-1">
                          {t('statusLabel')}: {tStatus(activity.status)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-white text-xl sm:text-2xl lg:text-[36px] font-bold mb-6">
              {t('quickActions')}
            </h2>
            <div className="space-y-4">
              <QuickAction
                title={t('reportNewIssue')}
                icon={<Plus className="w-7 h-7 text-white" />}
                onClick={handleReportIssue}
                primary
              />
              <QuickAction
                title={t('viewAllComplaints')}
                icon={<Eye className="w-7 h-7 text-white" />}
                onClick={handleViewComplaints}
              />
              <QuickAction
                title={t('issueMap')}
                icon={<Map className="w-7 h-7 text-white" />}
                onClick={handleIssueMap}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
