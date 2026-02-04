"use client";

import { useState, useEffect } from "react";
import LiveStream from "@/components/LiveStream";
import Reports from "@/components/Reports";

type Tab = "live-stream" | "reports";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("live-stream");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 630 630"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M243.685 357.291C217.617 357.291 200.682 343.714 197.965 304.971V95.4061H0V315.367H0.289V359.507C0.289 483.462 69.36 536.18 177.908 536.18C372.001 536.18 627.535 385.298 627.535 95.4061H426.795C426.795 281.85 301.889 357.291 243.685 357.291Z"
                fill="currentColor"
              />
            </svg>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Veya Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-muted hover:text-foreground transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
              <TabButton
                label="Live Stream"
                active={activeTab === "live-stream"}
                onClick={() => setActiveTab("live-stream")}
              />
              <TabButton
                label="Reports"
                active={activeTab === "reports"}
                onClick={() => setActiveTab("reports")}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {activeTab === "live-stream" ? "Live Stream" : "Reports"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {activeTab === "live-stream"
              ? "Real-time event feed from your analytics"
              : "Browse and view analytics reports"}
          </p>
        </div>

        {activeTab === "live-stream" ? <LiveStream /> : <Reports />}
      </main>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
