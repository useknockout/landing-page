import { Callout } from "@/components/Endpoint";

export default function StubSelfHosting({ params }: { params: { slug: string } }) {
  return (
    <article>
      <header className="mb-8">
        <p className="font-mono text-[12px] text-kno-text-gray uppercase tracking-[0.06em]">
          Self-hosting
        </p>
        <h1
          className="font-bold m-0 mt-2"
          style={{ fontSize: 36, letterSpacing: "-0.025em", lineHeight: 1.15 }}
        >
          {params.slug.replace("-", " ")}
        </h1>
        <p className="text-[16px] leading-[1.55] text-kno-text-gray mt-3 max-w-[640px]">
          Detailed self-hosting guide coming soon. The four-command Modal deploy lives in the{" "}
          <a className="underline decoration-kno-green underline-offset-4" href="/docs#self-hosting">
            Quickstart
          </a>{" "}
          today.
        </p>
      </header>
      <Callout tone="info">Page draft — full guide shipping with v1.</Callout>
    </article>
  );
}
