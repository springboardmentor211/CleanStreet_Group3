import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  Plus, 
  Eye, 
  Map
} from "lucide-react";

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="border border-white/30 rounded-lg bg-[#0b0e1a] p-4 flex flex-col items-center justify-center">
      <div className="mb-2">{icon}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
      <div className="text-white text-lg font-light text-center">{title}</div>
    </div>
  );
}

function QuickAction({ title, icon, onClick, primary = false }: { title: string; icon: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 rounded-xl border flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity ${
        primary ? "bg-blue-600 border-black" : "bg-[#0b0e1a] border-white/30"
      }`}
    >
      {icon}
      <span className="text-white text-lg font-light">{title}</span>
    </button>
  );
}

function ActivityItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="border-b border-white/30 last:border-b-0 py-3">
      <div className="text-white text-lg font-light">{title}</div>
      <div className="text-white text-sm font-thin">{time}</div>
    </div>
  );
}

export default function Dashboard() {
  const statsArray = [
    { title: "Total Issues", value: 5, icon: <FileText className="w-6 h-6 text-white" /> },
    { title: "Pending", value: 2, icon: <Clock className="w-6 h-6 text-white" /> },
    { title: "In Progress", value: 1, icon: <RefreshCw className="w-6 h-6 text-white" /> },
    { title: "Resolved", value: 2, icon: <CheckCircle className="w-6 h-6 text-white" /> },
  ];

  const recentActivity = [
    { title: "Pothole on Main Street resolved", time: "2 hours ago" },
    { title: "Phulera streetlight issue resolved", time: "8 hours ago" },
    { title: "Garbage dump complaint updated", time: "11 hours ago" },
  ];

  const handleReportIssue = () => alert("Report New Issue clicked!");
  const handleViewComplaints = () => alert("View All Complaints clicked!");
  const handleIssueMap = () => alert("Issue Map clicked!");

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#050811] flex flex-col">
      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4">
        <h1 className="text-white text-xl font-bold">Clean Street</h1>
        <div className="flex space-x-6 text-white text-sm">
          <span className="cursor-pointer text-blue-400">Dashboard</span>
          <span className="cursor-pointer">Report Issues</span>
          <span className="cursor-pointer">View Complaints</span>
        </div>
        <button className="bg-red-700 px-3 py-1 rounded text-white text-sm">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-6 flex flex-col max-w-screen-lg mx-auto">
        {/* Title */}
        <h2 className="text-white text-2xl font-bold mb-6">Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statsArray.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6 flex-1">
          {/* Recent Activity */}
          <div className="col-span-2 flex flex-col">
            <h2 className="text-white text-xl font-bold mb-3">Recent Activity</h2>
            <div className="border border-white/30 rounded-lg bg-[#0b0e1a] p-4 flex-1">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} title={activity.title} time={activity.time} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold mb-3">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction title="Report New Issue" icon={<Plus className="w-5 h-5 text-white" />} onClick={handleReportIssue} primary />
              <QuickAction title="View All Complaints" icon={<Eye className="w-5 h-5 text-white" />} onClick={handleViewComplaints} />
              <QuickAction title="Issue Map" icon={<Map className="w-5 h-5 text-white" />} onClick={handleIssueMap} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
