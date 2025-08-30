import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset request for:", email);
    // TODO: Implement actual password reset functionality
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">

      {/* Forgot Password Form */}
      <div className="w-full max-w-[501px] border border-white/10 rounded-2xl bg-[#111827] p-10 shadow-lg">


        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="103" height="104" fill="none" viewBox="0 0 103 104">
  <path fill="url(#a)" d="M0 .918h102.164v102.164H0z"/>
  <defs>
    <pattern id="a" width="1" height="1" patternContentUnits="objectBoundingBox">
      <use href="#b" transform="scale(.01563)"/>
    </pattern>
    <image id="b" width="64" height="64" data-name="problem.png" href="data:image/png;base64,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" preserveAspectRatio="none"/>
  </defs>
</svg>

          </div>
          <h1 className="text-white text-3xl sm:text-[42px] font-bold mb-4">
            Forgot Password
          </h1>
          <p className="text-white text-base font-light max-w-md mx-auto leading-tight">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-white text-xl mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-12 px-4 rounded-cs-button border border-white/30 bg-background text-white placeholder-white/60 text-sm focus:outline-none focus:border-cs-blue-primary"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-12 bg-cs-blue-secondary text-white font-medium rounded-cs-button hover:bg-cs-blue-primary transition-colors"
          >
            Submit
          </button>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-cs-blue-secondary text-sm hover:text-cs-blue-light transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
