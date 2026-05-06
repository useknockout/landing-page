"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  email?: string;
  tier?: "free" | "payg" | "volume" | "enterprise";
  pageTitle?: string;
  pageMeta?: React.ReactNode;
};

const TIER_LABEL: Record<NonNullable<Props["tier"]>, string> = {
  free: "Free",
  payg: "Pay-as-you-go",
  volume: "Volume",
  enterprise: "Enterprise",
};

export function TopBar({ email, tier = "free", pageTitle, pageMeta }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <header className="border-b border-kno-border-gray bg-kno-white">
      <div className="flex items-center gap-4 px-8 py-4">
        {pageTitle && (
          <div className="flex flex-col">
            <h1
              className="font-bold m-0"
              style={{ fontSize: 28, letterSpacing: "-0.015em", lineHeight: 1.2 }}
            >
              {pageTitle}
            </h1>
          </div>
        )}
        {pageMeta && <div className="ml-auto flex items-center gap-3">{pageMeta}</div>}
        <div className={pageMeta ? "flex items-center gap-3" : "ml-auto flex items-center gap-3"}>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kno-surface-gray border border-kno-border-gray font-mono text-[11px] text-kno-black">
            <span className="w-[6px] h-[6px] rounded-full bg-kno-green" />
            {TIER_LABEL[tier]}
          </span>
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="w-8 h-8 rounded-full bg-kno-black text-kno-white text-[13px] font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {initial}
            </button>
            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-kno-white border border-kno-border-gray rounded-kno-lg shadow-kno-md py-1.5 z-50"
                onMouseLeave={() => setOpen(false)}
              >
                {email && (
                  <div className="px-3 py-2 text-[12px] text-kno-text-gray border-b border-kno-border-gray font-mono break-all">
                    {email}
                  </div>
                )}
                <a
                  href="/dashboard/settings"
                  className="block px-3 py-2 text-[13px] text-kno-black hover:bg-kno-surface-gray"
                >
                  Account settings
                </a>
                <a
                  href="/dashboard/billing"
                  className="block px-3 py-2 text-[13px] text-kno-black hover:bg-kno-surface-gray"
                >
                  Billing
                </a>
                <a
                  href="/docs"
                  className="block px-3 py-2 text-[13px] text-kno-black hover:bg-kno-surface-gray"
                >
                  Documentation
                </a>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-[13px] text-kno-black hover:bg-kno-surface-gray border-t border-kno-border-gray mt-1 pt-2"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
