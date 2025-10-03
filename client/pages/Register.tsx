import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to new AuthPage for better UX
  useEffect(() => {
    navigate("/auth?mode=register");
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register({
        username,
        fullName,
        email,
        password,
        phoneNumber
      });
      // console.log("Registration successful:", response);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
    {/* ✅ Centered login form */}
      <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="bg-[#111827] p-10 rounded-2xl shadow-lg w-[380px] border border-white/10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>
        

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4">
            {error}
          </div>
        )}

         <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Username</label>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
       </div>

       <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full p-2 border rounded-lg bg-background text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        </div>

        <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Email</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        </div>

        <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Phone Number(optional)</label>
        <input
          type="tel"
          placeholder="Phone Number (optional)"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        </div>

        <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Password</label>
        <input
          type="password"
          placeholder="Create a password"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        </div>
        <div className="mb-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        </div>

        <p
          className="mt-4 text-center text-blue-600 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  </div>
  
  );
}
