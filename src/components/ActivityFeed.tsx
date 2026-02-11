"use client";

import { useState, useEffect } from "react";

interface Activity {
  id: string;
  timestamp: string;
  type: "message" | "tool" | "cron" | "heartbeat" | "error";
  title: string;
  description?: string;
  metadata?: Record<string, string>;
}

// Mock data - will be replaced with real API calls
const mockActivities: Activity[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    type: "heartbeat",
    title: "Heartbeat Check",
    description: "HEARTBEAT_OK - All systems normal",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: "cron",
    title: "Cron: defendant-codebase-sync",
    description: "Daily codebase sync completed successfully",
    metadata: { duration: "48s", status: "ok" },
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "message",
    title: "WhatsApp Message",
    description: "Received message from Nick (+17868607754)",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: "tool",
    title: "Tool: web_search",
    description: "Searched for: Miami weather forecast",
    metadata: { results: "5" },
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: "cron",
    title: "Cron: sofia-daily-affirmation",
    description: "Sent daily affirmation to Sofia",
    metadata: { duration: "15s", status: "ok" },
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: "error",
    title: "Cron Error: nick-email-rollup",
    description: "model not allowed: anthropic/claude-sonnet-4-5",
    metadata: { status: "error" },
  },
];

const typeColors: Record<Activity["type"], string> = {
  message: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tool: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cron: "bg-green-500/20 text-green-400 border-green-500/30",
  heartbeat: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeIcons: Record<Activity["type"], string> = {
  message: "💬",
  tool: "🔧",
  cron: "⏰",
  heartbeat: "💓",
  error: "❌",
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<Activity["type"] | "all">("all");

  useEffect(() => {
    // TODO: Replace with real API call to OpenClaw
    setActivities(mockActivities);
  }, []);

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {["all", "message", "tool", "cron", "heartbeat", "error"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as Activity["type"] | "all")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {f === "all" ? "All" : `${typeIcons[f as Activity["type"]]} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--card-hover)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className={`px-2 py-1 text-xs rounded border ${typeColors[activity.type]}`}>
                {typeIcons[activity.type]} {activity.type}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-[var(--foreground)] truncate">
                    {activity.title}
                  </h3>
                  <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                {activity.description && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {activity.description}
                  </p>
                )}
                {activity.metadata && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 text-xs bg-[var(--background)] rounded text-[var(--muted)]"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          No activities found
        </div>
      )}
    </div>
  );
}
