import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Replace with real registration logic (API call)
    if (name && email && password) {
      alert("Registration successful!");
      // ✅ Redirect after successful register
      navigate("/dashboard");
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form
        onSubmit={handleRegister}
        className="bg-cs-blue-secondary p-8 rounded-lg shadow-lg w-96 border border-white/20"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded bg-background text-white placeholder:text-white/70 border-white/30"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>

        <p
          className="mt-4 text-center text-blue-600 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}
