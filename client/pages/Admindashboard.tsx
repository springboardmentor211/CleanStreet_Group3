import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { 
  FileText, Clock, RefreshCw, CheckCircle, AlertTriangle, 
  Eye, Trash, Download, Plus, Users, Bell
} from "lucide-react";

interface Complaint {
  id: number;
  reporter: string;
  department: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved" | "Escalated";
  priority: "High" | "Medium" | "Low";
  date: string;
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const complaintsPerPage = 5;

  // ✅ Load Dummy Data for UI Testing
  useEffect(() => {
    const dummyData: Complaint[] = [
      { id: 101, reporter: "John", department: "Roads", description: "Pothole near school needs urgent fix", status: "Pending", priority: "High", date: "2025-09-23" },
      { id: 102, reporter: "Priya", department: "Water", description: "Broken pipeline causing water wastage", status: "In Progress", priority: "Medium", date: "2025-09-22" },
      { id: 103, reporter: "Rahul", department: "Garbage", description: "Garbage not cleared for 3 days", status: "Escalated", priority: "High", date: "2025-09-21" },
      { id: 104, reporter: "Aisha", department: "Streetlights", description: "Streetlight not working", status: "Resolved", priority: "Low", date: "2025-09-20" },
      { id: 105, reporter: "Vijay", department: "Roads", description: "Manhole cover missing, risky for vehicles", status: "Pending", priority: "High", date: "2025-09-19" },
      { id: 106, reporter: "Sita", department: "Water", description: "Low water pressure in sector 5", status: "Pending", priority: "Medium", date: "2025-09-18" },
    ];
    setComplaints(dummyData);
    setFilteredComplaints(dummyData);
  }, []);

  // ✅ Apply Filters + Search
  useEffect(() => {
    let data = complaints;
    if (statusFilter !== "All") data = data.filter(c => c.status === statusFilter);
    if (searchQuery.trim() !== "")
      data = data.filter(c =>
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toString().includes(searchQuery)
      );
    setFilteredComplaints(data);
    setCurrentPage(1);
  }, [statusFilter, searchQuery, complaints]);

  const indexOfLast = currentPage * complaintsPerPage;
  const indexOfFirst = indexOfLast - complaintsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const escalated = complaints.filter(c => c.status === "Escalated").length;

  const handleCardClick = (status: string) => {
    setStatusFilter(status === "All" ? "All" : status);
  };

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* ✅ Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          {[
            { title: "Total", value: total, icon: <FileText />, filter: "All" },
            { title: "Pending", value: pending, icon: <Clock />, filter: "Pending" },
            { title: "In Progress", value: inProgress, icon: <RefreshCw />, filter: "In Progress" },
            { title: "Resolved", value: resolved, icon: <CheckCircle />, filter: "Resolved" },
            { title: "Escalated", value: escalated, icon: <AlertTriangle />, filter: "Escalated" },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-background border border-white/30 rounded-lg p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleCardClick(card.filter)}
            >
              <div className="flex items-center space-x-3">
                <div>{card.icon}</div>
                <div className="text-white">
                  <div className="text-lg">{card.title}</div>
                  <div className="text-2xl font-bold">{card.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Filters + Search */}
        <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
          <select
            className="bg-background border p-2 text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>

          <input
            type="text"
            className="bg-background border p-2 text-white"
            placeholder="Search by ID or keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ✅ Complaints Table */}
        <table className="min-w-full border border-white/30 rounded-lg">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2">ID</th>
              <th className="border p-2">Reporter</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {currentComplaints.length > 0 ? (
              currentComplaints.map((c) => (
                <tr key={c.id} className="text-white">
                  <td className="border p-2">{c.id}</td>
                  <td className="border p-2">{c.reporter}</td>
                  <td className="border p-2">{c.department}</td>
                  <td className="border p-2">{c.description.slice(0, 30)}...</td>
                  <td className="border p-2">{c.status}</td>
                  <td className="border p-2">{c.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 p-4">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Pagination */}
        <div className="flex justify-between mt-4 text-white">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </Layout>
  );
}

