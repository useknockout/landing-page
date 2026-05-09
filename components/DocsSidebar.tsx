"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string };
type Group = { heading: string; items: Item[] };

const GROUPS: Group[] = [
  {
    heading: "Getting Started",
    items: [
      { label: "Quickstart", href: "/docs" },
      { label: "Authentication", href: "/docs#authentication" },
      { label: "Errors", href: "/docs#errors" },
      { label: "Rate limits", href: "/docs#rate-limits" },
    ],
  },
  {
    heading: "Core",
    items: [
      { label: "POST /remove", href: "/docs/endpoints/remove" },
      { label: "POST /remove-url", href: "/docs/endpoints/remove-url" },
      { label: "POST /replace-bg", href: "/docs/endpoints/replace-bg" },
    ],
  },
  {
    heading: "Batch",
    items: [
      { label: "POST /remove-batch", href: "/docs/endpoints/remove-batch" },
      { label: "POST /remove-batch-url", href: "/docs/endpoints/remove-batch-url" },
    ],
  },
  {
    heading: "Cutout variants",
    items: [
      { label: "POST /mask", href: "/docs/endpoints/mask" },
      { label: "POST /sticker", href: "/docs/endpoints/sticker" },
      { label: "POST /outline", href: "/docs/endpoints/outline" },
      { label: "POST /smart-crop", href: "/docs/endpoints/smart-crop" },
    ],
  },
  {
    heading: "Composition",
    items: [
      { label: "POST /shadow", href: "/docs/endpoints/shadow" },
      { label: "POST /studio-shot", href: "/docs/endpoints/studio-shot" },
      { label: "POST /headshot", href: "/docs/endpoints/headshot" },
      { label: "POST /compare", href: "/docs/endpoints/compare" },
    ],
  },
  {
    heading: "Enhancement",
    items: [
      { label: "POST /upscale", href: "/docs/endpoints/upscale" },
      { label: "POST /face-restore", href: "/docs/endpoints/face-restore" },
      { label: "POST /colorize", href: "/docs/endpoints/colorize" },
    ],
  },
  {
    heading: "Utility",
    items: [
      { label: "POST /preview", href: "/docs/endpoints/preview" },
      { label: "POST /estimate", href: "/docs/endpoints/estimate" },
      { label: "GET /health", href: "/docs/endpoints/health" },
      { label: "GET /stats", href: "/docs/endpoints/stats" },
      { label: "GET /", href: "/docs/endpoints/root" },
    ],
  },
  {
    heading: "SDKs",
    items: [
      { label: "@useknockout/node", href: "/docs/sdks/node" },
      { label: "@useknockout/react", href: "/docs/sdks/react" },
      { label: "@useknockout/cli", href: "/docs/sdks/cli" },
      { label: "Python", href: "/docs/sdks/python" },
    ],
  },
  {
    heading: "Self-hosting",
    items: [
      { label: "On Modal", href: "/docs/self-hosting/modal" },
      { label: "On your own GPU", href: "/docs/self-hosting/byo-gpu" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[240px] shrink-0 sticky top-16 self-start max-h-[calc(100vh-64px)] overflow-y-auto pr-4 py-8 hidden lg:block">
      <nav className="flex flex-col gap-6">
        {GROUPS.map((g) => (
          <div key={g.heading} className="flex flex-col gap-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold">
              {g.heading}
            </div>
            <div className="flex flex-col">
              {g.items.map((it) => {
                const isActive = pathname === it.href;
                const isHash = it.href.includes("#");
                const className = `text-[13px] py-1.5 px-2 -mx-2 rounded-kno-sm transition-colors duration-kno-fast ease-kno-out ${
                  isActive
                    ? "text-kno-black font-medium bg-kno-green-soft"
                    : "text-kno-text-gray hover:text-kno-black hover:bg-kno-surface-gray"
                }`;
                if (isHash) {
                  return (
                    <a key={it.href} href={it.href} className={className}>
                      {it.label}
                    </a>
                  );
                }
                return (
                  <Link key={it.href} href={it.href} className={className}>
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
