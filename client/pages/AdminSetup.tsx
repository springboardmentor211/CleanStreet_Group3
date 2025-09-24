import React, { useState, useEffect } from "react";

const AdminSetup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alreadySet, setAlreadySet] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("adminUsername");
    const savedPassword = localStorage.getItem("adminPassword");

    if (savedUsername && savedPassword) {
      setAlreadySet(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    localStorage.setItem("adminUsername", username);
    localStorage.setItem("adminPassword", password);

    alert("✅ Admin credentials saved successfully!");
    window.location.href = "/admin-login";
  };

  if (alreadySet) {
    return (
      <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
        <h2>Admin Credentials Already Set</h2>
        <p>You cannot reset credentials from here. Please log in.</p>
        <button
          onClick={() => (window.location.href = "/admin-login")}
          style={{ marginTop: "20px", padding: "10px", width: "100%" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

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
