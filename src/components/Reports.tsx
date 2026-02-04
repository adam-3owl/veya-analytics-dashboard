"use client";

import { useEffect, useState } from "react";

const API_BASE = "/api";

function normalizeKeys(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[key.toLowerCase()] = obj[key];
  }
  return result;
}

function normalizeData(data: any): any {
  if (Array.isArray(data)) return data.map(normalizeKeys);
  if (data && typeof data === "object") return normalizeKeys(data);
  return data;
}

interface Report {
  id: string;
  name: string;
  endpoint: string;
  chart_type: string;
  refresh_interval: number;
}

interface ReportData {
  report: string;
  tenant_id: string;
  cached: boolean;
  generated_at: string;
  filters: {
    start_date: string;
    end_date: string;
    store_id: string | null;
  };
  data: any;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(`${API_BASE}/v1/dashboard/reports`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setReports(json.reports || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const openReport = async (report: Report) => {
    setActiveReport(report);
    setReportLoading(true);
    setReportError(null);
    setReportData(null);

    try {
      const res = await fetch(
        `${API_BASE}${report.endpoint}?tenant_id=1`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ReportData = await res.json();
      json.data = normalizeData(json.data);
      setReportData(json);
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "Failed to fetch report data"
      );
    } finally {
      setReportLoading(false);
    }
  };

  const goBack = () => {
    setActiveReport(null);
    setReportData(null);
    setReportError(null);
  };

  if (activeReport) {
    return (
      <ReportDetail
        report={activeReport}
        data={reportData}
        loading={reportLoading}
        error={reportError}
        onBack={goBack}
      />
    );
  }

  return (
    <ReportList
      reports={reports}
      loading={loading}
      error={error}
      onSelect={openReport}
    />
  );
}

function ReportList({
  reports,
  loading,
  error,
  onSelect,
}: {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onSelect: (report: Report) => void;
}) {
  const chartTypeLabel: Record<string, string> = {
    stat_cards: "KPI Cards",
    funnel: "Funnel",
    bar_chart: "Bar Chart",
    line_chart: "Line Chart",
    pie_chart: "Pie Chart",
    table: "Table",
    event_feed: "Live Feed",
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-muted">Report</th>
              <th className="hidden px-4 py-3 font-medium text-muted sm:table-cell">
                Type
              </th>
              <th className="hidden px-4 py-3 font-medium text-muted md:table-cell">
                Refresh
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  Loading reports...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  No reports available
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-surface-hover"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelect(report)}
                      className="font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      {report.name}
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
                    <span className="rounded-md bg-surface-hover px-2 py-0.5 text-xs">
                      {chartTypeLabel[report.chart_type] || report.chart_type}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {report.refresh_interval}s
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelect(report)}
                      className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      View &rarr;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportDetail({
  report,
  data,
  loading,
  error,
  onBack,
}: {
  report: Report;
  data: ReportData | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Reports
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-bold">{report.name}</h3>
        {data && (
          <p className="mt-1 text-sm text-muted">
            {data.filters.start_date} &mdash; {data.filters.end_date}
            {data.cached && (
              <span className="ml-2 rounded-md bg-surface-hover px-2 py-0.5 text-xs">
                cached
              </span>
            )}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted">Loading report data...</div>
      ) : data ? (
        <DataTable data={data.data} chartType={report.chart_type} />
      ) : null}
    </div>
  );
}

function DataTable({
  data,
  chartType,
}: {
  data: any;
  chartType: string;
}) {
  // If data is a single object (stat_cards, funnel), display as key-value pairs
  if (data && !Array.isArray(data)) {
    const entries = Object.entries(data).filter(
      ([, v]) => v !== null && v !== undefined
    );
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-muted">Metric</th>
              <th className="px-4 py-3 text-right font-medium text-muted">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value]) => (
              <tr
                key={key}
                className="border-b border-border last:border-0 transition-colors hover:bg-surface-hover"
              >
                <td className="px-4 py-3 text-foreground">
                  {formatKey(key)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatValue(key, value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // If data is an array, display as a table with columns from the first row
  if (Array.isArray(data) && data.length > 0) {
    const columns = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-medium text-muted whitespace-nowrap">
                  {formatKey(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 transition-colors hover:bg-surface-hover"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-3 font-mono text-foreground whitespace-nowrap"
                  >
                    {formatValue(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="py-12 text-center text-muted">No data available</div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(key: string, value: any): string {
  if (value === null || value === undefined) return "—";
  const k = key.toLowerCase();
  if (typeof value === "number") {
    if (k.includes("rate") || k.includes("conversion")) {
      return `${value.toFixed(1)}%`;
    }
    if (k.includes("revenue") || k.includes("value") || k.includes("amount") || k.includes("subtotal") || k.includes("price")) {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString();
  }
  return String(value);
}
