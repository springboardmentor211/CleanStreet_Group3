import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { FileText, Clock, RefreshCw, CheckCircle, AlertTriangle, X, Users, Bell } from "lucide-react";

interface Comment {
  text: string;
  timestamp: string;
}

interface Complaint {
  id: number;
  reporter: string;
  department: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved" | "Escalated" | "Assign";
  priority: "High" | "Medium" | "Low";
  date: string;
  assignedTo?: string;
  reply?: string;
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminReply, setAdminReply] = useState("");

  useEffect(() => {
    setComplaints([
      { id: 101, reporter: "John", department: "Roads", description: "Pothole near school needs urgent fix", status: "Pending", priority: "High", date: "2025-09-23", comments: [] },
      { id: 102, reporter: "Priya", department: "Water", description: "Broken pipeline causing water wastage", status: "In Progress", priority: "Medium", date: "2025-09-22", comments: [] },
      { id: 103, reporter: "Rahul", department: "Garbage", description: "Garbage not cleared for 3 days", status: "Escalated", priority: "High", date: "2025-09-21", comments: [] },
      { id: 104, reporter: "Aisha", department: "Streetlights", description: "Streetlight not working", status: "Resolved", priority: "Low", date: "2025-09-20", comments: [] },
      { id: 105, reporter: "Neha", department: "Roads", description: "Fallen tree blocking road", status: "Pending", priority: "High", date: "2025-09-25", comments: [] },
      { id: 106, reporter: "Suresh", department: "Electricity", description: "Transformer sparking", status: "Assign", priority: "Medium", date: "2025-09-24", comments: [] },
      { id: 107, reporter: "Meena", department: "Water", description: "No water supply in block B", status: "Escalated", priority: "High", date: "2025-09-25", comments: [] },
      { id: 108, reporter: "Vikram", department: "Sanitation", description: "Overflowing dustbin", status: "Resolved", priority: "Low", date: "2025-09-25", comments: [] },
    ]);
  }, []);

  // Quick Actions
  const updateStatus = (id: number, newStatus: Complaint["status"]) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const assignTo = (id: number, user: string) => {
    setComplaints(prev => prev.map(c =>
      c.id === id
        ? { ...c, assignedTo: user, status: c.status === "In Progress" ? "Assign" : c.status }
        : c
    ));
  };

  const handleAdminReply = () => {
    if (!adminReply.trim() || !selectedComplaint) return;
    setComplaints(prev =>
      prev.map(c => c.id === selectedComplaint.id ? { ...c, reply: adminReply.trim() } : c)
    );
    setSelectedComplaint(prev => prev ? { ...prev, reply: adminReply.trim() } : prev);
    setAdminReply("");
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Complaint["status"]) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    updateStatus(id, newStatus);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Filters for Action-Centered cards
  const urgentComplaints = complaints.filter(c => c.status === "Escalated" || c.priority === "High");
  const newToday = complaints.filter(c => c.date === new Date().toISOString().split("T")[0]);
  const unassigned = complaints.filter(c => !c.assignedTo);

  const statuses: Complaint["status"][] = ["Pending", "Assign", "Escalated", "Resolved"];
  const statusColors: Record<Complaint["status"], string> = {
    "Pending": "text-yellow-400",
    "In Progress": "text-blue-400",
    "Assign": "text-blue-400",
    "Escalated": "text-red-500",
    "Resolved": "text-green-500",
  };

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto p-4">
        <h1 className="text-white text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Action-Centered Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-white">
            <div className="flex items-center justify-between text-white mb-2">
              <div className="flex items-center space-x-2 bg-red-100 rounded px-2 py-1 text-red-700"><AlertTriangle /> <span>Urgent</span></div>
              <span>{urgentComplaints.length}</span>
            </div>
            {urgentComplaints.map(c => (
              <div key={c.id} className="bg-gray-700 p-2 rounded mb-1 cursor-pointer hover:bg-gray-600"
                onClick={() => setSelectedComplaint(c)}
              >
                {c.department} (ID: {c.id}, {c.priority})
              </div>
            ))}
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-white">
            <div className="flex items-center justify-between text-white mb-2">
              <div className="flex items-center space-x-2 bg-yellow-100 rounded px-2 py-1 text-yellow-700"><Bell /> <span>New Today</span></div>
              <span>{newToday.length}</span>
            </div>
            {newToday.map(c => (
              <div key={c.id} className="bg-gray-700 p-2 rounded mb-1 cursor-pointer hover:bg-gray-600"
                onClick={() => setSelectedComplaint(c)}
              >
                {c.department} (ID: {c.id})
              </div>
            ))}
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-white">
            <div className="flex items-center justify-between text-white mb-2">
              <div className="flex items-center space-x-2 bg-blue-100 rounded px-2 py-1 text-blue-700"><Users /> <span>Unassigned</span></div>
              <span>{unassigned.length}</span>
            </div>
            {unassigned.map(c => (
              <div key={c.id} className="bg-gray-700 p-2 rounded mb-1 cursor-pointer hover:bg-gray-600"
                onClick={() => setSelectedComplaint(c)}
              >
                {c.department} (ID: {c.id})
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board without extra packages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statuses.map(status => (
            <div
              key={status}
              className="bg-gray-900 p-3 rounded-lg min-h-[300px] border-2 border-white"
              onDrop={e => handleDrop(e, status)}
              onDragOver={handleDragOver}
            >
              <h2 className={`font-bold mb-2 ${statusColors[status]}`}>{status}</h2>
              {complaints.filter(c => c.status === status).map(c => (
                <div
                  key={c.id}
                  className="bg-gray-700 p-3 rounded mb-2 cursor-move hover:bg-gray-600"
                  draggable
                  onDragStart={e => handleDragStart(e, c.id)}
                  onClick={() => setSelectedComplaint(c)}
                >
                  <div className="flex justify-between text-white">
                    <span>{c.department}</span>
                    <span>{c.priority}</span>
                  </div>
                  <div className="text-gray-300 text-sm truncate">{c.description}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-[500px] relative">
              <button className="absolute top-3 right-3 text-white" onClick={() => setSelectedComplaint(null)}><X /></button>

              <h2 className="text-xl font-bold text-white mb-3">Complaint {selectedComplaint.id}</h2>
              <p className="text-gray-300"><strong>Reporter:</strong> {selectedComplaint.reporter}</p>
              <p className="text-gray-300"><strong>Department:</strong> {selectedComplaint.department}</p>
              <p className="text-gray-300"><strong>Description:</strong> {selectedComplaint.description}</p>
              <p className="text-gray-300"><strong>Status:</strong> {selectedComplaint.status}</p>
              <p className="text-gray-300"><strong>Priority:</strong> {selectedComplaint.priority}</p>
              <p className="text-gray-300"><strong>Assigned To:</strong> {selectedComplaint.assignedTo || "Unassigned"}</p>
              <p className="text-gray-300"><strong>Date:</strong> {selectedComplaint.date}</p>

              <hr className="my-4 border-gray-700" />

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button className="bg-green-600 px-3 py-1 rounded text-white" onClick={() => updateStatus(selectedComplaint.id, "Resolved")}>Mark Resolved</button>
                <button className="bg-red-600 px-3 py-1 rounded text-white" onClick={() => updateStatus(selectedComplaint.id, "Escalated")}>Escalate</button>
                <button className="bg-blue-600 px-3 py-1 rounded text-white" onClick={() => { assignTo(selectedComplaint.id, "Admin"); updateStatus(selectedComplaint.id, "Assign"); }}>Assign</button>
              </div>

              {/* Admin Reply */}
              <div>
                <h3 className="text-white font-semibold mb-2">Admin Reply</h3>
                {selectedComplaint.reply ? (
                  <p className="text-gray-300 mb-3">{selectedComplaint.reply}</p>
                ) : (
                  <p className="text-gray-500 mb-3">No reply yet.</p>
                )}
                <textarea
                  className="w-full bg-gray-800 text-white p-2 rounded mb-2"
                  placeholder="Type your reply..."
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white" onClick={handleAdminReply}>Send Reply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
