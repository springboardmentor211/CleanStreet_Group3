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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 border-b border-white/30 px-4 sm:px-8 py-6">
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Logo */}
          <div className="w-[61px] h-[51px] flex items-center justify-center">
            <svg
              width="61"
              height="51"
              viewBox="0 0 61 51"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[61px] h-[51px]"
            >
              <g clipPath="url(#clip0_150_488)">
                <mask
                  id="mask0_150_488"
                  style={{ maskType: "luminance" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="61"
                  height="51"
                >
                  <path d="M61 0H0V51H61V0Z" fill="white" />
                </mask>
                <g mask="url(#mask0_150_488)">
                  <path
                    d="M41.2822 11.9531C39.1222 11.9531 36.9634 12.1523 34.8629 12.5508L35.965 3.41162C36.0692 2.54004 35.7267 1.68041 35.0267 1.03295C34.3125 0.373535 33.2998 0 32.2275 0C32.0637 0 31.9148 0.0124512 31.751 0.0249023C21.8027 1.0708 14.2969 8.14307 14.2969 16.4903C14.2969 18.2962 14.5352 20.1012 15.0117 21.8573L4.08057 20.9279H3.99121L3.70766 20.918C2.65028 20.918 1.63699 21.304 0.937638 21.9639C0.223032 22.6512 -0.104617 23.5576 0.0294165 24.4541C1.28039 32.7715 9.73938 39.0469 19.7234 39.0469C21.8834 39.0469 24.0422 38.8477 26.1427 38.4492L25.0406 47.5884C24.9364 48.46 25.2789 49.3196 25.9789 49.967C26.8128 50.7266 28.034 51.1006 29.2552 50.9761C39.2035 49.9302 46.7093 42.8579 46.7093 34.5107C46.7093 32.7047 46.471 30.8998 45.9945 29.1437L56.9256 30.0651H57.015L57.2979 30.0775C58.3553 30.0775 59.3686 29.6916 60.0537 29.0316C60.7834 28.3468 61.111 27.4379 60.977 26.5414C59.7252 18.2285 51.2662 11.9531 41.2822 11.9531ZM40.5436 25.49L41.5711 27.8687C42.4498 29.8858 42.8972 32.127 42.8972 34.5176C42.8972 41.2542 36.821 46.9688 28.8386 47.9151L30.522 33.8901L27.677 34.7492C25.2644 35.4838 22.5837 35.8579 19.7243 35.8579C11.6668 35.8579 4.83175 30.7778 3.69991 24.104L20.4749 25.5115L19.3127 23.1393C18.5502 21.1172 18.0021 18.876 18.0021 16.4853C18.0021 9.76172 24.0342 4.0541 32.0488 3.19746L30.4881 17.1129L33.3332 16.2538C35.7458 15.5191 38.4264 15.1451 41.2858 15.1451C49.3433 15.1451 56.1784 20.2252 57.3102 26.899L40.5436 25.49ZM30.5 23.0197C28.925 23.0197 27.6406 24.0935 27.6406 25.4104C27.6406 26.7272 28.925 27.801 30.5 27.801C32.075 27.801 33.3594 26.7272 33.3594 25.4104C33.3594 24.0935 32.0727 23.0197 30.5 23.0197Z"
                    fill="#2759C5"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="clip0_150_488">
                  <rect width="61" height="51" rx="25.5" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h1 className="text-white text-xl sm:text-2xl font-bold">Clean Street</h1>
        </div>
      </div>

      {/* Forgot Password Form */}
      <div className="w-full max-w-[501px] border border-white/30 rounded-cs-button bg-background p-8 shadow-lg">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <svg
              width="102"
              height="102"
              viewBox="0 0 102 102"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-24 h-24"
            >
              <circle cx="51" cy="51" r="51" fill="#FEE2E2" />
              <path
                d="M51 30C43.82 30 38 35.82 38 43V47C35.79 47 34 48.79 34 51V69C34 71.21 35.79 73 38 73H64C66.21 73 68 71.21 68 69V51C68 48.79 66.21 47 64 47V43C64 35.82 58.18 30 51 30ZM51 34C56.05 34 60 37.95 60 43V47H42V43C42 37.95 45.95 34 51 34ZM51 57C53.21 57 55 58.79 55 61C55 63.21 53.21 65 51 65C48.79 65 47 63.21 47 61C47 58.79 48.79 57 51 57Z"
                fill="#DC2626"
              />
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
