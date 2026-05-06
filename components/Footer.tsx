import Image from "next/image";
import Link from "next/link";
import { StatusPill } from "./StatusPill";

const COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "API reference", href: "/docs/endpoints/remove" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Self-hosting", href: "/docs#self-hosting" },
    ],
  },
  {
    heading: "SDKs",
    links: [
      { label: "@useknockout/node", href: "https://www.npmjs.com/package/@useknockout/node" },
      { label: "@useknockout/react", href: "https://www.npmjs.com/package/@useknockout/react" },
      { label: "@useknockout/cli", href: "https://www.npmjs.com/package/@useknockout/cli" },
      { label: "Python", href: "https://pypi.org/project/useknockout/" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "GitHub", href: "https://github.com/useknockout/api" },
      { label: "X / Twitter", href: "https://x.com/useknockout" },
      { label: "Status", href: "https://status.useknockout.com" },
      { label: "Contact", href: "mailto:hi@useknockout.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-kno-bg-dark text-kno-white px-8 pt-14 pb-6">
      <div className="max-w-kno-content mx-auto grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="" width={22} height={22} />
            <span className="font-semibold">useknockout</span>
          </div>
          <p className="text-[14px] leading-[1.5] text-kno-text-gray-dark mt-2 max-w-[280px]">
            Open-source background removal API for developers.
          </p>
          <p className="font-mono text-[12px] text-kno-text-gray mt-2">
            MIT licensed · BiRefNet on Modal GPUs
          </p>
          <div className="mt-4">
            <StatusPill status="operational" />
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.heading} className="flex flex-col gap-2.5">
            <h4 className="text-[13px] font-semibold m-0 mb-1 text-kno-white">{col.heading}</h4>
            {col.links.map((l) => {
              const external = l.href.startsWith("http") || l.href.startsWith("mailto:");
              const className =
                "text-[13px] text-kno-text-gray-dark hover:text-kno-white transition-colors duration-kno-fast ease-kno-out";
              if (external) {
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {l.label}
                  </a>
                );
              }
              return (
                <Link key={l.label} href={l.href} className={className}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="max-w-kno-content mx-auto mt-12 pt-5 border-t border-kno-border-dark flex flex-col md:flex-row justify-between gap-2">
        <span className="font-mono text-[12px] text-kno-text-gray">© 2026 useknockout</span>
        <span className="font-mono text-[12px] text-kno-text-gray">
          Built in a few hours because someone said it couldn&apos;t be done.
        </span>
      </div>
    </footer>
  );
}
