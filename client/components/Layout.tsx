import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n, LanguageToggle } from "@/lib/i18n-context";

interface LayoutProps {
  children: ReactNode;
}
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const isActive = (path:string) => location.pathname.startsWith(path);
  const isWelcomeOrExplore =
    location.pathname === "/" ||
    location.pathname === "/welcome" ||
    location.pathname === "/explore";

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-white/30 px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="w-[61px] h-[51px] flex items-center justify-center">
              {/* Your SVG logo */}
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
            <h1 className="text-white text-xl sm:text-2xl font-bold">
              {t('cleanStreet')}
            </h1>
          </div>

          {/* Right side */}
          {isWelcomeOrExplore ? (
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-cs-blue-secondary text-white font-semibold hover:bg-cs-blue-light transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-white text-cs-blue-secondary font-semibold hover:bg-gray-200 transition-colors"
              >
                {t('register')}
              </Link>
            </div>
          ) : (
            <>
              {/* Links - Only show for citizen users */}
              {user?.role !== 'admin' && (
                <div className="hidden md:flex items-center space-x-8">
                  <Link
                    to="/dashboard"
                    className={`text-base ${
                      isActive("/dashboard")
                        ? "text-cs-blue-secondary"
                        : "text-white"
                    } hover:text-cs-blue-secondary transition-colors`}
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    to="/report"
                    className={`text-base ${
                      isActive("/report")
                        ? "text-cs-blue-secondary"
                        : "text-white"
                    } hover:text-cs-blue-secondary transition-colors`}
                  >
                    {t('reportIssue')}
                  </Link>
                  <Link
                    to="/complaints"
                    className={`text-base ${
                      (isActive("/complaints") || isActive("/issues"))
                        ? "text-cs-blue-secondary"
                        : "text-white"
                    } hover:text-cs-blue-secondary transition-colors`}
                  >
                    {t('viewComplaints')}
                  </Link>

                  <Link
                    to="/bookmarks"
                    className={`text-base ${
                      isActive("/bookmarks")
                        ? "text-cs-blue-secondary"
                        : "text-white"
                    } hover:text-cs-blue-secondary transition-colors`}
                  >
                    {t('bookmarks')}
                  </Link>

                  <Link
                    to="/maps"
                    className={`text-base ${
                      isActive("/maps")
                        ? "text-cs-blue-secondary"
                        : "text-white"
                    } hover:text-cs-blue-secondary transition-colors`}
                  >
                    {t('issueMap')}
                  </Link>

                  {/* <Link
                    to="/bookmarks"
                    className={`text-base ${
                      isActive("/bookmarks")
                        ? "text-cs-blue-secondary"
                        : "text-white"
                    } hover:text-cs-blue-secondary transition-colors`}
                  >
                    Bookmarks
                  </Link> */}
                </div>
              )}

              {/* Profile + Logout */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <LanguageToggle />
                <Link to="/profile">
                  <UserCircle className="w-10 h-10 text-white hover:text-cs-blue-light transition-colors" />
                </Link>
                <button
                  className="flex items-center space-x-2 bg-cs-red-logout px-2 sm:px-3 py-2 rounded-md hover:bg-cs-red-logout/80 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold hidden sm:inline">
                    {t('logout')}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="px-8 py-8">{children}</main>
    </div>
  );
}
