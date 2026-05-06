import type { Metadata } from "next";
import { StatTile } from "@/components/dashboard/StatTile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Overview" };

type CallRow = {
  endpoint: string;
  status: number;
  latency_ms: number | null;
  created_at: string;
};

type EndpointAgg = { endpoint: string; calls: number };

export default async function DashboardOverview() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // layout already redirects

  // Pull this month's usage rows (RLS limits to current user's rows).
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: usage } = await supabase
    .from("usage")
    .select("endpoint, status, latency_ms, created_at")
    .gte("created_at", startOfMonth.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  const calls = usage ?? [];
  const callCount = calls.length;
  const successCount = calls.filter((c) => c.status >= 200 && c.status < 300).length;
  const errorCount = calls.filter((c) => c.status >= 400).length;
  const avgLatency =
    callCount > 0
      ? Math.round(
          calls.reduce((sum, c) => sum + (c.latency_ms ?? 0), 0) / callCount,
        )
      : 0;
  const successRate =
    callCount > 0 ? ((successCount / callCount) * 100).toFixed(1) : "0.0";
  const errorRate = callCount > 0 ? ((errorCount / callCount) * 100).toFixed(1) : "0.0";

  // 7-day sparkline buckets (oldest → newest).
  const sparkline = buildSparkline(calls, 7);

  // Top endpoints by call count.
  const endpointMap = new Map<string, number>();
  for (const c of calls) {
    endpointMap.set(c.endpoint, (endpointMap.get(c.endpoint) ?? 0) + 1);
  }
  const topEndpoints: EndpointAgg[] = Array.from(endpointMap.entries())
    .map(([endpoint, count]) => ({ endpoint, calls: count }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 6);

  const recentActivity = calls.slice(0, 7);

  return (
    <div className="max-w-[1024px] mx-auto flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="font-bold m-0"
            style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Overview
          </h1>
          <p className="text-[14px] text-kno-text-gray mt-1.5">
            Free tier — usage resets monthly. Upgrade for unlimited calls.
          </p>
        </div>
        <select
          className="font-sans text-[13px] px-3 py-2 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
          defaultValue="7d"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="mtd">Month to date</option>
        </select>
      </header>

      {callCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Call volume"
              value={callCount.toLocaleString("en-US")}
              sparkline={sparkline}
            />
            <StatTile
              label="Success rate"
              value={`${successRate}%`}
              delta={{ value: "0.0%", positive: true }}
            />
            <StatTile
              label="Error rate"
              value={`${errorRate}%`}
              delta={{ value: "0.0%", positive: false }}
            />
            <StatTile
              label="Average latency"
              value={`${avgLatency} ms`}
              delta={{ value: "0 ms", positive: true }}
            />
          </div>

          <CallVolumeChart data={sparkline} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopEndpointsCard rows={topEndpoints} />
            <RecentActivityCard rows={recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}

function buildSparkline(rows: CallRow[], days: number): number[] {
  const buckets = new Array(days).fill(0);
  const now = new Date();
  const startMs = new Date(now);
  startMs.setHours(0, 0, 0, 0);
  startMs.setDate(startMs.getDate() - (days - 1));
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    const idx = Math.floor((t - startMs.getTime()) / (24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}

function CallVolumeChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-semibold text-[16px] m-0">Call volume</h2>
        <span className="font-mono text-[11px] text-kno-text-gray">last 7 days</span>
      </div>
      <div className="grid grid-cols-7 gap-2 items-end h-36">
        {data.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-full bg-kno-green rounded-kno-sm min-h-[2px]"
              style={{ height: `${(v / max) * 100}%` }}
              aria-label={`${v} calls`}
            />
            <span className="font-mono text-[10px] text-kno-text-gray">
              {dayLabel(i, data.length)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function dayLabel(idx: number, total: number): string {
  const date = new Date();
  date.setDate(date.getDate() - (total - 1 - idx));
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function TopEndpointsCard({ rows }: { rows: EndpointAgg[] }) {
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5">
      <h2 className="font-semibold text-[16px] m-0 mb-3">Top endpoints</h2>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-kno-text-gray font-mono text-[11px] uppercase tracking-[0.06em]">
            <th className="text-left font-semibold py-2">Endpoint</th>
            <th className="text-right font-semibold py-2">Calls</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-6 text-center text-kno-text-gray text-[13px]">
                No calls yet this period.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.endpoint} className="border-t border-kno-border-gray">
                <td className="py-2 font-mono text-kno-black">{r.endpoint}</td>
                <td className="py-2 text-right font-mono text-kno-black">
                  {r.calls.toLocaleString("en-US")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RecentActivityCard({ rows }: { rows: CallRow[] }) {
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5">
      <h2 className="font-semibold text-[16px] m-0 mb-3">Recent activity</h2>
      {rows.length === 0 ? (
        <p className="text-[13px] text-kno-text-gray">No recent calls.</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((r, i) => (
            <li
              key={`${r.created_at}-${i}`}
              className="flex items-center gap-3 py-2 border-t first:border-t-0 border-kno-border-gray text-[13px]"
            >
              <span className="font-mono text-kno-black">{r.endpoint}</span>
              <StatusBadge status={r.status} />
              {r.latency_ms != null && (
                <span className="font-mono text-[11px] text-kno-text-gray">
                  {r.latency_ms} ms
                </span>
              )}
              <span className="ml-auto font-mono text-[11px] text-kno-text-gray">
                {timeAgo(r.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  const ok = status >= 200 && status < 300;
  const warn = status >= 300 && status < 500;
  const bg = ok
    ? "bg-kno-success-mint text-kno-success-fg"
    : warn
      ? "bg-kno-warn-bg text-kno-warn-fg"
      : "bg-kno-error-bg text-[#B91C1C]";
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded-kno-sm font-mono text-[10px] font-semibold ${bg}`}>
      {status}
    </span>
  );
}

function timeAgo(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function EmptyState() {
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-10 text-center">
      <h2 className="font-semibold text-[20px] m-0 mb-2">No calls yet.</h2>
      <p className="text-[14px] text-kno-text-gray max-w-[480px] mx-auto mb-6">
        Once you create an API token and make your first request, you&apos;ll see usage,
        success rate, and latency here.
      </p>
      <a
        href="/dashboard/keys"
        className="inline-flex items-center gap-2 bg-kno-green text-kno-black px-4 py-2.5 rounded-kno-md font-semibold text-[14px] hover:bg-kno-green-hover transition-colors duration-kno-fast ease-kno-out"
      >
        Create your first token →
      </a>
    </div>
  );
}
