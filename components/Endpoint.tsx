import type { ReactNode } from "react";

type Verb = "GET" | "POST" | "PUT" | "DELETE";
const verbColors: Record<Verb, string> = {
  GET: "bg-kno-black text-kno-green",
  POST: "bg-kno-black text-kno-green",
  PUT: "bg-kno-warn-bg text-kno-warn-fg",
  DELETE: "bg-kno-error-bg text-[#B91C1C]",
};

export function EndpointHeader({
  verb,
  path,
  title,
  lede,
  crumbs,
}: {
  verb: Verb;
  path: string;
  title: string;
  lede: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <header className="flex flex-col gap-2.5 mb-8">
      {crumbs && crumbs.length > 0 && (
        <div className="flex gap-1.5 items-center font-mono text-[12px]">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href ? (
                <a href={c.href} className="text-kno-text-gray hover:text-kno-black">
                  {c.label}
                </a>
              ) : (
                <span className="text-kno-black">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="text-kno-border-gray">/</span>}
            </span>
          ))}
        </div>
      )}
      <h1
        className="font-bold m-0"
        style={{ fontSize: 36, letterSpacing: "-0.025em", lineHeight: 1.15 }}
      >
        {title}
      </h1>
      <p className="text-[16px] leading-[1.55] text-kno-text-gray m-0 max-w-[640px]">{lede}</p>
      <div className="inline-flex items-center gap-3 px-3.5 py-2.5 border border-kno-border-gray rounded-kno-md bg-kno-surface-gray font-mono text-[13px] w-fit mt-1.5">
        <span
          className={`inline-flex px-2 py-[3px] rounded-kno-sm text-[11px] font-semibold tracking-[0.04em] ${verbColors[verb]}`}
        >
          {verb}
        </span>
        <span className="text-kno-black">https://useknockout--api.modal.run{path}</span>
      </div>
    </header>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-9 scroll-mt-20">
      <h2
        className="font-semibold m-0 mb-3"
        style={{ fontSize: 22, letterSpacing: "-0.01em", lineHeight: 1.3 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export type ParamRow = {
  field: string;
  type: string;
  def?: string;
  desc: string;
  required?: boolean;
};

export function ParamTable({ rows }: { rows: ParamRow[] }) {
  return (
    <div className="border border-kno-border-gray rounded-kno-lg overflow-hidden mb-6">
      <div className="hidden md:grid grid-cols-[1.2fr_0.8fr_0.8fr_2fr] gap-4 px-4 py-2.5 bg-kno-surface-gray border-b border-kno-border-gray font-mono text-[12px] font-semibold">
        <span>Field</span>
        <span>Type</span>
        <span>Default</span>
        <span>Description</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.field}
          className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr_2fr] gap-2 md:gap-4 px-4 py-3 border-b last:border-b-0 border-kno-border-gray text-[13px] items-baseline"
        >
          <span className="font-mono text-kno-black font-medium flex items-center gap-2">
            {r.field}
            {r.required && (
              <span className="font-sans text-[10px] text-kno-error-red px-[5px] py-px border border-[#FCA5A5] rounded-[3px] font-medium">
                required
              </span>
            )}
          </span>
          <span className="font-mono text-kno-text-gray text-[12px]">{r.type}</span>
          <span className="font-mono text-kno-text-gray text-[12px]">{r.def ?? "—"}</span>
          <span className="text-kno-black leading-[1.5]">{r.desc}</span>
        </div>
      ))}
    </div>
  );
}

export function Callout({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning";
  children: ReactNode;
}) {
  const styles = {
    info: "bg-kno-surface-gray border-kno-border-gray text-kno-black",
    success: "bg-kno-success-mint border-[#A7F3D0] text-kno-success-fg",
    warning: "bg-kno-warn-bg border-kno-warn-border text-kno-warn-fg",
  } as const;
  return (
    <div
      className={`px-3.5 py-3 rounded-kno-md border text-[13px] leading-[1.55] mb-4 ${styles[tone]}`}
    >
      {children}
    </div>
  );
}
