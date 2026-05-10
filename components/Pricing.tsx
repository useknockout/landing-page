import { Button } from "./Button";

type Tier = {
  name: string;
  price: string;
  per: string;
  best: string;
  features: string[];
  cta: string;
  ctaHref: string;
  primary?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    per: "20 images / month",
    best: "Eval, side projects, OSS",
    features: ["20 images / month", "No card required", "Public beta token", "Community support"],
    cta: "Start free",
    ctaHref: "https://github.com/useknockout/api",
  },
  {
    name: "Pay-as-you-go",
    price: "$0.005",
    per: "per image",
    best: "Side projects, early startups",
    features: ["Per-image billing", "Credits never expire", "All 22 endpoints", "Email support"],
    cta: "Get token →",
    ctaHref: "https://github.com/useknockout/api",
    primary: true,
  },
  {
    name: "Volume",
    price: "$0.003",
    per: "per image at 100k+/mo",
    best: "Production workloads",
    features: ["Volume discount", "99.9% uptime SLA", "Slack support", "Usage dashboard"],
    cta: "Talk to us",
    ctaHref: "mailto:hi@useknockout.com",
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "private endpoints",
    best: "Compliance, BYO-cloud",
    features: [
      "Self-hosted on your VPC",
      "Custom SLAs & DPA",
      "Dedicated support",
      "Private Slack channel",
    ],
    cta: "Contact sales",
    ctaHref: "mailto:sales@useknockout.com",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-kno-surface-gray px-8 py-20">
      <div className="max-w-kno-content mx-auto">
        <div className="mb-10">
          <h2
            className="font-bold m-0"
            style={{ fontSize: 40, letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Pricing
          </h2>
          <p className="text-[16px] text-kno-text-gray mt-2">
            For reference — the same image on remove.bg is <strong>$0.20</strong> at their PAYG rate.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative bg-kno-white rounded-kno-xl p-6 flex flex-col gap-3.5 border ${
                t.primary ? "border-kno-black shadow-kno-lg" : "border-kno-border-gray"
              }`}
            >
              {t.primary && (
                <span className="absolute -top-2.5 right-4 bg-kno-green text-kno-black text-[11px] font-semibold px-2.5 py-[3px] rounded-full font-mono tracking-[0.02em]">
                  Most popular
                </span>
              )}
              <h3 className="text-[18px] font-semibold m-0">{t.name}</h3>
              <div className="flex flex-col gap-0.5">
                <span
                  className="font-bold"
                  style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.05 }}
                >
                  {t.price}
                </span>
                <span className="text-[13px] text-kno-text-gray">{t.per}</span>
              </div>
              <p className="text-[12px] text-kno-text-gray font-mono m-0">Best for: {t.best}</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 my-2">
                {t.features.map((f) => (
                  <li key={f} className="text-[13px] text-kno-black flex gap-2">
                    <span className="text-kno-green font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                href={t.ctaHref}
                variant={t.primary ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                {t.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
