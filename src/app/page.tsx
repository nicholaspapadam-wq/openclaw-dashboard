"use client";

import { useState } from "react";
import ActivityFeed from "@/components/ActivityFeed";
import Calendar from "@/components/Calendar";
import Search from "@/components/Search";

type Tab = "activity" | "calendar" | "search";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "activity", label: "Activity Feed", icon: "📊" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "search", label: "Search", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦞</span>
            <h1 className="text-xl font-semibold text-[var(--foreground)]">
              OpenClaw Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
            <span className="text-sm text-[var(--muted)]">Connected</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[var(--border)] px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? "border-[var(--accent)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "activity" && <ActivityFeed />}
        {activeTab === "calendar" && <Calendar />}
        {activeTab === "search" && <Search />}
      </main>
    </div>
  );
}
