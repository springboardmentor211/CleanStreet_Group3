import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Users, MapPin, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useI18n, LanguageToggle } from "@/lib/i18n-context";
import Explore from "./Explore";

export default function Welcome() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll on page load
  }, []);

  const handleScroll = () => {
    document
      .getElementById("explore")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <nav className="border-b border-white/30 px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* SVG logo */}
            <div className="w-[61px] h-[51px] flex items-center justify-center">
              {/* ... your SVG unchanged ... */}
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

          {/* Auth Buttons or Dashboard Button */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-cs-blue-secondary text-white px-6 py-2 rounded-cs-button hover:bg-cs-blue-primary transition-colors"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="text-white hover:text-cs-blue-light transition-colors px-4 py-2"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="bg-cs-blue-secondary text-white px-6 py-2 rounded-cs-button hover:bg-cs-blue-primary transition-colors"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-between items-center px-4 sm:px-8 py-16 sm:py-24 relative overflow-hidden">
        {/* Background Animation Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cs-blue-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cs-blue-secondary/5 rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cs-blue-primary/3 to-cs-blue-secondary/3 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-7xl mx-auto relative z-10">
          <div className="animate-in slide-in-from-top duration-700">
            <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
              {t('makeOurCity')}
              <span className="block bg-gradient-to-r from-cs-blue-secondary to-cs-blue-light bg-clip-text text-transparent">
                {t('cleanAndSafe')}
              </span>
            </h1>
          </div>
          
          <div className="animate-in slide-in-from-bottom duration-700 delay-200">
            <p className="text-white/80 text-xl sm:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
              {t('joinThousandsDescription')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="animate-in slide-in-from-left duration-700 delay-300">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <Users className="w-8 h-8 text-cs-blue-secondary mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">{t('communityDriven')}</h3>
                <p className="text-white/70 text-sm">{t('communityDrivenDesc')}</p>
              </div>
            </div>
            
            <div className="animate-in slide-in-from-bottom duration-700 delay-400">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <MapPin className="w-8 h-8 text-cs-blue-secondary mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">{t('easyReporting')}</h3>
                <p className="text-white/70 text-sm">{t('easyReportingDesc')}</p>
              </div>
            </div>
            
            <div className="animate-in slide-in-from-right duration-700 delay-500">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CheckCircle className="w-8 h-8 text-cs-blue-secondary mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">{t('trackProgressCard')}</h3>
                <p className="text-white/70 text-sm">{t('trackProgressCardDesc')}</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-600">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary text-white px-8 py-4 rounded-cs-button text-lg font-medium hover:from-cs-blue-secondary hover:to-cs-blue-primary transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-cs-blue-primary/20"
                >
                  <span>{t('goToDashboard')}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth?mode=register"
                    className="flex items-center space-x-2 bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary text-white px-8 py-4 rounded-cs-button text-lg font-medium hover:from-cs-blue-secondary hover:to-cs-blue-primary transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-cs-blue-primary/20"
                  >
                    <span>{t('startReportingIssues')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/complaints"
                    className="flex items-center space-x-2 border border-white/30 text-white px-8 py-4 rounded-cs-button text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                  >
                    <span>{t('viewCommunityReports')}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Button */}
        <div className="animate-in fade-in duration-700 delay-800">
          <Explore/>
        </div>
      </section>

    
      <footer className="border-t border-white/30 px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">
            {t('copyrightText')}
          </p>
        </div>
      </footer>
    </div>
  );
}