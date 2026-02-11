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

function formatCronExpression(expr: string): string {
  const parts = expr.split(" ");
  if (parts.length < 5) return expr;

  const [min, hour, , , dow] = parts;

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
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCronJobs = async () => {
    try {
      const res = await fetch("/api/cron");
      if (!res.ok) throw new Error("Failed to fetch cron jobs");

      const data = await res.json();
      setJobs(data.jobs || []);
      setCapturedAt(data.captured_at);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCronJobs();
  }, []);

  const sortedJobs = [...jobs].sort((a, b) => {
    const aNext = a.state?.nextRunAtMs ?? Infinity;
    const bNext = b.state?.nextRunAtMs ?? Infinity;
    return aNext - bNext;
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        Loading cron jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Scheduled Tasks</h2>
          {capturedAt && (
            <p className="text-sm text-[var(--muted)]">
              Last synced: {new Date(capturedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchCronJobs}
          className="px-3 py-1.5 text-sm rounded-lg border bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {jobs.length}
          </div>
          <div className="text-sm text-[var(--muted)]">Total Jobs</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--success)]">
            {jobs.filter((j) => j.enabled && j.state?.lastStatus === "ok").length}
          </div>
          <div className="text-sm text-[var(--muted)]">Healthy</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--error)]">
            {jobs.filter((j) => j.state?.lastStatus === "error").length}
          </div>
          <div className="text-sm text-[var(--muted)]">Errors</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-2xl font-bold text-[var(--muted)]">
            {jobs.filter((j) => !j.enabled).length}
          </div>
          <div className="text-sm text-[var(--muted)]">Disabled</div>
        </div>
      </div>

      {/* Job list */}
      {sortedJobs.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <p>No cron jobs synced yet</p>
          <p className="text-sm mt-2">
            Run the sync script to populate this data
          </p>
        </div>
      ) : (
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
                    <span>
                      ⏰{" "}
                      {job.schedule.expr
                        ? formatCronExpression(job.schedule.expr)
                        : job.schedule.kind}
                    </span>
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
                          {" "}
                          ({formatDuration(job.state.lastDurationMs)})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
