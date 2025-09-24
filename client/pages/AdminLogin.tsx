import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUsername = localStorage.getItem("adminUsername");
    const savedPassword = localStorage.getItem("adminPassword");

    if (!savedUsername || !savedPassword) {
      alert("No admin account found. Please set up credentials first.");
      window.location.href = "/admin-setup";
      return;
    }

    if (username === savedUsername && password === savedPassword) {
      navigate("/dashboard");
    } else {
      alert("Invalid username or password!");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "10px", width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
