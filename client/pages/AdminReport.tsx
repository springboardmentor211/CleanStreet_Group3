import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

interface Complaint {
  id: number;
  reporter: string;
  department: string;
  status: string;
  priority: string;
  date: string;
  resolutionTime?: number; // in hours
}

const dummyComplaints: Complaint[] = [
  { id: 1, reporter: "John", department: "Roads", status: "Pending", priority: "High", date: "2025-09-20", resolutionTime: 0 },
  { id: 2, reporter: "Priya", department: "Water", status: "Resolved", priority: "Medium", date: "2025-09-19", resolutionTime: 24 },
  { id: 3, reporter: "Rahul", department: "Garbage", status: "Escalated", priority: "High", date: "2025-09-18", resolutionTime: 48 },
  { id: 4, reporter: "Aisha", department: "Streetlights", status: "Resolved", priority: "Low", date: "2025-09-17", resolutionTime: 12 },
  { id: 5, reporter: "Vijay", department: "Roads", status: "Pending", priority: "High", date: "2025-09-16", resolutionTime: 0 },
  { id: 6, reporter: "Sita", department: "Water", status: "Resolved", priority: "Medium", date: "2025-09-15", resolutionTime: 36 },
  { id: 7, reporter: "Meena", department: "Garbage", status: "Resolved", priority: "Low", date: "2025-09-14", resolutionTime: 20 },
  { id: 8, reporter: "Vikram", department: "Roads", status: "Escalated", priority: "High", date: "2025-09-13", resolutionTime: 72 },
];

function getMetrics(complaints: Complaint[]) {
  const total = complaints.length;
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  let totalResolutionTime = 0;
  let resolvedCount = 0;
  const dailyCounts: Record<string, number> = {};

  complaints.forEach(c => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    byDepartment[c.department] = (byDepartment[c.department] || 0) + 1;
    dailyCounts[c.date] = (dailyCounts[c.date] || 0) + 1;
    if (c.status === "Resolved" && c.resolutionTime) {
      totalResolutionTime += c.resolutionTime;
      resolvedCount++;
    }
  });

  const avgResolutionTime = resolvedCount ? (totalResolutionTime / resolvedCount) : 0;

  return { total, byStatus, byPriority, byDepartment, dailyCounts, avgResolutionTime };
}

export default function AdminReport() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState<any>({});

  useEffect(() => {
    setComplaints(dummyComplaints);
    setMetrics(getMetrics(dummyComplaints));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Report</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p>Total Complaints: <span className="font-bold">{metrics.total}</span></p>
        <p>Average Resolution Time: <span className="font-bold">{metrics.avgResolutionTime?.toFixed(1)} hrs</span></p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Complaints by Status</h3>
          <Pie data={{
            labels: Object.keys(metrics.byStatus || {}),
            datasets: [{
              data: Object.values(metrics.byStatus || {}),
              backgroundColor: ["#fbbf24", "#34d399", "#f87171", "#60a5fa"],
            }],
          }} />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Complaints by Priority</h3>
          <Bar data={{
            labels: Object.keys(metrics.byPriority || {}),
            datasets: [{
              label: "Count",
              data: Object.values(metrics.byPriority || {}),
              backgroundColor: ["#f87171", "#fbbf24", "#34d399"],
            }],
          }} />
        </div>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Complaints by Department</h3>
        <Bar data={{
          labels: Object.keys(metrics.byDepartment || {}),
          datasets: [{
            label: "Count",
            data: Object.values(metrics.byDepartment || {}),
            backgroundColor: ["#60a5fa", "#fbbf24", "#f87171", "#34d399", "#a78bfa"],
          }],
        }} />
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Trends Over Time (Daily)</h3>
        <Line data={{
          labels: Object.keys(metrics.dailyCounts || {}),
          datasets: [{
            label: "Complaints",
            data: Object.values(metrics.dailyCounts || {}),
            borderColor: "#6366f1",
            backgroundColor: "#a5b4fc",
            fill: true,
          }],
        }} />
      </div>
    </div>
  );
}
