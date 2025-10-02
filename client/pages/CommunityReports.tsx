import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { IssueCard, Issue } from "@/components/IssueCard";

// Mock data based on the Figma design
// Remove mock data, will fetch from backend
export default function CommunityReports() {

  const [issues, setIssues] = useState<Issue[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    async function fetchIssues() {
      try {
        const headers: Record<string, string> = {};
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch("http://localhost:5000/api/issues", { headers });
        const data = await res.json();
        
        // Provide defaults for missing properties and extract user votes
        const votesMap: Record<string, 'up' | 'down' | null> = {};
        const safeIssues = (data.issues || []).map(issue => {
          const issueId = issue._id || issue.id;
          votesMap[issueId] = issue.userVote || null;
          
          return {
            ...issue,
            icon: issue.icon || "road",
            upvotes: typeof issue.upvotes === "number" ? issue.upvotes : 0,
            downvotes: typeof issue.downvotes === "number" ? issue.downvotes : 0,
            comments: typeof issue.comments === "number" ? issue.comments : 
              (Array.isArray(issue.comments) ? issue.comments.length : 0),
            timeAgo: issue.timeAgo || "recently",
            status: issue.status || "Received",
            location: typeof issue.location === "object" && issue.location !== null
              ? `(${issue.location.coordinates?.[1]}, ${issue.location.coordinates?.[0]})`
              : (issue.location || "Unknown location")
          };
        });
        
        setIssues(safeIssues);
        setUserVotes(votesMap);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    }
    fetchIssues();
  }, []);

  const handleVote = async (e: React.MouseEvent, issueId: string, type: "up" | "down") => {
    e.stopPropagation(); // Prevent navigation when clicking vote buttons
    
    const currentUserVote = userVotes[issueId];
    const isUndoing = currentUserVote === type;
    const isChanging = currentUserVote && currentUserVote !== type;
    
    try {
      // Optimistic UI update
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId || issue._id === issueId) {
          let newUpvotes = issue.upvotes;
          let newDownvotes = issue.downvotes;
          
          if (isUndoing) {
            // Undoing current vote
            if (type === 'up') {
              newUpvotes = Math.max(0, newUpvotes - 1);
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
            }
          } else if (isChanging) {
            // Changing vote type
            if (currentUserVote === 'up') {
              newUpvotes = Math.max(0, newUpvotes - 1);
              newDownvotes += 1;
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
              newUpvotes += 1;
            }
          } else {
            // New vote
            if (type === 'up') {
              newUpvotes += 1;
            } else {
              newDownvotes += 1;
            }
          }
          
          return {
            ...issue,
            upvotes: newUpvotes,
            downvotes: newDownvotes
          };
        }
        return issue;
      }));

      // Update user votes optimistically
      setUserVotes(prev => ({
        ...prev,
        [issueId]: isUndoing ? null : type
      }));

      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update vote');
      }

      const result = await response.json();
      
      // Update with server response
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId || issue._id === issueId) {
          return {
            ...issue,
            upvotes: result.upvotes,
            downvotes: result.downvotes
          };
        }
        return issue;
      }));
      
      setUserVotes(prev => ({
        ...prev,
        [issueId]: result.userVote
      }));
      
    } catch (error) {
      console.error('Error voting:', error);
      
      // Revert optimistic updates on error
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const issuesResponse = await fetch("http://localhost:5000/api/issues", { headers });
      const data = await issuesResponse.json();
      
      const votesMap: Record<string, 'up' | 'down' | null> = {};
      const safeIssues = (data.issues || []).map(issue => {
        const id = issue._id || issue.id;
        votesMap[id] = issue.userVote || null;
        
        return {
          ...issue,
          icon: issue.icon || "road",
          upvotes: typeof issue.upvotes === "number" ? issue.upvotes : 0,
          downvotes: typeof issue.downvotes === "number" ? issue.downvotes : 0,
          comments: typeof issue.comments === "number" ? issue.comments : 
            (Array.isArray(issue.comments) ? issue.comments.length : 0),
          timeAgo: issue.timeAgo || "recently",
          status: issue.status || "Received"
        };
      });
      
      setIssues(safeIssues);
      setUserVotes(votesMap);
      
      // Show error message
      alert(error.message || 'Failed to update vote');
    }
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
          {issues.map((issue) => {
            const issueId = issue._id || issue.id;
            return (
              <div key={issueId} onClick={() => navigate(`/issues/${issueId}`)} style={{ cursor: "pointer" }}>
                <IssueCard
                  issue={issue}
                  onVote={handleVote}
                  userVote={userVotes[issueId]}
                />
              </div>
            );
          })}
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
