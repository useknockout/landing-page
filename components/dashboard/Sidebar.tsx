"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusPill } from "@/components/StatusPill";

type Item = { label: string; href: string; mono?: boolean };
type Group = { heading?: string; items: Item[] };

const GROUPS: Group[] = [
  {
    items: [
      { label: "Overview", href: "/dashboard" },
      { label: "API Keys", href: "/dashboard/keys" },
      { label: "Usage", href: "/dashboard/usage" },
      { label: "Billing", href: "/dashboard/billing" },
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "Playground", href: "/playground" },
      { label: "Support", href: "mailto:hi@useknockout.com" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-kno-border-gray bg-kno-white sticky top-0 h-screen">
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-4 font-semibold text-[15px] tracking-[-0.01em] border-b border-kno-border-gray"
      >
        <Image src="/logo-icon.png" alt="" width={22} height={22} priority />
        <span>useknockout</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-6">
        {GROUPS.map((g, gi) => (
          <div key={gi} className="flex flex-col gap-1">
            {g.heading && (
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold px-2 mb-1">
                {g.heading}
              </div>
            )}
            {g.items.map((it) => {
              const isActive =
                it.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(it.href) && it.href !== "/";
              const className = `relative flex items-center px-3 py-2 rounded-kno-md text-[14px] transition-colors duration-kno-fast ease-kno-out ${
                isActive
                  ? "bg-kno-green-soft text-kno-black font-medium"
                  : "text-kno-text-gray hover:text-kno-black hover:bg-kno-surface-gray"
              }`;
              const external = it.href.startsWith("mailto:") || it.href.startsWith("http");
              if (external) {
                return (
                  <a key={it.href} href={it.href} className={className}>
                    {it.label}
                  </a>
                );
              }
              return (
                <Link key={it.href} href={it.href} className={className}>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-kno-green" />
                  )}
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-kno-border-gray px-5 py-3 flex items-center justify-between">
        <StatusPill status="operational" />
        <a
          href="https://github.com/useknockout/api/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-kno-text-gray hover:text-kno-black"
          title="status.useknockout.com is coming soon — for now report issues on GitHub"
        >
          report →
        </a>
      </div>
    </aside>
  );
}
