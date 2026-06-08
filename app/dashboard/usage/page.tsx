import type { Metadata } from "next";
import { StatTile } from "@/components/dashboard/StatTile";
import { UpgradeButton } from "@/components/dashboard/UpgradeButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Usage" };
export const dynamic = "force-dynamic";

const FREE_QUOTA = 20;

// Endpoints a free tier may call. Mirror of FREE_TIER_ENDPOINTS in the API
// (useknockout-api/main.py) — keep in sync. Anything else is paid-only.
const FREE_ENDPOINTS = new Set([
  "/remove",
  "/remove-url",
  "/replace-bg",
  "/mask",
  "/smart-crop",
  "/outline",
  "/sticker",
  "/compare",
  "/preview",
]);

type CallRow = { endpoint: string; created_at: string };
type EndpointAgg = { endpoint: string; calls: number };

export default async function UsagePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // layout already redirects

  const { data: profile } = await supabase
    .from("users")
    .select("tier")
    .eq("id", user.id)
    .single();
  const tier = (profile?.tier ?? "free") as string;
  const isFree = tier === "free";

  // Month window.
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  // Accurate month count (not truncated by row limit), matching billing page.
  const { count: monthCount } = await supabase
    .from("usage")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());
  const used = monthCount ?? 0;

  // Rows for the daily chart + per-endpoint share.
  const { data: usage } = await supabase
    .from("usage")
    .select("endpoint, created_at")
    .gte("created_at", startOfMonth.toISOString())
    .order("created_at", { ascending: false })
    .limit(1000);
  const calls = (usage ?? []) as CallRow[];

  // Daily buckets across the full month (future days stay 0, shown as ghosts).
  const daily = new Array(daysInMonth).fill(0);
  for (const c of calls) {
    const d = new Date(c.created_at).getDate() - 1;
    if (d >= 0 && d < daysInMonth) daily[d]++;
  }
  const busiestDay = daily.length ? Math.max(...daily) : 0;
  const dailyAvg = dayOfMonth > 0 ? used / dayOfMonth : 0;
  const projected = Math.round(dailyAvg * daysInMonth);

  // Per-endpoint share.
  const map = new Map<string, number>();
  for (const c of calls) map.set(c.endpoint, (map.get(c.endpoint) ?? 0) + 1);
  const breakdown: EndpointAgg[] = Array.from(map.entries())
    .map(([endpoint, count]) => ({ endpoint, calls: count }))
    .sort((a, b) => b.calls - a.calls);
  const maxEndpoint = breakdown.length ? breakdown[0].calls : 1;

  const pct = Math.min(100, Math.round((used / FREE_QUOTA) * 100));
  const reached = isFree && used >= FREE_QUOTA;
  const willExceed = isFree && !reached && projected > FREE_QUOTA;
  const resetLabel = nextMonth.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="max-w-[1024px] mx-auto flex flex-col gap-6">
      <header>
        <h1
          className="font-bold m-0"
          style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          Usage
        </h1>
        <p className="text-[14px] text-kno-text-gray mt-1.5">
          {isFree
            ? `Free tier — ${FREE_QUOTA} images per month, resets ${resetLabel}.`
            : `${tier === "volume" ? "Volume" : "Pay-as-you-go"} — billed per image, no monthly cap.`}
        </p>
      </header>

      {/* Quota / consumption card */}
      <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-2">
              Images this month
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold" style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {used.toLocaleString("en-US")}
              </span>
              <span className="text-[14px] text-kno-text-gray font-mono">
                {isFree ? `/ ${FREE_QUOTA}` : "/ ∞"}
              </span>
            </div>
          </div>
          {reached && <UpgradeButton tier="payg" />}
        </div>

        {isFree ? (
          <div className="mt-5">
            <div className="h-2.5 w-full rounded-full bg-kno-surface-gray overflow-hidden">
              <div
                className={`h-full rounded-full ${reached ? "bg-kno-error-red" : "bg-kno-green"}`}
                style={{ width: `${pct}%` }}
                aria-label={`${pct}% of monthly quota used`}
              />
            </div>
            <p className="text-[13px] text-kno-text-gray mt-2">
              {reached ? (
                <>
                  Monthly quota reached. New requests return{" "}
                  <code className="code-chip">402</code> until {resetLabel}, or add a card to
                  continue instantly.
                </>
              ) : willExceed ? (
                <>
                  {used} of {FREE_QUOTA} used · at this pace you&apos;ll hit the cap before{" "}
                  {resetLabel} (projected ~{projected}). Add a card to avoid interruptions.
                </>
              ) : (
                <>
                  {used} of {FREE_QUOTA} used · {FREE_QUOTA - used} remaining · resets {resetLabel}
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-kno-text-gray mt-4">
            No monthly cap on your plan. See{" "}
            <a className="text-kno-black underline hover:text-kno-green" href="/dashboard/billing">
              Billing
            </a>{" "}
            for estimated spend and invoices.
          </p>
        )}
      </section>

      {used === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatTile
              label={isFree ? "Projected month-end" : "Projected total"}
              value={projected.toLocaleString("en-US")}
            />
            <StatTile label="Busiest day" value={busiestDay.toLocaleString("en-US")} />
            <StatTile label="Daily average" value={dailyAvg.toFixed(1)} />
          </div>

          <MonthChart daily={daily} dayOfMonth={dayOfMonth} />

          <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5">
            <h2 className="font-semibold text-[16px] m-0 mb-3">Where your images go</h2>
            <ul className="flex flex-col gap-2.5">
              {breakdown.map((r) => {
                const isFreeEp = FREE_ENDPOINTS.has(r.endpoint);
                return (
                  <li key={r.endpoint} className="flex items-center gap-3 text-[13px]">
                    <span className="font-mono text-kno-black w-[140px] shrink-0 truncate">
                      {r.endpoint}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-kno-sm shrink-0 ${
                        isFreeEp
                          ? "bg-kno-green-soft text-kno-black"
                          : "bg-kno-surface-gray text-kno-text-gray"
                      }`}
                    >
                      {isFreeEp ? "core" : "premium"}
                    </span>
                    <span className="flex-1 h-2 rounded-full bg-kno-surface-gray overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-kno-green"
                        style={{ width: `${Math.round((r.calls / maxEndpoint) * 100)}%` }}
                      />
                    </span>
                    <span className="font-mono text-kno-black w-10 text-right shrink-0">
                      {r.calls.toLocaleString("en-US")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function MonthChart({ daily, dayOfMonth }: { daily: number[]; dayOfMonth: number }) {
  const max = Math.max(...daily, 1);
  const monthName = new Date().toLocaleDateString("en-US", { month: "long" });
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-semibold text-[16px] m-0">Images per day</h2>
        <span className="font-mono text-[11px] text-kno-text-gray">{monthName}, month to date</span>
      </div>
      <div className="flex items-end gap-[3px] h-32">
        {daily.map((v, i) => {
          const future = i + 1 > dayOfMonth;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-[2px] transition-colors ${
                future
                  ? "bg-kno-surface-gray"
                  : "bg-kno-green hover:bg-kno-green-hover min-h-[2px]"
              }`}
              style={{ height: future ? "100%" : `${(v / max) * 100}%` }}
              title={
                future
                  ? `${monthName} ${i + 1}: upcoming`
                  : `${monthName} ${i + 1}: ${v} image${v === 1 ? "" : "s"}`
              }
              aria-label={
                future ? `${monthName} ${i + 1}: upcoming` : `${monthName} ${i + 1}: ${v} images`
              }
            />
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-kno-text-gray mt-2">
        <span>{monthName} 1</span>
        <span>
          {monthName} {daily.length}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-10 text-center">
      <h2 className="font-semibold text-[20px] m-0 mb-2">No images yet this month.</h2>
      <p className="text-[14px] text-kno-text-gray max-w-[480px] mx-auto mb-6">
        Create an API token and make your first request — your monthly count, projection, and
        per-endpoint breakdown will show up here.
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
