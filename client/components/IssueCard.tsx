import { MapPin, Clock, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  timeAgo?: string; // optional, deprecated
  createdAt: string; // ISO string or date string
  status: "Received" | "In Progress" | "Resolved" | "Closed" | "Open" | "Pending" | "Under Review" | "Assigned";
  upvotes: number;
  downvotes: number;
  comments: number | any[]; // Can be number or array of comment objects
  icon: string;
  address?: string;
  _id?: string; // MongoDB ID
  votes?: number; // Legacy votes field
  voters?: string[]; // Array of user IDs who voted
  userVote?: 'up' | 'down' | null; // Current user's vote
}

interface IssueCardProps {
  issue: Issue;
  onVote: (e: React.MouseEvent, issueId: string, type: "up" | "down") => void;
  userVote?: 'up' | 'down' | null;
}

const statusConfig = {
  "Received": {
    bgClass: "bg-blue-500 hover:bg-blue-600 transition-colors", // Blue for new issues
    textClass: "text-white",
    label: "Received"
  },
  "In Progress": {
    bgClass: "bg-orange-500 hover:bg-orange-600 transition-colors", // Orange for active work
    textClass: "text-white", 
    label: "In Progress"
  },
  "Resolved": {
    bgClass: "bg-green-500 hover:bg-green-600 transition-colors", // Green for completed
    textClass: "text-white",
    label: "Resolved"
  },
  "Closed": {
    bgClass: "bg-gray-600 hover:bg-gray-700 transition-colors", // Gray for closed
    textClass: "text-white",
    label: "Closed"
  },
  // Additional status variations that might come from backend
  "Open": {
    bgClass: "bg-blue-500 hover:bg-blue-600 transition-colors", // Same as Received
    textClass: "text-white",
    label: "Open"
  },
  "Pending": {
    bgClass: "bg-yellow-500 hover:bg-yellow-600 transition-colors", // Yellow for pending
    textClass: "text-white",
    label: "Pending"
  },
  "Under Review": {
    bgClass: "bg-purple-500 hover:bg-purple-600 transition-colors", // Purple for review
    textClass: "text-white",
    label: "Under Review"
  },
  "Assigned": {
    bgClass: "bg-indigo-500 hover:bg-indigo-600 transition-colors", // Indigo for assigned
    textClass: "text-white",
    label: "Assigned"
  }
};

export function IssueCard({ issue, onVote, userVote }: IssueCardProps) {
  // Ensure status is properly cased to match our config
  const normalizedStatus = issue.status as keyof typeof statusConfig;
  const statusStyle = statusConfig[normalizedStatus] || {
    bgClass: "bg-gray-500", // Gray fallback
    textClass: "text-white",
    label: issue.status || "Unknown"
  };

  // Ensure we have safe values for all fields
  const safeIssue = {
    ...issue,
    title: issue.title || "Untitled Issue",
    description: issue.description || "No description available",
    address: issue.address || issue.location || "Location not specified",
    upvotes: Number(issue.upvotes) || 0,
    downvotes: Number(issue.downvotes) || 0,
    createdAt: issue.createdAt || new Date().toISOString()
  };

  // Helper to format createdAt as hh:mm (24-hour)
  function formatToHHMM(createdAt: string): string {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return createdAt;
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return (
    <div className="w-full max-w-[640px] border border-white/30 rounded-cs-card bg-background p-4 sm:p-6">
      {/* Header with icon, title, and status */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-cs-blue-light flex items-center justify-center">
            {(issue.icon === "road" || !issue.icon) ? (
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="text-cs-blue-primary">
                <circle cx="15" cy="15" r="12" fill="currentColor" />
                <path d="M8 15h14M15 8v14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <div className="w-6 h-6 rounded-full bg-cs-blue-primary"></div>
            )}
          </div>
          <h3 className="text-white text-base sm:text-lg font-semibold max-w-[380px]">
            {safeIssue.title}
          </h3>
        </div>
        <div 
          className={`px-4 sm:px-5 py-2.5 rounded-full self-start sm:self-auto shadow-lg ${statusStyle.bgClass}`}
        >
          <span className={`text-sm sm:text-base font-bold ${statusStyle.textClass}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white text-base sm:text-lg leading-tight mb-6 text-center px-2 sm:px-4 truncate overflow-hidden whitespace-nowrap">
        {safeIssue.description}
      </p>

      {/* Location and Time */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <MapPin className="w-7 h-7 text-white" />
          <span className="text-white text-lg sm:text-xl">{safeIssue.address}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-7 h-7 text-white" />
          <span className="text-white text-lg sm:text-xl">{formatToHHMM(safeIssue.createdAt)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white mb-6"></div>

      {/* Voting and Comments */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Upvotes */}
          <button
            onClick={(e) => onVote(e, issue.id || issue._id || '', "up")}
            className={`flex items-center space-x-1 transition-all ${
              userVote === 'up' 
                ? 'text-green-400 scale-105' 
                : 'text-white hover:text-green-300'
            }`}
            title={userVote === 'up' ? 'Click to undo your upvote' : 'Click to upvote'}
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold">{safeIssue.upvotes}</span>
          </button>

          {/* Downvotes */}
          <button
            onClick={(e) => onVote(e, issue.id || issue._id || '', "down")}
            className={`flex items-center space-x-1 transition-all ${
              userVote === 'down' 
                ? 'text-orange-400 scale-105' 
                : 'text-white hover:text-orange-300'
            }`}
            title={userVote === 'down' ? 'Click to undo your downvote' : 'Click to downvote'}
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold">{safeIssue.downvotes}</span>
          </button>
        </div>

        {/* Comments */}
        <div className="flex items-center space-x-1">
          <MessageCircle className="w-4 h-4 text-white" />
          <span className="text-white text-sm">
            {Array.isArray(issue.comments) ? issue.comments.length : issue.comments || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
