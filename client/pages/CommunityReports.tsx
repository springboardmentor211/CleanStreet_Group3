import { useState } from "react";
import { Layout } from "@/components/Layout";
import { IssueCard, Issue } from "@/components/IssueCard";

// Mock data based on the Figma design
const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Pothole on main street causing traffic delays",
    description: "There's a massive pothole on main street near the intersection with Oak Avenue. It's been there for weeks and is causing serious damage to vehicles. Multiple cars have gotten flat tires.",
    location: "Main Street & Oak Avenue",
    timeAgo: "in 1 day",
    status: "received",
    upvotes: 4,
    downvotes: 1,
    comments: 0,
    icon: "road"
  },
  {
    id: "2", 
    title: "Broken streetlight creating safety hazard",
    description: "The streetlight at the intersection has been out for over a week. This creates a dangerous situation for pedestrians and drivers, especially during evening hours.",
    location: "Pine Street & 2nd Avenue", 
    timeAgo: "in 2 days",
    status: "received",
    upvotes: 2,
    downvotes: 0,
    comments: 0,
    icon: "road"
  },
  {
    id: "3",
    title: "Overflowing garbage bins attracting pests",
    description: "The garbage bins at the park have been overflowing for several days. This is attracting rats and other pests, creating an unsanitary environment for families.",
    location: "Central Park East Side",
    timeAgo: "in 3 days", 
    status: "in_progress",
    upvotes: 9,
    downvotes: 0,
    comments: 0,
    icon: "road"
  }
];

export default function CommunityReports() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);

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
            <IssueCard
              key={issue.id}
              issue={issue}
              onVote={handleVote}
            />
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
