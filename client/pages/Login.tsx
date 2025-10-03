import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";
import { AuthProvider, useAuth } from "@/lib/auth-context";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated, loginSuccess, loginError, userInfo } = useAuth();
  
  // Redirect to new AuthPage for better UX
  useEffect(() => {
    navigate("/auth?mode=login");
  }, [navigate]);

  // Redirect based on user role if already authenticated
  if (isAuthenticated) {
    if (userInfo?.role === 'admin') {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Check for successful login and redirect based on role
      setTimeout(() => {
        const currentUserInfo = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUserInfo.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      {/* ✅ Centered login form */}
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleLogin}
            className="bg-[#111827] p-10 rounded-2xl shadow-lg w-[380px] border border-white/10">
          {/* Logo inside card */}
          <div className="flex justify-center mb-4">
               <svg
                width="61"
                height="51"
                viewBox="0 0 61 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[61px] h-[51px]"
              >
                <g clipPath="url(#clip0_150_442)">
                  <mask
                    id="mask0_150_442"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="61"
                    height="51"
                  >
                    <path d="M61 0H0V51H61V0Z" fill="white" />
                  </mask>
                  <g mask="url(#mask0_150_442)">
                    <path
                      d="M41.2822 11.9531C39.1222 11.9531 36.9634 12.1523 34.8629 12.5508L35.965 3.41162C36.0692 2.54004 35.7267 1.68041 35.0267 1.03295C34.3125 0.373535 33.2998 0 32.2275 0C32.0637 0 31.9148 0.0124512 31.751 0.0249023C21.8027 1.0708 14.2969 8.14307 14.2969 16.4903C14.2969 18.2962 14.5352 20.1012 15.0117 21.8573L4.08057 20.9279H3.99121L3.70766 20.918C2.65028 20.918 1.63699 21.304 0.937638 21.9639C0.223032 22.6512 -0.104617 23.5576 0.0294165 24.4541C1.28039 32.7715 9.73938 39.0469 19.7234 39.0469C21.8834 39.0469 24.0422 38.8477 26.1427 38.4492L25.0406 47.5884C24.9364 48.46 25.2789 49.3196 25.9789 49.967C26.8128 50.7266 28.034 51.1006 29.2552 50.9761C39.2035 49.9302 46.7093 42.8579 46.7093 34.5107C46.7093 32.7047 46.471 30.8998 45.9945 29.1437L56.9256 30.0651H57.015L57.2979 30.0775C58.3553 30.0775 59.3686 29.6916 60.0537 29.0316C60.7834 28.3468 61.111 27.4379 60.977 26.5414C59.7252 18.2285 51.2662 11.9531 41.2822 11.9531ZM40.5436 25.49L41.5711 27.8687C42.4498 29.8858 42.8972 32.127 42.8972 34.5176C42.8972 41.2542 36.821 46.9688 28.8386 47.9151L30.522 33.8901L27.677 34.7492C25.2644 35.4838 22.5837 35.8579 19.7243 35.8579C11.6668 35.8579 4.83175 30.7778 3.69991 24.104L20.4749 25.5115L19.3127 23.1393C18.5502 21.1172 18.0021 18.876 18.0021 16.4853C18.0021 9.76172 24.0342 4.0541 32.0488 3.19746L30.4881 17.1129L33.3332 16.2538C35.7458 15.5191 38.4264 15.1451 41.2858 15.1451C49.3433 15.1451 56.1784 20.2252 57.3102 26.899L40.5436 25.49ZM30.5 23.0197C28.925 23.0197 27.6406 24.0935 27.6406 25.4104C27.6406 26.7272 28.925 27.801 30.5 27.801C32.075 27.801 33.3594 26.7272 33.3594 25.4104C33.3594 24.0935 32.0727 23.0197 30.5 23.0197Z"
                      fill="#2759C5"
                    />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_150_442">
                    <rect width="61" height="51" rx="25.5" fill="white" />
                  </clipPath>
                </defs>
              </svg>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Clean Street</h2>
         <p className="text-center text-white/60 mb-6">
            Enter your credentials to Sign In
          </p>

          {/* Error Message */}
          {(error || loginError) && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4">
              {error || loginError}
            </div>
          )}

          {/* Email */}
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 mb-4 rounded bg-background border border-white/30 text-white placeholder:text-white/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label className="block text-sm mb-1">Password</label>
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full p-2 rounded bg-background border border-white/30 text-white placeholder:text-white/50 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/70 hover:text-white flex items-center"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye-off SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A3 3 0 0013.41 13.413M9.88 5.177A8.967 8.967 0 0112 5c5.523 0 10 4.477 10 10a9.96 9.96 0 01-3.11 6.16M6.53 6.53A9.96 9.96 0 002 15c0 .94.13 1.85.37 2.71"/></svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 100-6 3 3 0 000 6z"/></svg>
              )}
            </span>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm mb-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="accent-blue-600" />
              <span>Remember me</span>
            </label>
            <span
              className="text-blue-400 cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          {/* Sign in */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Register */}
           <p className="mt-4 text-center text-sm text-white">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-400 underline cursor-pointer"
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
