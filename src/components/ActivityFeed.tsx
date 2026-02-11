"use client";

import { useState, useEffect, useCallback } from "react";

interface Activity {
  id: number;
  timestamp: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, string>;
}

const typeColors: Record<string, string> = {
  message: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tool: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cron: "bg-green-500/20 text-green-400 border-green-500/30",
  heartbeat: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeIcons: Record<string, string> = {
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
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("type", filter);

      const res = await fetch(`/api/activities?${params}`);
      if (!res.ok) throw new Error("Failed to fetch activities");

      const data = await res.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchActivities();
    // Poll every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {["all", "message", "tool", "cron", "heartbeat", "error"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {f === "all"
              ? "All"
              : `${typeIcons[f] || "📋"} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
        <button
          onClick={fetchActivities}
          className="px-3 py-1.5 text-sm rounded-lg border bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] ml-auto"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-[var(--muted)]">
          Loading activities...
        </div>
      )}

      {/* Activity list */}
      {!loading && (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--card-hover)] transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-1 text-xs rounded border ${
                    typeColors[activity.type] || typeColors.tool
                  }`}
                >
                  {typeIcons[activity.type] || "📋"} {activity.type}
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
                  {activity.metadata &&
                    Object.keys(activity.metadata).length > 0 && (
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
      )}

      {!loading && activities.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <p>No activities yet</p>
          <p className="text-sm mt-2">
            Activities will appear here when OpenClaw sends them via webhook
          </p>
        </div>
      )}
    </div>
  );
}
