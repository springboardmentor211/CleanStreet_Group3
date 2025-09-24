import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [mode, setMode] = useState<
    "login" | "resetVerify" | "resetNew" | "forgotCredentials"
  >("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [verifyUsername, setVerifyUsername] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem("adminUsername");
    const savedPassword = localStorage.getItem("adminPassword");

    if (!savedUsername || !savedPassword) {
      setMode("resetNew"); // No admin set → open setup
    }
  }, []);

  // ✅ LOGIN FUNCTION
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUsername = localStorage.getItem("adminUsername");
    const savedPassword = localStorage.getItem("adminPassword");

    if (!savedUsername || !savedPassword) {
      alert("No admin credentials found. Please set up first.");
      setMode("resetNew");
      return;
    }

    if (username === savedUsername && password === savedPassword) {
      navigate("/admin/dashboard");
    } else {
      alert("Invalid username or password!");
    }
  };

  // ✅ VERIFY OLD CREDENTIALS BEFORE RESET
  const handleVerifyOldCredentials = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUsername = localStorage.getItem("adminUsername");
    const savedPassword = localStorage.getItem("adminPassword");

    if (username === savedUsername && password === savedPassword) {
      setMode("resetNew"); // go to setup new credentials
      setUsername("");
      setPassword("");
    } else {
      alert("❌ Wrong old credentials!");
    }
  };

  // ✅ SAVE NEW ADMIN CREDENTIALS
  const handleSaveNewCredentials = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername || !newPassword) {
      alert("Please enter both username and password.");
      return;
    }

    localStorage.setItem("adminUsername", newUsername);
    localStorage.setItem("adminPassword", newPassword);

    alert("✅ New admin credentials saved successfully!");
    setMode("login");
    setNewUsername("");
    setNewPassword("");
  };

  // ✅ FORGOT CREDENTIALS - VERIFY ONLY USERNAME
  const handleVerifyForgotUsername = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUsername = localStorage.getItem("adminUsername");
    if (!savedUsername) {
      alert("No admin account exists.");
      setMode("resetNew");
      return;
    }

    if (verifyUsername === savedUsername) {
      alert("✅ Username verified. Please set new username and password.");
      setMode("resetNew");
      setVerifyUsername("");
    } else {
      alert("❌ Incorrect username!");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>Admin Login</h2>

      {/* ✅ LOGIN FORM */}
      {mode === "login" && (
        <>
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

          <button
            onClick={() => setMode("resetVerify")}
            style={{
              marginTop: "15px",
              padding: "10px",
              width: "100%",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reset Admin Credentials
          </button>
        </>
      )}

      {/* ✅ VERIFY OLD CREDENTIALS */}
      {mode === "resetVerify" && (
        <>
          <h3>Verify Old Admin Credentials</h3>
          <form onSubmit={handleVerifyOldCredentials}>
            <input
              type="text"
              placeholder="Old Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <input
              type="password"
              placeholder="Old Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <button type="submit" style={{ padding: "10px", width: "100%" }}>
              Verify & Continue
            </button>
          </form>

          <button
            onClick={() => setMode("forgotCredentials")}
            style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Forgot Credentials?
          </button>

          <button
            onClick={() => setMode("login")}
            style={{ marginTop: "10px", padding: "10px", width: "100%" }}
          >
            Cancel
          </button>
        </>
      )}

      {/* ✅ FORGOT CREDENTIALS - VERIFY ONLY USERNAME */}
      {mode === "forgotCredentials" && (
        <>
          <h3>Forgot Credentials</h3>
          <form onSubmit={handleVerifyForgotUsername}>
            <input
              type="text"
              placeholder="Enter Username"
              value={verifyUsername}
              onChange={(e) => setVerifyUsername(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "10px",
                padding: "8px",
              }}
            />
            <button type="submit" style={{ padding: "10px", width: "100%" }}>
              Verify Username
            </button>
          </form>

          <button
            onClick={() => setMode("resetVerify")}
            style={{ marginTop: "10px", padding: "10px", width: "100%" }}
          >
            Back
          </button>
        </>
      )}

      {/* ✅ SET NEW CREDENTIALS */}
      {mode === "resetNew" && (
        <>
          <h3>Set New Admin Credentials</h3>
          <form onSubmit={handleSaveNewCredentials}>
            <input
              type="text"
              placeholder="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <button type="submit" style={{ padding: "10px", width: "100%" }}>
              Save New Credentials
            </button>
          </form>

          <button
            onClick={() => setMode("login")}
            style={{ marginTop: "10px", padding: "10px", width: "100%" }}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default AdminLogin;
