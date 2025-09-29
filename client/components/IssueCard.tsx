import { MapPin, Clock, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  timeAgo?: string; // optional, deprecated
  createdAt: string; // ISO string or date string
  status: "Received" | "In Progress" | "Resolved" | "Closed";
  upvotes: number;
  downvotes: number;
  comments: number;
  icon: string;
  address?: string;
  _id?: string; // MongoDB ID
  votes?: number; // Legacy votes field
  voters?: string[]; // Array of user IDs who voted
}

interface IssueCardProps {
  issue: Issue;
  onVote: (e: React.MouseEvent, issueId: string, type: "up" | "down") => void;
}

const statusConfig = {
  "Received": {
    style: { backgroundColor: "#3b82f6" }, // Blue
    text: "text-white",
    label: "Received"
  },
  "In Progress": {
    style: { backgroundColor: "#f59e0b" }, // Amber
    text: "text-white", 
    label: "In Progress"
  },
  "Resolved": {
    style: { backgroundColor: "#059669" }, // Green
    text: "text-white",
    label: "Resolved"
  },
  "Closed": {
    style: { backgroundColor: "#6b7280" }, // Gray
    text: "text-white",
    label: "Closed"
  }
};

export function IssueCard({ issue, onVote }: IssueCardProps) {
  // Ensure status is properly cased to match our config
  const normalizedStatus = issue.status as keyof typeof statusConfig;
  const statusStyle = statusConfig[normalizedStatus] || {
    style: { backgroundColor: "#6b7280" }, // Gray fallback
    text: "text-white",
    label: issue.status || "Unknown"
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
            {issue.icon === "road" ? (
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="text-cs-blue-primary">
                <circle cx="15" cy="15" r="12" fill="currentColor" />
                <path d="M8 15h14M15 8v14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <div className="w-6 h-6 rounded-full bg-cs-blue-primary"></div>
            )}
          </div>
          <h3 className="text-white text-base sm:text-lg font-semibold max-w-[380px]">
            {issue.title}
          </h3>
        </div>
        <div 
          className={`px-3 sm:px-4 py-2 rounded-full self-start sm:self-auto`}
          style={statusStyle.style}
        >
          <span className={`text-base sm:text-lg font-semibold ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white text-base sm:text-lg leading-tight mb-6 text-center px-2 sm:px-4 truncate overflow-hidden whitespace-nowrap">
        {issue.description}
      </p>

      {/* Location and Time */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <MapPin className="w-7 h-7 text-white" />
          <span className="text-white text-lg sm:text-xl">{issue.address}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-7 h-7 text-white" />
          <span className="text-white text-lg sm:text-xl">{formatToHHMM(issue.createdAt)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white mb-6"></div>

      {/* Voting and Comments */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Upvotes */}
          <button
            onClick={(e) => onVote(e, issue.id || issue._id || '', "up")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            disabled={issue.voters?.includes('current-user')}
          >
            <ThumbsUp className="w-5 h-5 text-white" />
            <span className="text-white text-2xl font-bold">{issue.upvotes}</span>
          </button>

          {/* Downvotes */}
          <button
            onClick={(e) => onVote(e, issue.id || issue._id || '', "down")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            disabled={issue.voters?.includes('current-user')}
          >
            <ThumbsDown className="w-5 h-5 text-white" />
            <span className="text-white text-2xl  font-bold">{issue.downvotes}</span>
          </button>
        </div>

        {/* Comments */}
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white text-xl sm:text-[23px] font-normal">
            Comments ({issue.comments})
          </span>
        </div>
      </div>
    </div>
  );
}
