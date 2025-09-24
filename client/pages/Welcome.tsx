import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import Explore from "./Explore";

export default function Welcome() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll on page load
  }, []);

  const handleScroll = () => {
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full bg-background text-white">
      {/* Navigation */}
      <nav className="border-b border-white/30 px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="w-[61px] h-[51px] flex items-center justify-center">
              <svg
                width="61"
                height="51"
                viewBox="0 0 61 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[61px] h-[51px]"
              >
                {/* ... SVG content unchanged ... */}
              </svg>
            </div>
            <h1 className="text-white text-xl sm:text-2xl font-bold">Clean Street</h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-cs-blue-secondary text-white px-6 py-2 rounded-cs-button hover:bg-cs-blue-primary transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-cs-blue-light transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cs-blue-secondary text-white px-6 py-2 rounded-cs-button hover:bg-cs-blue-primary transition-colors"
                >
                  Register
                </Link>
                <Link
                  to="/admin-login"
                  className="text-white border border-cs-blue-secondary px-6 py-2 rounded-cs-button hover:bg-cs-blue-secondary hover:text-white transition-colors"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-between items-center px-4 sm:px-8 py-16 sm:py-24">
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-7xl mx-auto">
          <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
            Make Our City
            <span className="block text-cs-blue-secondary">Clean & Safe</span>
          </h1>
          <p className="text-white/80 text-xl sm:text-2xl max-w-3xl mx-auto mb-12">
            Join thousands of citizens reporting issues and working together to improve our community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 bg-cs-blue-secondary text-white px-8 py-4 rounded-cs-button text-lg font-medium hover:bg-cs-blue-primary transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 bg-cs-blue-secondary text-white px-8 py-4 rounded-cs-button text-lg font-medium hover:bg-cs-blue-primary transition-colors"
                >
                  <span>Start Reporting Issues</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center space-x-2 border border-white/30 text-white px-8 py-4 rounded-cs-button text-lg hover:bg-white/5 transition-colors"
                >
                  <span>View Community Reports</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Scroll Button */}
        <Explore />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/30 px-4 sm:px-8 py-8 text-center">
        <p className="text-white/60">
          © 2025 Clean Street. Building better communities together.
        </p>
      </footer>
    </div>
  );
}
