"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Props = {
  tier: "payg" | "volume";
  label?: string;
};

/**
 * Client-side button that POSTs to /api/stripe/checkout, gets a Stripe Checkout
 * URL, and redirects the browser to it. Used on /dashboard/billing — replaces
 * the old `<Button href="/pricing">` which created a redirect loop.
 */
export function UpgradeButton({ tier, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? `Checkout failed (${res.status})`);
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  }

  const defaultLabel =
    tier === "payg" ? "Upgrade to Pay-as-you-go →" : "Upgrade to Volume →";

  return (
    <div className="flex flex-col gap-2 items-start">
      <Button
        type="button"
        variant="primary"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Starting Checkout…" : (label ?? defaultLabel)}
      </Button>
      {error && (
        <p className="text-[13px] text-[#B91C1C]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
