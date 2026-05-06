"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/Button";

const ASCII = `   _____ ___   ___
  | ____/ _ \\ / _ \\
  |  _|| | | | | | |
  | |__| |_| | |_| |
  |_____\\___/ \\___/ `;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-kno-black text-kno-white flex flex-col">
      <nav className="flex items-center gap-7 px-8 py-3.5 border-b border-kno-border-dark">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo-icon.png" alt="" width={22} height={22} />
          <span>useknockout</span>
        </Link>
        <div className="flex gap-6 ml-2">
          <Link className="text-[14px] text-kno-text-gray-dark font-medium" href="/docs">Docs</Link>
          <Link className="text-[14px] text-kno-text-gray-dark font-medium" href="/playground">Playground</Link>
          <Link className="text-[14px] text-kno-text-gray-dark font-medium" href="/#pricing">Pricing</Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-16 py-16">
        <div className="max-w-[720px] text-center">
          <pre className="font-mono text-[13px] leading-[1.5] text-kno-green whitespace-pre inline-block mx-auto opacity-90 m-0">
            {ASCII}
          </pre>
          <h1
            className="font-bold mt-4 text-kno-white"
            style={{ fontSize: 88, lineHeight: 1.02, letterSpacing: "-0.035em" }}
          >
            Something <span className="text-kno-green">broke.</span>
          </h1>
          <p className="text-[18px] text-kno-text-gray-dark mt-6 leading-[1.5]">
            This is on us, not you. The team&apos;s been paged. Try again in a moment, or check
            status for live updates.
          </p>
          <div className="flex gap-3 justify-center mt-9">
            <Button href="https://status.useknockout.com" variant="primary" size="lg">
              Check status →
            </Button>
            <button
              type="button"
              onClick={reset}
              className="bg-transparent text-kno-white border border-kno-border-dark px-[22px] py-3 rounded-kno-md font-semibold text-[15px] cursor-pointer hover:bg-kno-bg-elev-dark transition-colors duration-kno-fast ease-kno-out"
            >
              Try again
            </button>
          </div>
          <p className="mt-8 font-mono text-[12px] text-kno-text-gray">
            request_id: {error.digest ?? "req_unknown"} — include this if you reach out at @useknockout
          </p>
        </div>
      </div>
    </div>
  );
}
