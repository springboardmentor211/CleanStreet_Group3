import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, ArrowRight, Users, MapPin, CheckCircle, Heart } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const { login, isAuthenticated, userInfo } = useAuth();

  // Set initial form state based on query parameters
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'login') {
      setIsLogin(true);
    } else if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (userInfo?.role === 'admin') {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
    return null;
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setFullName("");
    setPhoneNumber("");
    setError("");
  };

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    resetForm();
    // Update URL to reflect the current mode
    navigate(`/auth?mode=${newMode ? 'login' : 'register'}`, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        setTimeout(() => {
          const currentUserInfo = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUserInfo.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 100);
      } else {
        if (!username || !fullName) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }
        await authAPI.register({
          username,
          fullName,
          email,
          password,
          phoneNumber
        });
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#0F1629] to-[#1A1F35] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Welcome Message with Animation */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white">
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <svg
                  width="61"
                  height="51"
                  viewBox="0 0 61 51"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[61px] h-[51px] animate-pulse"
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
                <h1 className="text-3xl font-bold">Clean Street</h1>
              </div>

              {/* Dynamic Welcome Message */}
              <div 
                key={isLogin ? 'login' : 'signup'} 
                className="animate-in slide-in-from-left duration-500"
              >
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-cs-blue-light bg-clip-text text-transparent">
                  {isLogin ? "Welcome Back!" : "Join Our Community"}
                </h2>
                <p className="text-xl text-white/80 leading-relaxed">
                  {isLogin 
                    ? "We're glad to see you again. Ready to continue making our city cleaner and safer together?"
                    : "Become a responsible citizen and help us build a cleaner, safer community for everyone."
                  }
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 animate-in slide-in-from-left duration-700 delay-100">
                  <div className="w-12 h-12 bg-cs-blue-secondary/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-cs-blue-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Report Issues</h3>
                    <p className="text-white/70">Easily report civic issues in your neighborhood</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 animate-in slide-in-from-left duration-700 delay-200">
                  <div className="w-12 h-12 bg-cs-blue-secondary/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-cs-blue-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Community Driven</h3>
                    <p className="text-white/70">Join thousands of active citizens</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 animate-in slide-in-from-left duration-700 delay-300">
                  <div className="w-12 h-12 bg-cs-blue-secondary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-cs-blue-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Track Progress</h3>
                    <p className="text-white/70">See how your reports make a real impact</p>
                  </div>
                </div>
              </div>

              {/* Motivational Quote */}
              <div className="bg-gradient-to-r from-cs-blue-primary/10 to-cs-blue-secondary/10 border border-cs-blue-secondary/20 rounded-2xl p-6 animate-in slide-in-from-left duration-700 delay-400">
                <div className="flex items-start space-x-3">
                  <Heart className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <blockquote className="text-white/90 italic">
                    "Every small action counts. Together, we can create the change we want to see in our community."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 animate-in slide-in-from-right duration-500">
              
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="lg:hidden flex justify-center mb-4">
                  <svg
                    width="61"
                    height="51"
                    viewBox="0 0 61 51"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[61px] h-[51px]"
                  >
                    <g clipPath="url(#clip0_150_442_mobile)">
                      <mask
                        id="mask0_150_442_mobile"
                        style={{ maskType: "luminance" }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="61"
                        height="51"
                      >
                        <path d="M61 0H0V51H61V0Z" fill="white" />
                      </mask>
                      <g mask="url(#mask0_150_442_mobile)">
                        <path
                          d="M41.2822 11.9531C39.1222 11.9531 36.9634 12.1523 34.8629 12.5508L35.965 3.41162C36.0692 2.54004 35.7267 1.68041 35.0267 1.03295C34.3125 0.373535 33.2998 0 32.2275 0C32.0637 0 31.9148 0.0124512 31.751 0.0249023C21.8027 1.0708 14.2969 8.14307 14.2969 16.4903C14.2969 18.2962 14.5352 20.1012 15.0117 21.8573L4.08057 20.9279H3.99121L3.70766 20.918C2.65028 20.918 1.63699 21.304 0.937638 21.9639C0.223032 22.6512 -0.104617 23.5576 0.0294165 24.4541C1.28039 32.7715 9.73938 39.0469 19.7234 39.0469C21.8834 39.0469 24.0422 38.8477 26.1427 38.4492L25.0406 47.5884C24.9364 48.46 25.2789 49.3196 25.9789 49.967C26.8128 50.7266 28.034 51.1006 29.2552 50.9761C39.2035 49.9302 46.7093 42.8579 46.7093 34.5107C46.7093 32.7047 46.471 30.8998 45.9945 29.1437L56.9256 30.0651H57.015L57.2979 30.0775C58.3553 30.0775 59.3686 29.6916 60.0537 29.0316C60.7834 28.3468 61.111 27.4379 60.977 26.5414C59.7252 18.2285 51.2662 11.9531 41.2822 11.9531ZM40.5436 25.49L41.5711 27.8687C42.4498 29.8858 42.8972 32.127 42.8972 34.5176C42.8972 41.2542 36.821 46.9688 28.8386 47.9151L30.522 33.8901L27.677 34.7492C25.2644 35.4838 22.5837 35.8579 19.7243 35.8579C11.6668 35.8579 4.83175 30.7778 3.69991 24.104L20.4749 25.5115L19.3127 23.1393C18.5502 21.1172 18.0021 18.876 18.0021 16.4853C18.0021 9.76172 24.0342 4.0541 32.0488 3.19746L30.4881 17.1129L33.3332 16.2538C35.7458 15.5191 38.4264 15.1451 41.2858 15.1451C49.3433 15.1451 56.1784 20.2252 57.3102 26.899L40.5436 25.49ZM30.5 23.0197C28.925 23.0197 27.6406 24.0935 27.6406 25.4104C27.6406 26.7272 28.925 27.801 30.5 27.801C32.075 27.801 33.3594 26.7272 33.3594 25.4104C33.3594 24.0935 32.0727 23.0197 30.5 23.0197Z"
                          fill="#2759C5"
                        />
                      </g>
                    </g>
                    <defs>
                      <clipPath id="clip0_150_442_mobile">
                        <rect width="61" height="51" rx="25.5" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                
                <h2 
                  key={isLogin ? 'login-title' : 'signup-title'}
                  className="text-2xl font-bold text-white mb-2 animate-in fade-in duration-300"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-white/70">
                  {isLogin 
                    ? "Enter your credentials to sign in" 
                    : "Join us in making our city better"
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-6 animate-in slide-in-from-top duration-300">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Fields */}
                {!isLogin && (
                  <div 
                    key="register-fields"
                    className="space-y-4 animate-in slide-in-from-right duration-500"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Username *</label>
                      <input
                        type="text"
                        placeholder="Choose a username"
                        className="w-full p-3 rounded-xl bg-[#0B0F19] border border-white/20 text-white placeholder:text-white/50 focus:border-cs-blue-secondary focus:outline-none focus:ring-2 focus:ring-cs-blue-secondary/20 transition-all duration-200"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={!isLogin}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full p-3 rounded-xl bg-[#0B0F19] border border-white/20 text-white placeholder:text-white/50 focus:border-cs-blue-secondary focus:outline-none focus:ring-2 focus:ring-cs-blue-secondary/20 transition-all duration-200"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Phone number (optional)"
                        className="w-full p-3 rounded-xl bg-[#0B0F19] border border-white/20 text-white placeholder:text-white/50 focus:border-cs-blue-secondary focus:outline-none focus:ring-2 focus:ring-cs-blue-secondary/20 transition-all duration-200"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-3 rounded-xl bg-[#0B0F19] border border-white/20 text-white placeholder:text-white/50 focus:border-cs-blue-secondary focus:outline-none focus:ring-2 focus:ring-cs-blue-secondary/20 transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                      className="w-full p-3 rounded-xl bg-[#0B0F19] border border-white/20 text-white placeholder:text-white/50 focus:border-cs-blue-secondary focus:outline-none focus:ring-2 focus:ring-cs-blue-secondary/20 transition-all duration-200 pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me / Forgot password (Login only) */}
                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 text-white/70">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/20 bg-[#0B0F19] text-cs-blue-secondary focus:ring-cs-blue-secondary/20" 
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-cs-blue-secondary hover:text-cs-blue-light transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary text-white py-3 rounded-xl font-semibold hover:from-cs-blue-secondary hover:to-cs-blue-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Toggle Mode */}
                <div className="text-center pt-4">
                  <p className="text-white/70">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    {" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-cs-blue-secondary hover:text-cs-blue-light transition-colors font-semibold"
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/")}
                className="text-white/50 hover:text-white transition-colors text-sm"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}