import React, { useState } from "react";

const AdminSetup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    // ✅ Save credentials securely (for demo: localStorage)
    localStorage.setItem("adminUsername", username);
    localStorage.setItem("adminPassword", password);

    alert("✅ Admin credentials saved successfully!");
    window.location.href = "/admin-login"; // Redirect to login page
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h2>Setup Admin Account</h2>
      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Set Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
          }}
        />
        <input
          type="password"
          placeholder="Set Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
          }}
        />
        <button type="submit" style={{ padding: "10px", width: "100%" }}>
          Save
        </button>
      </form>
    </div>
  );
};

export default AdminSetup;
