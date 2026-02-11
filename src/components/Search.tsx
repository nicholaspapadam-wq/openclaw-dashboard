"use client";

import { useState } from "react";

interface SearchResult {
  id: string;
  path: string;
  line?: number;
  snippet: string;
  score: number;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);

    // TODO: Replace with real API call to OpenClaw memory_search
    // Simulating search delay
    await new Promise((r) => setTimeout(r, 500));

    // Mock results
    const mockResults: SearchResult[] = query.toLowerCase().includes("nick")
      ? [
          {
            id: "1",
            path: "MEMORY.md",
            line: 15,
            snippet: "**Name:** Nick Papadam\n**Email:** npapadam@me.com",
            score: 0.95,
          },
          {
            id: "2",
            path: "memory/2026-02-10.md",
            line: 45,
            snippet: "Nick requested premium rebuild of Lennar presentation",
            score: 0.82,
          },
          {
            id: "3",
            path: "USER.md",
            line: 3,
            snippet: "**Name:** Nicholas Papadam\n**What to call them:** Nick",
            score: 0.78,
          },
        ]
      : query.toLowerCase().includes("defendant")
      ? [
          {
            id: "4",
            path: "MEMORY.md",
            line: 120,
            snippet: "**Defendant Deployment (CRITICAL)**\nONLY ONE VERCEL PROJECT: defendant_production → app.papacorporation.com",
            score: 0.94,
          },
          {
            id: "5",
            path: "memory/knowledge/projects/defendant-index.md",
            line: 1,
            snippet: "# Defendant - Email Security SaaS\n72+ threat detections across 10 categories",
            score: 0.91,
          },
        ]
      : [
          {
            id: "6",
            path: "MEMORY.md",
            line: 1,
            snippet: `No strong matches for "${query}" - try different keywords`,
            score: 0.3,
          },
        ];

    setResults(mockResults);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search memory files, sessions, and more..."
            className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* Quick suggestions */}
      {!hasSearched && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {["Nick", "Sofia", "Defendant", "Elite Sales", "Valentine's Day", "Lennar"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setTimeout(() => {
                      setQuery(suggestion);
                      handleSearch();
                    }, 100);
                  }}
                  className="px-3 py-1.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </p>
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--card-hover)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)]">📄</span>
                    <span className="font-mono text-sm text-[var(--foreground)]">
                      {result.path}
                      {result.line && (
                        <span className="text-[var(--muted)]">:{result.line}</span>
                      )}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      result.score > 0.8
                        ? "bg-green-500/20 text-green-400"
                        : result.score > 0.5
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {Math.round(result.score * 100)}%
                  </span>
                </div>
                <pre className="text-sm text-[var(--muted)] whitespace-pre-wrap font-mono bg-[var(--background)] rounded p-3 overflow-x-auto">
                  {result.snippet}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
