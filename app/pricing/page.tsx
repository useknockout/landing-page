import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { FAQ } from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "$0.005 per image. Volume discounts at 100k. Free during beta. Per-image billing, credits never expire, all 20 endpoints.",
};

type Tier = {
  name: string;
  price: string;
  per: string;
  bullets: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    per: "20 images / month",
    bullets: [
      "20 images per month",
      "No card required",
      "All 20 endpoints",
      "Public beta token",
      "Community support",
    ],
    cta: "Start free",
    ctaHref: "/signin?redirect=/dashboard/keys",
  },
  {
    name: "Pay-as-you-go",
    price: "$0.005",
    per: "per image",
    bullets: [
      "Per-image billing",
      "Credits never expire",
      "All 20 endpoints",
      "60 req/min rate limit",
      "Email support",
    ],
    cta: "Get token →",
    ctaHref: "/signin?redirect=/dashboard/billing",
    highlighted: true,
  },
  {
    name: "Volume",
    price: "$0.003",
    per: "per image at 100k+/mo",
    bullets: [
      "Volume discount auto-applied",
      "All 20 endpoints",
      "600 req/min rate limit",
      "99.9% uptime SLA",
      "Slack support",
    ],
    cta: "Talk to us",
    ctaHref: "mailto:hi@useknockout.com?subject=useknockout%20Volume%20plan",
  },
];

export default function PricingPage() {
  return (
    <>
      <TopNav active="Pricing" />
      <main className="bg-kno-white">
        <Hero />
        <Tiers />
        <Comparison />
        <FAQ />
        <TrustStrip />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="px-8 pt-20 pb-10 max-w-kno-content mx-auto text-center">
      <h1
        className="font-bold m-0"
        style={{ fontSize: 48, letterSpacing: "-0.025em", lineHeight: 1.1 }}
      >
        Simple pricing.
      </h1>
      <p className="text-[18px] text-kno-text-gray mt-4 max-w-[640px] mx-auto">
        $0.005 per image. Volume discounts at 100k. Free during beta. Per-image billing,
        credits never expire, all 20 endpoints.
      </p>
    </section>
  );
}

function Tiers() {
  return (
    <section className="px-8 pb-16 max-w-kno-content mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((t) => (
          <article
            key={t.name}
            className={`relative bg-kno-white rounded-kno-xl p-6 flex flex-col gap-5 border ${
              t.highlighted
                ? "border-kno-black shadow-kno-lg"
                : "border-kno-border-gray"
            }`}
          >
            {t.highlighted && (
              <span className="absolute -top-2.5 right-5 bg-kno-green text-kno-black text-[11px] font-semibold px-2.5 py-[3px] rounded-full font-mono tracking-[0.02em]">
                Recommended
              </span>
            )}
            <header>
              <h3
                className="font-semibold m-0"
                style={{ fontSize: 18, letterSpacing: "-0.005em" }}
              >
                {t.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span
                  className="font-bold"
                  style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1 }}
                >
                  {t.price}
                </span>
                <span className="text-[13px] text-kno-text-gray">{t.per}</span>
              </div>
            </header>
            <ul className="list-disc pl-5 m-0 flex flex-col gap-1.5">
              {t.bullets.map((b) => (
                <li key={b} className="text-[14px] text-kno-black leading-[1.5]">
                  {b}
                </li>
              ))}
            </ul>
            <Button
              href={t.ctaHref}
              variant={t.highlighted ? "primary" : "secondary"}
              size="md"
              className="w-full mt-auto"
            >
              {t.cta}
            </Button>
          </article>
        ))}
      </div>

      <p className="text-center text-[14px] text-kno-text-gray mt-8">
        Need something custom?{" "}
        <a
          href="mailto:sales@useknockout.com?subject=useknockout%20Enterprise"
          className="underline decoration-kno-green underline-offset-4 text-kno-black font-medium"
        >
          Contact sales →
        </a>{" "}
        for self-hosted, dedicated support, or a DPA.
      </p>
    </section>
  );
}

function Comparison() {
  return (
    <section className="bg-kno-surface-gray px-8 py-16">
      <div className="max-w-kno-content mx-auto text-center">
        <h2
          className="font-bold m-0"
          style={{ fontSize: 28, letterSpacing: "-0.015em", lineHeight: 1.2 }}
        >
          For reference: $0.005 vs $0.20
        </h2>
        <p className="text-[16px] text-kno-text-gray mt-3 max-w-[640px] mx-auto">
          Per image, useknockout is 40× cheaper than remove.bg&apos;s pay-as-you-go rate.
          Self-host on Modal and the per-call cost approaches zero.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-[560px] mx-auto mt-8">
          {[
            { label: "useknockout PAYG", price: "$0.005" },
            { label: "remove.bg PAYG", price: "$0.20" },
            { label: "Self-hosted", price: "~$0" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-kno-white border border-kno-border-gray rounded-kno-lg px-4 py-5"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold">
                {item.label}
              </div>
              <div
                className="font-bold mt-2"
                style={{ fontSize: 28, letterSpacing: "-0.02em" }}
              >
                {item.price}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[14px] mt-6">
          <Link
            href="/docs/self-hosting/modal"
            className="underline decoration-kno-green underline-offset-4 text-kno-black font-medium"
          >
            See all features →
          </Link>{" "}
          on the self-hosting docs.
        </p>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="px-8 py-12 max-w-kno-content mx-auto">
      <p className="text-center font-mono text-[12px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-6">
        MIT licensed · BiRefNet on Modal GPUs · open source
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
        {["GitHub", "Modal", "BiRefNet", "Vercel", "Cloudflare"].map((t) => (
          <span
            key={t}
            className="font-mono text-[14px] text-kno-text-gray font-semibold tracking-[0.02em]"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
