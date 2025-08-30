import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
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
   <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
    {/* ✅ Centered login form */}
      <div className="flex flex-1 items-center justify-center">
       
      <form
        onSubmit={handleRegister}
        className="bg-[#111827] p-10 rounded-2xl shadow-lg w-[380px] border border-white/10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>
      <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full p-2 border rounded-lg bg-background text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
        
         <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Username</label>
         <input
          type="text"
          placeholder="Choose your username"
          className="w-full p-2 border rounded-lg bg-background text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Username</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded-lg bg-background text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>


      <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Phone Number (Optional)</label>
       <input
        type="text"
        placeholder="Enter your phone number"
        value={""}
        onChange={() => {}} 
        className="w-full p-2 border rounded-lg bg-background text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"

       />
      </div>


      <div className="mb-4">
        <label className="block text-sm mb-1 text-white/70">Password</label>  
        <input
          type="password"
          placeholder="Create a password"
          className="w-full p-2 border rounded-lg bg-background text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-4">

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
        >
          Register
        </button>
          </div>

       <p className="mt-4 text-center text-sm text-white">
  Already have an account?{" "}
  <span
    onClick={() => navigate("/login")}
    className="text-blue-400 underline cursor-pointer"
  >
    Login
  </span>
</p>

      </form>
    </div>
    </div>
  );
}
