import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

const TIER_DETAILS = {
  free: {
    name: "Free",
    price: "$0",
    description: "50 images per month. Free during beta.",
  },
  payg: {
    name: "Pay-as-you-go",
    price: "$0.005",
    description: "Per image, billed monthly. Credits never expire.",
  },
  volume: {
    name: "Volume",
    price: "$0.003",
    description: "Per image at 100k+/month. Slack support, SLA.",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    description: "Self-hosted, custom SLA, DPA, dedicated support.",
  },
} as const;

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("tier, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const tier = (profile?.tier ?? "free") as keyof typeof TIER_DETAILS;
  const details = TIER_DETAILS[tier];

  // Current month usage for spend estimate
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: callCount } = await supabase
    .from("usage")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  const calls = callCount ?? 0;
  const perImageCost =
    tier === "payg" ? 0.005 : tier === "volume" ? 0.003 : 0;
  const spend = (calls * perImageCost).toFixed(2);

  return (
    <div className="max-w-[1024px] mx-auto flex flex-col gap-6">
      <header>
        <h1
          className="font-bold m-0"
          style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          Billing
        </h1>
        <p className="text-[14px] text-kno-text-gray mt-1.5">
          Manage your plan, payment method, and invoices.
        </p>
      </header>

      <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-2">
              Current plan
            </div>
            <h2
              className="font-bold m-0"
              style={{ fontSize: 28, letterSpacing: "-0.015em" }}
            >
              {details.name}
            </h2>
            <p className="text-[14px] text-kno-text-gray mt-1.5">
              {details.description}
            </p>
          </div>
          <div className="text-right">
            <div
              className="font-bold"
              style={{ fontSize: 28, letterSpacing: "-0.015em" }}
            >
              {details.price}
            </div>
            <div className="text-[12px] text-kno-text-gray font-mono">
              {tier === "free"
                ? "no card required"
                : tier === "enterprise"
                  ? "billed annually"
                  : "per image"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {tier === "free" && (
            <Button href="/pricing" variant="primary">
              Upgrade to Pay-as-you-go →
            </Button>
          )}
          {profile?.stripe_customer_id ? (
            <Button
              href="/api/stripe/portal"
              variant={tier === "free" ? "secondary" : "primary"}
            >
              Manage payment & invoices
            </Button>
          ) : (
            tier !== "free" && (
              <p className="text-[13px] text-kno-text-gray">
                Stripe customer not yet linked. Contact support if this looks wrong.
              </p>
            )
          )}
        </div>
      </section>

      <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-6">
        <h2 className="font-semibold text-[16px] m-0 mb-4">This month</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-1">
              Calls
            </div>
            <div
              className="font-bold"
              style={{ fontSize: 24, letterSpacing: "-0.015em" }}
            >
              {calls.toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-1">
              Estimated spend
            </div>
            <div
              className="font-bold"
              style={{ fontSize: 24, letterSpacing: "-0.015em" }}
            >
              ${spend}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-1">
              Quota
            </div>
            <div
              className="font-bold"
              style={{ fontSize: 24, letterSpacing: "-0.015em" }}
            >
              {tier === "free" ? `${calls}/50` : "unlimited"}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-6">
        <h2 className="font-semibold text-[16px] m-0 mb-2">Invoices</h2>
        <p className="text-[13px] text-kno-text-gray">
          Past invoices are available in the Stripe billing portal once you upgrade.
        </p>
      </section>
    </div>
  );
}
