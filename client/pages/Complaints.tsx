
import React, { useState } from "react";

const Complaints: React.FC = () => {
  // Dummy complaints
  const complaints = [
    "Complaint 1: Street light not working",
    "Complaint 2: Garbage collection delayed",
    "Complaint 3: Water leakage",
    "Complaint 4: Noise pollution",
    "Complaint 5: Road damage",
    "Complaint 6: Electricity issue",
    "Complaint 7: Public toilet maintenance",
    "Complaint 8: Illegal parking",
    "Complaint 9: Drainage blockage",
    "Complaint 10: Stray animals issue"
  ];

  const [page, setPage] = useState(1);
  const complaintsPerPage = 5;
  const startIndex = (page - 1) * complaintsPerPage;
  const paginatedComplaints = complaints.slice(startIndex, startIndex + complaintsPerPage);

  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Complaints List</h2>
      {paginatedComplaints.map((complaint, index) => (
        <div key={index}>
          <input
            type="radio"
            name="complaint"
            value={complaint}
            onChange={() => setSelectedComplaint(complaint)}
            checked={selectedComplaint === complaint}
          />
          {complaint}
        </div>
      ))}

      {/* Pagination */}
      <div style={{ marginTop: "20px" }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}> Page {page} </span>
        <button disabled={startIndex + complaintsPerPage >= complaints.length} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Complaints;
