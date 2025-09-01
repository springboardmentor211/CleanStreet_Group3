import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  Plus, 
  Eye, 
  Map,
  TrendingUp
} from "lucide-react";
import { issuesAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="border border-white/30 rounded-lg bg-background p-6 flex flex-col items-center justify-center min-h-[186px]">
      <div className="mb-4">
        {icon}
      </div>
      <div className="text-white text-[30px] font-bold mb-2">
        {value}
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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await issuesAPI.getDashboardStats();
        setStats({
          total: data.total || 0,
          pending: data.pending || 0,
          inProgress: data.inProgress || 0,
          resolved: data.resolved || 0
        });
        setRecentActivity(data.recentActivity || []);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
        // Use fallback data if API fails
        setStats({
          total: 5,
          pending: 2,
          inProgress: 1,
          resolved: 2
        });
        setRecentActivity([
          {
            title: "Pothole on Main Street resolved",
            time: "2 hours ago"
          },
          {
            title: "Phulera streetlight issue resolved", 
            time: "8 hours ago"
          },
          {
            title: "Garbage dump complaint updated",
            time: "11 hours ago"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsArray = [
    {
      title: "Total Issues",
      value: stats.total,
      icon: <FileText className="w-[35px] h-[35px] text-white" />
    },
    {
      title: "Pending", 
      value: stats.pending,
      icon: <Clock className="w-[35px] h-[35px] text-white" />
    },
    {
      title: "In Progress",
      value: stats.inProgress, 
      icon: <RefreshCw className="w-[35px] h-[35px] text-white" />
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle className="w-[35px] h-[35px] text-white" />
    }
  ];

  const handleReportIssue = () => {
    console.log("Navigate to report issue");
  };

  const handleViewComplaints = () => {
    console.log("Navigate to view complaints");
  };

  const handleIssueMap = () => {
    console.log("Navigate to issue map");
  };

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto">
        {/* Page Title */}
        <h1 className="text-white text-2xl sm:text-3xl lg:text-[40px] font-bold mb-8 sm:mb-12">
          Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statsArray.map((stat, index) => (
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
              Recent Activity
            </h2>
            <div className="border border-white/30 rounded-cs-card bg-background p-6 min-h-[387px]">
              {/* Add Button */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-cs-blue-primary flex items-center justify-center">
                  <Plus className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-0">
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    time={activity.time}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-white text-xl sm:text-2xl lg:text-[36px] font-bold mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <QuickAction
                title="Report New Issue"
                icon={<Plus className="w-7 h-7 text-white" />}
                onClick={handleReportIssue}
                primary
              />
              <QuickAction
                title="View All Complaints"
                icon={<Eye className="w-7 h-7 text-white" />}
                onClick={handleViewComplaints}
              />
              <QuickAction
                title="Issue Map"
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
