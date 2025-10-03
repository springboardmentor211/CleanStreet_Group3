import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock, ArrowLeft, User, Calendar, Eye, Share2, Bookmark, Check, Copy, BookmarkCheck } from "lucide-react";
import { issuesAPI, adminAPI, bookmarksAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [voteAnimating, setVoteAnimating] = useState(false);
  const [commentAnimating, setCommentAnimating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [isSharing, setIsSharing] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    async function fetchIssue() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setIssue(data);
        setUserVote(data.userVote || null);
        console.log(data);
        setComments(data.comments || []);
      } catch (err) {
        setIssue(null);
      } finally {
        setLoading(false);
      }
    }
    fetchIssue();
  }, [id]);

  // Fetch bookmark status when issue is loaded
  useEffect(() => {
    async function fetchBookmarkStatus() {
      if (!issue || !user) return;
      
      try {
        const response = await bookmarksAPI.getBookmarkStatus(id);
        setIsBookmarked(response.isBookmarked);
      } catch (err) {
        console.error('Failed to fetch bookmark status:', err);
      }
    }
    fetchBookmarkStatus();
  }, [issue, user, id]);

  // Add keyboard shortcut for copying link (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        handleShare();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [issue]);

  const handleVote = async (type: "up" | "down") => {
    if (!issue || !user) return;
    setVoteAnimating(true);
    
    // Optimistic UI update
    const isUndoing = userVote === type;
    const isChanging = userVote && userVote !== type;
    
    let newUpvotes = issue.upvotes || 0;
    let newDownvotes = issue.downvotes || 0;
    let newUserVote = userVote;
    
    if (isUndoing) {
      // Undoing current vote
      if (type === 'up') {
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else {
        newDownvotes = Math.max(0, newDownvotes - 1);
      }
      newUserVote = null;
    } else if (isChanging) {
      // Changing vote type
      if (userVote === 'up') {
        newUpvotes = Math.max(0, newUpvotes - 1);
        newDownvotes += 1;
      } else {
        newDownvotes = Math.max(0, newDownvotes - 1);
        newUpvotes += 1;
      }
      newUserVote = type;
    } else {
      // New vote
      if (type === 'up') {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
      newUserVote = type;
    }
    
    setIssue(prev => prev ? { 
      ...prev, 
      upvotes: newUpvotes, 
      downvotes: newDownvotes 
    } : prev);
    setUserVote(newUserVote);

    try {
      const response = await issuesAPI.vote(id, type);
      if (response && response.data) {
        // Update with server response
        setIssue(prev => prev ? { 
          ...prev, 
          upvotes: response.data.upvotes, 
          downvotes: response.data.downvotes 
        } : prev);
        setUserVote(response.data.userVote);
      }
    } catch (err) {
      // Revert optimistic update on error
      setIssue(prev => prev ? { 
        ...prev, 
        upvotes: issue.upvotes || 0, 
        downvotes: issue.downvotes || 0 
      } : prev);
      setUserVote(userVote);
    } finally {
      setTimeout(() => setVoteAnimating(false), 400);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!issue || isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      if (isAdmin) {
        // Use admin API for status updates
        await adminAPI.updateIssueStatus(id, newStatus);
      } else {
        await issuesAPI.update(id, { status: newStatus });
      }
      // Update the local state to reflect the change
      setIssue(prev => prev ? { ...prev, status: newStatus } : null);
      // Optionally show success toast
    } catch (err) {
      console.error('Failed to update status:', err);
      // Optionally show error toast
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGoBack = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/complaints');
    }
  };

  const handleShare = async () => {
    if (!issue || isSharing) return;
    
    setIsSharing(true);
    setShowRipple(true);
    
    try {
      const currentUrl = window.location.href;
      
      // Try to use the modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      toast.success("Link copied to clipboard!", {
        description: "You can now share this issue with others.",
        duration: 3000,
        action: {
          label: "Open",
          onClick: () => window.open(currentUrl, '_blank')
        }
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error("Failed to copy link", {
        description: "Unable to copy link. Please try again.",
        duration: 3000,
      });
    } finally {
      setTimeout(() => {
        setIsSharing(false);
        setShowRipple(false);
      }, 1200); // Keep the visual feedback for a bit longer
    }
  };

  const handleBookmark = async () => {
    if (!issue || !user || isBookmarking) return;
    
    setIsBookmarking(true);
    
    try {
      const response = await bookmarksAPI.toggleBookmark(id);
      setIsBookmarked(response.isBookmarked);
      
      if (response.isBookmarked) {
        toast.success("Issue bookmarked!", {
          description: "You can find this in your saved issues.",
          duration: 3000,
        });
      } else {
        toast.success("Bookmark removed", {
          description: "Issue removed from your saved list.",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      toast.error("Failed to bookmark issue", {
        description: "Please try again.",
        duration: 3000,
      });
    } finally {
      setTimeout(() => setIsBookmarking(false), 500);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setCommentAnimating(true);
    // Optimistically add comment to UI
    const newComment = {
      text: comment,
      user: { fullName: "You" },
      createdAt: new Date().toISOString(),
      _id: Math.random().toString(36).slice(2),
    };
    setComments(prev => [newComment, ...prev]);
    setComment("");
    try {
      await issuesAPI.addComment(id, newComment.text);
      // Refetch comments from backend for accuracy
      const res = await issuesAPI.getById(id);
      if (res && res.data) {
        setComments(res.data.comments || []);
      }
    } catch (err) {
      // Optionally show error toast
    } finally {
      setTimeout(() => setCommentAnimating(false), 400);
    }
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cs-blue-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70 text-lg">Loading issue details...</p>
        </div>
      </div>
    </Layout>
  );
  
  if (!issue) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white">Issue Not Found</h2>
          <p className="text-white/70">The issue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleGoBack}
            className="mt-6 px-6 py-3 bg-cs-blue-primary text-white rounded-xl hover:bg-cs-blue-secondary transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-cs-blue-primary/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Enhanced Header with Navigation */}
          <div className="mb-8 animate-slide-in-from-top">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">{isAdmin ? 'Admin Dashboard' : 'Community Reports'}</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button 
                    onClick={handleShare}
                    disabled={isSharing}
                    className={`relative overflow-hidden px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300 ripple-effect ${
                      showRipple ? 'animate-ripple' : ''
                    } ${
                      isSharing 
                        ? 'bg-green-500/20 border-green-500/50 text-green-400 scale-105' 
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-cs-blue-primary/50 hover:scale-105'
                    }`}
                    title={isSharing ? "Link copied!" : "Copy issue link (Ctrl+Shift+C)"}
                  >
                    <div className="flex items-center gap-2 relative z-10">
                      {isSharing ? (
                        <>
                          <Check className="h-4 w-4 animate-scale-in" />
                          <span className="text-sm font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">Share</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  {/* Keyboard shortcut hint */}
                  <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    <div className="bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md whitespace-nowrap border border-white/10">
                      Ctrl+Shift+C
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleBookmark}
                  disabled={isBookmarking || !user}
                  className={`group px-4 py-2 backdrop-blur-sm border rounded-xl transition-all duration-300 ${
                    isBookmarked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                      : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-cs-blue-primary/50'
                  } ${isBookmarking ? 'animate-pulse' : 'hover:scale-105'}`}
                  title={!user ? "Please log in to bookmark" : isBookmarked ? "Remove bookmark" : "Bookmark issue"}
                >
                  <div className="flex items-center gap-2">
                    {isBookmarking ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <Bookmark className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    )}
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {isBookmarked ? 'Saved' : 'Save'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Admin Badge with Enhanced Design */}
            {isAdmin && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cs-red-logout to-red-600 rounded-xl shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">Admin View</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Main Content Column */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Issue Header Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-in-from-left">
                <div className="space-y-6">
                  {/* Title */}
                  <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">{issue.title}</h1>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-6 text-white/70">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-cs-blue-secondary" />
                      <span className="font-medium">Reported by Community</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cs-blue-secondary" />
                      <span>{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ""}</span>
                    </div>
                  </div>

                  {/* Location Button */}
                  <button
                    type="button"
                    className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary rounded-xl text-white hover:shadow-lg hover:shadow-cs-blue-primary/25 transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      // Navigate to maps with issue coordinates
                      let lat, lng;
                      if (issue.location && issue.location.coordinates) {
                        lng = issue.location.coordinates[0];
                        lat = issue.location.coordinates[1];
                      } else if (issue.location && issue.location.latitude && issue.location.longitude) {
                        lat = issue.location.latitude;
                        lng = issue.location.longitude;
                      }
                      
                      if (lat && lng) {
                        navigate(`/maps?issueId=${issue._id}&lat=${lat}&lng=${lng}`);
                      } else {
                        navigate('/maps');
                      }
                    }}
                  >
                    <MapPin className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="font-semibold">{issue.address}</span>
                    <Eye className="w-4 h-4 opacity-70" />
                  </button>

                  {/* Description */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-3">Issue Description</h3>
                    <p className="text-white/90 leading-relaxed text-lg">{issue.description}</p>
                  </div>
                </div>
              </div>
              {/* Enhanced Image Gallery */}
              {Array.isArray(issue.images) && issue.images.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-in-from-left delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Visual Evidence</h2>
                    <span className="px-3 py-1 bg-cs-blue-primary/20 text-cs-blue-secondary rounded-full text-sm font-medium">
                      {issue.images.length} {issue.images.length === 1 ? 'Image' : 'Images'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issue.images.map((imgPath, idx) => (
                      <a
                        key={idx}
                        href={`${imgPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-cs-blue-primary/50 transition-all duration-300"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={`${imgPath}`}
                            alt={`Issue image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 text-white">
                            <p className="text-sm font-medium">Click to view full size</p>
                          </div>
                        </div>
                        
                        {/* Image number badge */}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {idx + 1}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Community Engagement Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-in-from-left delay-300">
                <div className="space-y-6">
                  {/* Voting Section */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Community Support</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleVote("up")}
                        className={`group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                          userVote === 'up' 
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/25 scale-105' 
                            : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-green-600/20 hover:border-green-500/50 hover:scale-105'
                        } ${voteAnimating ? "animate-pulse" : ""}`}
                        disabled={voteAnimating || !user}
                        title={!user ? "Please log in to vote" : userVote === 'up' ? "Click to undo your upvote" : "Click to upvote"}
                      >
                        <ThumbsUp className={`w-5 h-5 ${userVote === 'up' ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} /> 
                        <span>{userVote === 'up' ? 'Supported' : 'Support'}</span>
                        <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold">
                          {issue.upvotes || 0}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleVote("down")}
                        className={`group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                          userVote === 'down' 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25 scale-105' 
                            : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-red-600/20 hover:border-red-500/50 hover:scale-105'
                        } ${voteAnimating ? "animate-pulse" : ""}`}
                        disabled={voteAnimating || !user}
                        title={!user ? "Please log in to vote" : userVote === 'down' ? "Click to undo your downvote" : "Click to downvote"}
                      >
                        <ThumbsDown className={`w-5 h-5 ${userVote === 'down' ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} /> 
                        <span>{userVote === 'down' ? 'Disputed' : 'Dispute'}</span>
                        <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold">
                          {issue.downvotes || 0}
                        </span>
                      </button>
                    </div>
                    
                    {!user && (
                      <p className="text-white/60 text-sm mt-3 italic">Please log in to vote and show your support</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Status Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-slide-in-from-right">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Issue Status</h3>
                  
                  {/* Current Status Display */}
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      issue.status === 'open' ? 'bg-red-500 animate-pulse' :
                      issue.status === 'in-progress' ? 'bg-yellow-500 animate-pulse' :
                      'bg-green-500'
                    }`}></div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      issue.status === 'open' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      issue.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {issue.status === 'open' ? 'Open' : 
                       issue.status === 'in-progress' ? 'In Progress' : 'Resolved'}
                    </span>
                  </div>
                  
                  {/* Admin Status Controls */}
                  {isAdmin && (
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <p className="text-sm font-medium text-white/70 mb-3">Update Status:</p>
                      
                      <button
                        onClick={() => handleStatusUpdate('open')}
                        disabled={isUpdatingStatus || issue.status === 'open'}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          issue.status === 'open' 
                            ? 'bg-red-600 text-white cursor-default shadow-lg' 
                            : 'bg-red-600/10 text-red-300 border border-red-600/30 hover:bg-red-600/20 hover:scale-105'
                        }`}
                      >
                        {isUpdatingStatus && issue.status === 'open' ? 'Updating...' : 'Mark as Open'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate('in-progress')}
                        disabled={isUpdatingStatus || issue.status === 'in-progress'}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          issue.status === 'in-progress' 
                            ? 'bg-yellow-600 text-white cursor-default shadow-lg' 
                            : 'bg-yellow-600/10 text-yellow-300 border border-yellow-600/30 hover:bg-yellow-600/20 hover:scale-105'
                        }`}
                      >
                        {isUpdatingStatus && issue.status === 'in-progress' ? 'Updating...' : 'Mark as In Progress'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate('resolved')}
                        disabled={isUpdatingStatus || issue.status === 'resolved'}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          issue.status === 'resolved' 
                            ? 'bg-green-600 text-white cursor-default shadow-lg' 
                            : 'bg-green-600/10 text-green-300 border border-green-600/30 hover:bg-green-600/20 hover:scale-105'
                        }`}
                      >
                        {isUpdatingStatus && issue.status === 'resolved' ? 'Updating...' : 'Mark as Resolved'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Stats Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-slide-in-from-right delay-200">
                <h3 className="text-lg font-bold text-white mb-4">Community Engagement</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Support</span>
                    </div>
                    <span className="font-bold text-green-400">{issue.upvotes || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-orange-400" />
                      <span className="text-white/70">Disputes</span>
                    </div>
                    <span className="font-bold text-orange-400">{issue.downvotes || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-cs-blue-secondary" />
                      <span className="text-white/70">Comments</span>
                    </div>
                    <span className="font-bold text-cs-blue-secondary">{comments.length}</span>
                  </div>
                  
                  {/* Engagement Progress */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Community Support</span>
                      <span className="text-sm font-medium text-white">
                        {Math.round(((issue.upvotes || 0) / Math.max((issue.upvotes || 0) + (issue.downvotes || 0), 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.round(((issue.upvotes || 0) / Math.max((issue.upvotes || 0) + (issue.downvotes || 0), 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Enhanced Comments Section */}
          <div className="mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-in-from-bottom">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Community Discussion</h2>
                <span className="px-3 py-1 bg-cs-blue-primary/20 text-cs-blue-secondary rounded-full text-sm font-medium">
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </span>
              </div>
              
              {/* Comment Input */}
              <div className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                      className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-cs-blue-primary focus:ring-2 focus:ring-cs-blue-primary/20 focus:outline-none transition-all duration-300"
                      placeholder="Share your thoughts about this issue..."
                    />
                  </div>
                  <button 
                    onClick={handleComment} 
                    disabled={!comment.trim()}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cs-blue-primary to-cs-blue-secondary text-white font-semibold hover:shadow-lg hover:shadow-cs-blue-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">No comments yet</p>
                    <p className="text-white/40 text-sm">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  comments.map((c, idx) => (
                    <div
                      key={c._id || idx}
                      className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ${
                        commentAnimating && idx === 0 ? "ring-2 ring-cs-blue-primary animate-pulse" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-cs-blue-primary to-cs-blue-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(c.user?.fullName || "A").charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Comment Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">
                              {c.user?.fullName || "Anonymous User"}
                            </span>
                            <span className="text-white/50 text-sm">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ""}
                            </span>
                          </div>
                          
                          <p className="text-white/90 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
