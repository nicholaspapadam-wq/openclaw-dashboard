"use client";

import { useState, useEffect } from "react";

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: "cron" | "at" | "every";
    expr?: string;
    tz?: string;
  };
  sessionTarget: "main" | "isolated";
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: "ok" | "error";
    lastDurationMs?: number;
    consecutiveErrors?: number;
    lastError?: string;
  };
  delivery?: {
    mode: string;
    channel?: string;
    to?: string;
  };
}

// This will be populated via API route that connects to OpenClaw
const mockJobs: CronJob[] = [
  {
    id: "1",
    name: "nick-daily-health-checkin",
    enabled: true,
    schedule: { kind: "cron", expr: "0 7 * * *", tz: "America/New_York" },
    sessionTarget: "isolated",
    state: {
      nextRunAtMs: Date.now() + 1000 * 60 * 60 * 8,
      lastRunAtMs: Date.now() - 1000 * 60 * 60 * 16,
      lastStatus: "error",
      consecutiveErrors: 2,
      lastError: "model not allowed: anthropic/claude-sonnet-4-5",
    },
    delivery: { mode: "announce", channel: "whatsapp", to: "+17868607754" },
  },
  {
    id: "2",
    name: "sofia-daily-affirmation",
    enabled: true,
    schedule: { kind: "cron", expr: "0 7 * * *", tz: "America/New_York" },
    sessionTarget: "isolated",
    state: {
      nextRunAtMs: Date.now() + 1000 * 60 * 60 * 8,
      lastRunAtMs: Date.now() - 1000 * 60 * 60 * 16,
      lastStatus: "ok",
      lastDurationMs: 15647,
    },
    delivery: { mode: "announce", channel: "whatsapp", to: "+13057535906" },
  },
  {
    id: "3",
    name: "defendant-codebase-sync",
    enabled: true,
    schedule: { kind: "cron", expr: "0 22 * * *", tz: "America/New_York" },
    sessionTarget: "isolated",
    state: {
      nextRunAtMs: Date.now() + 1000 * 60 * 60 * 2,
      lastRunAtMs: Date.now() - 1000 * 60 * 60 * 22,
      lastStatus: "ok",
      lastDurationMs: 48311,
    },
    delivery: { mode: "announce" },
  },
  {
    id: "4",
    name: "friday-weekly-review",
    enabled: true,
    schedule: { kind: "cron", expr: "0 17 * * 5" },
    sessionTarget: "isolated",
    state: {
      nextRunAtMs: Date.now() + 1000 * 60 * 60 * 24 * 4,
    },
    delivery: { mode: "announce", channel: "whatsapp", to: "+17868607754" },
  },
];

function formatCronExpression(expr: string): string {
  // Basic cron expression to human readable
  const parts = expr.split(" ");
  if (parts.length < 5) return expr;
  
  const [min, hour, dom, mon, dow] = parts;
  
  // Common patterns
  if (dow === "1-5" && hour !== "*" && min === "0") {
    return `Weekdays at ${hour}:00`;
  }
  if (dow === "5" && hour !== "*" && min === "0") {
    return `Fridays at ${hour}:00`;
  }
  if (dow === "0" && hour !== "*" && min === "0") {
    return `Sundays at ${hour}:00`;
  }
  if (dow === "*" && hour !== "*" && min === "0") {
    return `Daily at ${hour}:00`;
  }
  
  return expr;
}

function formatRelativeTime(ms: number): string {
  const now = Date.now();
  const diff = ms - now;
  const absDiff = Math.abs(diff);
  
  const mins = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  
  const prefix = diff < 0 ? "" : "in ";
  const suffix = diff < 0 ? " ago" : "";
  
  if (days > 0) return `${prefix}${days}d${suffix}`;
  if (hours > 0) return `${prefix}${hours}h${suffix}`;
  if (mins > 0) return `${prefix}${mins}m${suffix}`;
  return "now";
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export default function Calendar() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [view, setView] = useState<"list" | "timeline">("list");

  useEffect(() => {
    // TODO: Replace with real API call to OpenClaw
    setJobs(mockJobs);
  }, []);

  const sortedJobs = [...jobs].sort((a, b) => {
    const aNext = a.state?.nextRunAtMs ?? Infinity;
    const bNext = b.state?.nextRunAtMs ?? Infinity;
    return aNext - bNext;
  });

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Scheduled Tasks</h2>
        <div className="flex gap-1 bg-[var(--card)] border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === "list"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === "timeline"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--foreground)]">{jobs.length}</div>
          <div className="text-sm text-[var(--muted)]">Total Jobs</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--success)]">
            {jobs.filter(j => j.enabled && j.state?.lastStatus === "ok").length}
          </div>
          <div className="text-sm text-[var(--muted)]">Healthy</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--error)]">
            {jobs.filter(j => j.state?.lastStatus === "error").length}
          </div>
          <div className="text-sm text-[var(--muted)]">Errors</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--muted)]">
            {jobs.filter(j => !j.enabled).length}
          </div>
          <div className="text-sm text-[var(--muted)]">Disabled</div>
        </div>
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {sortedJobs.map((job) => (
          <div
            key={job.id}
            className={`bg-[var(--card)] border rounded-lg p-4 transition-colors ${
              job.state?.lastStatus === "error"
                ? "border-red-500/30"
                : "border-[var(--border)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !job.enabled
                        ? "bg-gray-500"
                        : job.state?.lastStatus === "error"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                  <h3 className="font-medium text-[var(--foreground)] truncate">
                    {job.name}
                  </h3>
                  <span className="px-2 py-0.5 text-xs rounded bg-[var(--background)] text-[var(--muted)]">
                    {job.sessionTarget}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                  <span>⏰ {job.schedule.expr ? formatCronExpression(job.schedule.expr) : job.schedule.kind}</span>
                  {job.schedule.tz && <span>🌍 {job.schedule.tz}</span>}
                  {job.delivery?.channel && (
                    <span>📱 {job.delivery.channel}</span>
                  )}
                </div>

                {job.state?.lastError && (
                  <div className="mt-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                    {job.state.lastError}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                {job.state?.nextRunAtMs && (
                  <div className="text-sm">
                    <span className="text-[var(--muted)]">Next: </span>
                    <span className="text-[var(--foreground)]">
                      {formatRelativeTime(job.state.nextRunAtMs)}
                    </span>
                  </div>
                )}
                {job.state?.lastRunAtMs && (
                  <div className="text-sm">
                    <span className="text-[var(--muted)]">Last: </span>
                    <span className="text-[var(--foreground)]">
                      {formatRelativeTime(job.state.lastRunAtMs)}
                    </span>
                    {job.state.lastDurationMs && (
                      <span className="text-[var(--muted)]">
                        {" "}({formatDuration(job.state.lastDurationMs)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
