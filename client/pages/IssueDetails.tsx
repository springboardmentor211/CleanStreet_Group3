import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock } from "lucide-react";

export default function IssueDetails() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchIssue() {
      try {
        const res = await fetch(`http://localhost:5000/api/issues/${id}`);
        const data = await res.json();
        setIssue(data);
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
    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}/vote`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (res.ok) {
        setIssue(prev => prev ? { ...prev, votes: (prev.votes || 0) + 1 } : prev);
      }
    } catch {}
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ text: comment })
      });
      if (res.ok) {
        const newComments = await res.json();
        setComments(newComments);
        setComment("");
      }
    } catch {}
  };

  if (loading) return <Layout><div className="text-center py-20 text-white">Loading...</div></Layout>;
  if (!issue) return <Layout><div className="text-center py-20 text-white">Issue not found.</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-background rounded-xl p-8 mt-8 shadow-lg border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-4">{issue.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <MapPin className="w-6 h-6 text-white" />
          <span className="text-white text-lg">{typeof issue.location === "object" ? `(${issue.location.coordinates?.[1]}, ${issue.location.coordinates?.[0]})` : issue.location}</span>
          <Clock className="w-6 h-6 text-white ml-4" />
          <span className="text-white text-lg">{issue.createdAt ? new Date(issue.createdAt).toLocaleString() : ""}</span>
        </div>
        <div className="mb-6 text-white/90 text-lg">{issue.description}</div>
        <div className="flex gap-6 mb-8">
          <button onClick={() => handleVote("up")} className="flex items-center gap-2 px-4 py-2 rounded bg-cs-blue-primary text-white font-bold hover:bg-cs-blue-dark">
            <ThumbsUp className="w-5 h-5" /> Upvote ({issue.votes || 0})
          </button>
          <button onClick={() => handleVote("down")} className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700">
            <ThumbsDown className="w-5 h-5" /> Downvote
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Comments</h2>
          <div className="space-y-4 mb-4">
            {comments.length === 0 && <div className="text-white/60">No comments yet.</div>}
            {comments.map((c, idx) => (
              <div key={c._id || idx} className="bg-white/5 rounded p-3 text-white">
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
