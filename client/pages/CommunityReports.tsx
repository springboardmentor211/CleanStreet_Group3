import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { IssueCard, Issue } from "@/components/IssueCard";

// Mock data based on the Figma design
// Remove mock data, will fetch from backend
export default function CommunityReports() {

  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await fetch("http://localhost:5000/api/issues");
        const data = await res.json();
        console.log("Fetched issues from backend:", data);
        // Provide defaults for missing properties
        const safeIssues = (data.issues || []).map(issue => ({
          ...issue,
          icon: issue.icon || "road",
          upvotes: typeof issue.upvotes === "number" ? issue.upvotes : 0,
          downvotes: typeof issue.downvotes === "number" ? issue.downvotes : 0,
          comments: typeof issue.comments === "number" ? issue.comments : 0,
          timeAgo: issue.timeAgo || "recently",
          status: issue.status || "received",
          location: typeof issue.location === "object" && issue.location !== null
            ? `(${issue.location.coordinates?.[1]}, ${issue.location.coordinates?.[0]})`
            : (issue.location || "Unknown location")
        }));
        setIssues(safeIssues);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    }
    fetchIssues();
  }, []);

  const handleVote = (issueId: string, type: "up" | "down") => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          upvotes: type === "up" ? issue.upvotes + 1 : issue.upvotes,
          downvotes: type === "down" ? issue.downvotes + 1 : issue.downvotes
        };
      }
      return issue;
    }));
  };

  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto">
        {/* Page Title */}
        <h1 className="text-white text-2xl sm:text-3xl lg:text-[40px] font-bold mb-8">
          Community Reports
        </h1>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {issues.map((issue) => (
            <div key={issue._id || issue.id} onClick={() => navigate(`/issues/${issue._id || issue.id}`)} style={{ cursor: "pointer" }}>
              <IssueCard
                issue={issue}
                onVote={handleVote}
              />
            </div>
          ))}
        </div>

        {/* Empty State for when no issues */}
        {issues.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white text-xl">No community reports yet.</p>
            <p className="text-white/60 text-lg mt-2">
              Be the first to report an issue in your community!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
