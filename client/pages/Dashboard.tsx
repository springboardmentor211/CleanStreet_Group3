import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { issuesAPI } from "@/lib/api";
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
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    recentActivity: [],
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const res = await issuesAPI.getDashboardStats();
        setMetrics({
          total: res.total || 0,
          pending: res.pending || 0,
          inProgress: res.inProgress || 0,
          resolved: res.resolved || 0,
          recentActivity: Array.isArray(res.recentActivity) ? res.recentActivity : [],
        });
        console.log("Fetched Dashboard Metrics:", res);
      } catch (err) {
        console.error("Dashboard metrics error:", err);
      }
    }
    fetchDashboardStats();
  }, []);

  const stats = [
    {
      title: "Total Issues",
      value: metrics.total,
      icon: <FileText className="w-[35px] h-[35px] text-white" />
    },
    {
      title: "Pending", 
      value: metrics.pending,
      icon: <Clock className="w-[35px] h-[35px] text-white" />
    },
    {
      title: "In Progress",
      value: metrics.inProgress, 
      icon: <RefreshCw className="w-[35px] h-[35px] text-white" />
    },
    {
      title: "Resolved",
      value: metrics.resolved,
      icon: <CheckCircle className="w-[35px] h-[35px] text-white" />
    }
  ];

  const defaultActivity = [
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
  ];

  const recentActivity = metrics.recentActivity && Array.isArray(metrics.recentActivity)
    ? metrics.recentActivity
    : defaultActivity;
  
  console.log("Recent Activities: ",recentActivity);

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
          Dashboard
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
              Recent Activity
            </h2>
            <div className="border border-white/30 rounded-cs-card bg-background p-6 min-h-[387px]">
              {/* Add Button */}
              <div className="flex items-center mb-6">
                <button
                  className="w-12 h-12 rounded-full bg-cs-blue-primary flex items-center justify-center focus:outline-none"
                  onClick={handleReportIssue}
                  title="Report New Issue"
                >
                  <Plus className="w-7 h-7 text-white" />
                </button>
              </div>

              {/* Activity List */}
              <div className="space-y-0">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-b border-white/30 last:border-b-0 py-6">
                    <div className="text-white text-[32px] font-light mb-2">
                      {activity.title}
                    </div>
                    
                  </div>
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
