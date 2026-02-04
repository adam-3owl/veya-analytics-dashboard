"use client";

import { useEffect, useState, useRef } from "react";

const API_BASE = "/api";

interface LiveEvent {
  tenant_id: string;
  event_name: string;
  session_id: string;
  product_name: string | null;
  cart_value: number | null;
  device_type: string | null;
  page_url: string | null;
  event_timestamp: string;
  [key: string]: any;
}

function normalizeKeys(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[key.toLowerCase()] = obj[key];
  }
  return result;
}

function formatEventName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

const eventColors: Record<string, string> = {
  session_start: "text-blue-400",
  add_to_cart: "text-amber-400",
  checkout_start: "text-purple-400",
  checkout_complete: "text-emerald-400",
  product_view: "text-cyan-400",
  search: "text-orange-400",
};

export default function LiveStream() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [paused, setPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/v1/dashboard/recent-events`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = (json.data || []).map(normalizeKeys) as LiveEvent[];
      setEvents(rows);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    if (!paused) {
      intervalRef.current = setInterval(fetchEvents, 30000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                paused ? "bg-yellow-400" : "bg-emerald-400 animate-pulse"
              }`}
            />
            <span className="text-sm text-muted">
              {paused ? "Paused" : "Live"}
            </span>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchEvents(); }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-hover"
          >
            Refresh
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-hover"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-muted">Tenant</th>
              <th className="px-4 py-3 font-medium text-muted">Platform</th>
              <th className="px-4 py-3 font-medium text-muted">Event</th>
              <th className="hidden px-4 py-3 font-medium text-muted sm:table-cell">
                Session
              </th>
              <th className="hidden px-4 py-3 font-medium text-muted md:table-cell">
                Body
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No events yet
                </td>
              </tr>
            ) : (
              events.map((event, i) => (
                <tr
                  key={`${event.session_id}-${event.event_timestamp}-${i}`}
                  onClick={() => setSelectedEvent(event)}
                  className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-surface-hover"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {event.tenant_id}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {event.platform === "app" ? "App" : "Web"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        eventColors[event.event_name] || "text-foreground"
                      }`}
                    >
                      {formatEventName(event.event_name)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">
                    {event.session_id?.slice(0, 8)}...
                  </td>
                  <td className="hidden max-w-xs truncate px-4 py-3 font-mono text-xs text-muted md:table-cell">
                    {JSON.stringify(event)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted whitespace-nowrap">
                    {formatTime(event.event_timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <SidePanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function SidePanel({
  event,
  onClose,
}: {
  event: LiveEvent;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">
              {formatEventName(event.event_name)}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Tenant {event.tenant_id} &middot; {event.event_timestamp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-sm text-foreground">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}
