import React, { useState } from "react";

const ReportGenerator: React.FC = () => {
  const [reply, setReply] = useState("");

  const handleSubmit = () => {
    if (!reply) {
      alert("Please write a reply before submitting.");
      return;
    }
    alert("Reply submitted: " + reply);
    setReply("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Report Generator</h2>
      <textarea
        placeholder="Write reply for complaint..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        style={{ width: "100%", height: "100px", marginBottom: "10px", padding: "8px" }}
      />
      <br />
      <button onClick={handleSubmit}>Submit Reply</button>
    </div>
  );
};

export default ReportGenerator;
