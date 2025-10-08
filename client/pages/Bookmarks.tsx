import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { IssueCard } from "@/components/IssueCard";
import { Bookmark, BookmarkX, RefreshCw, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { bookmarksAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { toast } from "sonner";

export default function Bookmarks() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookmarks = async (page = 1) => {
    try {
      setLoading(page === 1);
      setRefreshing(page !== 1);
      
      const response = await bookmarksAPI.getUserBookmarks({
        page,
        limit: 12
      });
      
      // Transform the issues data to ensure compatibility with IssueCard
      const transformedIssues = response.data.issues.map(issue => ({
        ...issue,
        id: issue._id || issue.id,
        address: issue.address || issue.location || "Location not specified",
        upvotes: Number(issue.upvotes) || 0,
        downvotes: Number(issue.downvotes) || 0,
        comments: Array.isArray(issue.comments) ? issue.comments.length : Number(issue.comments) || 0,
        icon: issue.icon || "road" // Default icon
      }));
      
      setBookmarks(transformedIssues);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      toast.error("Failed to load bookmarks", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks(1);
    }
  }, [user]);

  const handleRemoveBookmark = async (issueId: string) => {
    try {
      await bookmarksAPI.removeBookmark(issueId);
      setBookmarks(prev => prev.filter(issue => issue._id !== issueId));
      setTotalItems(prev => prev - 1);
      
      toast.success("Bookmark removed", {
        description: "Issue removed from your saved list.",
      });
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      toast.error("Failed to remove bookmark", {
        description: "Please try again.",
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchBookmarks(page);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center rounded-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cs-blue-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white/70 text-lg">Loading your bookmarks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-cs-blue-primary/5">
        <div className="max-w-7xl mx-auto px-4 py-8 rounded-full">
          
          {/* Header */}
          <div className="mb-8 animate-slide-in-from-top">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{t('myBookmarks')}</h1>
                  <p className="text-white/70">{t('issuesYouSaved')}</p>
                </div>
              </div>
              
              <button
                onClick={() => fetchBookmarks(currentPage)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{t('refresh')}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-medium">
                    {totalItems} {totalItems === 1 ? t('issue') : t('issues')} {t('saved')}
                  </span>
                </div>
                
                {totalPages > 1 && (
                  <div className="text-white/70 text-sm">
                    {t('page')} {currentPage} {t('of')} {totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {bookmarks.length === 0 ? (
            <div className="text-center py-20 animate-fade-in rounded-full">
              <div className="mb-8">
                <BookmarkX className="w-24 h-24 text-white/20 mx-auto mb-4" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t('noBookmarksYet')}</h2>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                {t('noBookmarksDescription')}
              </p>
              <button
                onClick={() => navigate('/complaints')}
                className="px-8 py-4 bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cs-blue-primary/25 transition-all duration-300 transform hover:scale-105"
              >
                {t('browseIssues')}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Issues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-slide-in-from-bottom rounded-full">
                {bookmarks.map((issue, index) => (
                  <div 
                    key={issue._id} 
                    className="relative group animate-slide-in-from-bottom cursor-pointer rounded-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/issues/${issue._id}`)}
                  >
                    <div className="transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-cs-blue-primary/20 rounded-full">
                      <IssueCard 
                        issue={issue}
                        onVote={(e) => {
                          e.stopPropagation(); // Prevent card click when voting
                        }}
                      />
                    </div>
                    
                    {/* Remove Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveBookmark(issue._id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-300 transform hover:scale-110 z-10"
                      title="Remove bookmark"
                    >
                      <BookmarkX className="w-4 h-4" />
                    </button>
                    
                    {/* Clickable overlay indicator */}
                    <div className="absolute inset-0 bg-cs-blue-primary/5 rounded-cs-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Click hint */}
                    {/* <div className="absolute bottom-3 left-3 bg-cs-blue-primary/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      Click to view details
                    </div> */}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || refreshing}
                    className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={refreshing}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-cs-blue-primary text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || refreshing}
                    className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}