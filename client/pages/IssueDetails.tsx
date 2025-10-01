import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock, ArrowLeft } from "lucide-react";
import { issuesAPI, adminAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    async function fetchIssue() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/issues/${id}`);
        const data = await res.json();
        setIssue(data);
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

  const handleVote = async (type: "up" | "down") => {
    if (!issue) return;
    setVoteAnimating(true);
    setIssue(prev => prev ? { ...prev, votes: (prev.votes || 0) + (type === "up" ? 1 : -1) } : prev);
    try {
      await issuesAPI.vote(id, type);
      const res = await issuesAPI.getById(id);
      if (res && res.data) {
        setIssue(res.data);
      }
    } catch (err) {
      // Optionally show error toast
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

  if (loading) return <Layout><div className="text-center py-20 text-white">Loading...</div></Layout>;
  if (!issue) return <Layout><div className="text-center py-20 text-white">Issue not found.</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-background rounded-xl p-8 mt-8 shadow-lg border border-white/10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{isAdmin ? 'Back to Admin Dashboard' : 'Back to Community Reports'}</span>
          </button>
        </div>

        {/* Admin Badge */}
        {isAdmin && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#832E2E] text-white">
              Admin View
            </span>
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-4">{issue.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => navigate('/maps')}
            style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer" }}
          >
            <MapPin className="w-6 h-6 text-white" />
            <span className="text-white text-lg underline">{issue.address}</span>
          </button>
          <Clock className="w-6 h-6 text-white ml-4" />
          <span className="text-white text-lg">{issue.createdAt ? new Date(issue.createdAt).toLocaleString() : ""}</span>
        </div>
        <div className="mb-6 text-white/90 text-lg">{issue.description}</div>
          {/* Image Gallery */}
          {Array.isArray(issue.images) && issue.images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Attached Images</h2>
              <div className="flex gap-4 flex-wrap">
                {issue.images.map((imgPath, idx) => (
                  <a
                    key={idx}
                    href={`${imgPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={`${imgPath}`}
                      alt={`Issue image ${idx + 1}`}
                      className="w-40 h-40 object-cover rounded-lg border border-white/20 hover:scale-105 transition-transform shadow"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              issue.status === 'Received' ? 'bg-blue-100 text-blue-800' :
              issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {issue.status}
            </span>
          </div>
          
          {/* Only show status update buttons to admin users */}
          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusUpdate('open')}
                disabled={isUpdatingStatus || issue.status === 'open'}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  issue.status === 'open' 
                    ? 'bg-red-600 text-white cursor-default' 
                    : 'bg-red-600/20 text-red-300 border border-red-600/30 hover:bg-red-600/30'
                }`}
              >
                {isUpdatingStatus && issue.status === 'open' ? 'Updating...' : 'Mark as Open'}
              </button>
              
              <button
                onClick={() => handleStatusUpdate('in-progress')}
                disabled={isUpdatingStatus || issue.status === 'in-progress'}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  issue.status === 'in-progress' 
                    ? 'bg-yellow-600 text-white cursor-default' 
                    : 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30 hover:bg-yellow-600/30'
                }`}
              >
                {isUpdatingStatus && issue.status === 'in-progress' ? 'Updating...' : 'Mark as In Progress'}
              </button>
              
              <button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={isUpdatingStatus || issue.status === 'resolved'}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  issue.status === 'resolved' 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-green-600/20 text-green-300 border border-green-600/30 hover:bg-green-600/30'
                }`}
              >
                {isUpdatingStatus && issue.status === 'resolved' ? 'Updating...' : 'Mark as Resolved'}
              </button>
            </div>
          )}
          
          <div className="flex gap-6 mt-2">
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-2 px-4 py-2 rounded bg-cs-blue-primary text-white font-bold hover:bg-cs-blue-dark transition-transform ${voteAnimating ? "scale-105 ring-2 ring-cs-blue-primary" : ""}`}
              disabled={voteAnimating}
            >
              <ThumbsUp className="w-5 h-5" /> Upvote ({issue.votes || 0})
            </button>
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-transform ${voteAnimating ? "scale-105 ring-2 ring-red-600" : ""}`}
              disabled={voteAnimating}
            >
              <ThumbsDown className="w-5 h-5" /> Downvote
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Comments</h2>
          <div className="space-y-4 mb-4">
            {comments.length === 0 && <div className="text-white/60">No comments yet.</div>}
            {comments.map((c, idx) => (
              <div
                key={c._id || idx}
                className={`bg-white/5 rounded p-3 text-white transition-all duration-300 ${commentAnimating && idx === 0 ? "scale-105 ring-2 ring-cs-blue-primary" : ""}`}
              >
                <div className="font-bold">{c.user?.fullName || "Anonymous"}</div>
                <div>{c.text}</div>
                <div className="text-xs text-white/50 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-white/10 text-white border border-white/20"
              placeholder="Add a comment..."
            />
            <button onClick={handleComment} className="px-4 py-2 rounded bg-cs-blue-primary text-white font-bold hover:bg-cs-blue-dark">Post</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
