import { MapPin, Clock, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  status: "received" | "in_progress" | "resolved";
  upvotes: number;
  downvotes: number;
  comments: number;
  icon: string;
}

interface IssueCardProps {
  issue: Issue;
  onVote: (issueId: string, type: "up" | "down") => void;
}

const statusConfig = {
  received: {
    bg: "bg-cs-blue-primary",
    text: "text-white",
    label: "Received"
  },
  in_progress: {
    bg: "bg-yellow-600",
    text: "text-white", 
    label: "In Progress"
  },
  resolved: {
    bg: "bg-green-600",
    text: "text-white",
    label: "Resolved"
  }
};

export function IssueCard({ issue, onVote }: IssueCardProps) {
  const statusStyle = statusConfig[issue.status] || {
    bg: "bg-cs-blue-primary",
    text: "text-white",
    label: issue.status || "Received"
  };

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
        <div className={`px-3 sm:px-4 py-2 rounded-full ${statusStyle.bg} self-start sm:self-auto`}>
          <span className={`text-base sm:text-lg font-semibold ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white text-base sm:text-lg leading-tight mb-6 text-center px-2 sm:px-4">
        {issue.description}
      </p>

      {/* Location and Time */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <MapPin className="w-7 h-7 text-white" />
          <span className="text-white text-lg sm:text-xl">{issue.location}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-7 h-7 text-white" />
          <span className="text-white text-lg sm:text-xl">{issue.timeAgo}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white mb-6"></div>

      {/* Voting and Comments */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Upvotes */}
          <button
            onClick={() => onVote(issue.id, "up")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <ThumbsUp className="w-5 h-5 text-white" />
            <span className="text-white text-2xl font-bold">{issue.upvotes}</span>
          </button>

          {/* Downvotes */}
          <button
            onClick={() => onVote(issue.id, "down")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
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
