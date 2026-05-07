import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";

type Props = {
  active?: "Docs" | "Playground" | "Pricing" | "GitHub" | "Blog" | null;
  badge?: string;
  variant?: "light" | "dark";
};

const NAV_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Docs", href: "/docs" },
  { label: "Playground", href: "/playground" },
  { label: "Pricing", href: "/#pricing" },
  { label: "GitHub", href: "https://github.com/useknockout/api", external: true },
];

export function TopNav({ active = null, badge, variant = "light" }: Props) {
  const dark = variant === "dark";
  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-sm flex items-center gap-8 px-8 py-3.5 border-b ${
        dark
          ? "bg-kno-bg-dark/95 border-kno-border-dark text-kno-white"
          : "bg-kno-white/95 border-kno-border-gray text-kno-black"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 font-semibold text-[15px] tracking-[-0.01em]">
        <Image src="/logo-icon.png" alt="useknockout" width={22} height={22} priority />
        <span>useknockout</span>
        {badge && (
          <span
            className={`ml-1 font-mono text-[11px] px-1.5 py-0.5 rounded-kno-sm border ${
              dark
                ? "border-kno-border-dark text-kno-text-gray-dark"
                : "border-kno-border-gray text-kno-text-gray"
            }`}
          >
            {badge}
          </span>
        )}
      </Link>

      <div className="hidden md:flex gap-6">
        {NAV_LINKS.map((l) => {
          const isActive = active === l.label;
          const linkClass = `relative text-[14px] font-medium py-5 transition-colors duration-kno-fast ease-kno-out ${
            isActive
              ? dark
                ? "text-kno-white"
                : "text-kno-black"
              : dark
                ? "text-kno-text-gray-dark hover:text-kno-white"
                : "text-kno-text-gray hover:text-kno-black"
          }`;
          if (l.external) {
            return (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {l.label}
              </a>
            );
          }
          return (
            <Link key={l.label} href={l.href} className={linkClass}>
              {l.label}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-3.5 h-0.5 bg-kno-green" aria-hidden />
              )}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/signin"
          className={`hidden sm:inline text-[13px] font-medium ${
            dark ? "text-kno-white" : "text-kno-black"
          }`}
        >
          Sign in
        </Link>
        <Button href="/signin?redirect=/dashboard/keys" variant="primary" size="sm">
          Get token →
        </Button>
      </div>
    </nav>
  );
}
