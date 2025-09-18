import React from "react";
import { useNavigate } from "react-router-dom";

const Admindashboard = () => {
  const navigate = useNavigate();

  const totalIssues = 25;
  const totalComplaints = 10;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ background: "#f4f4f4", padding: "20px", borderRadius: "8px" }}>
          <h3>Total Issues</h3>
          <p>{totalIssues}</p>
        </div>
        <div style={{ background: "#f4f4f4", padding: "20px", borderRadius: "8px" }}>
          <h3>Total Complaints</h3>
          <p>{totalComplaints}</p>
        </div>
      </div>

      <button onClick={() => navigate("/complaints")}>Go to Complaints</button>
      <button onClick={() => navigate("/report")}>Go to Report Generator</button>
    </div>
  );
};

export default Admindashboard;
