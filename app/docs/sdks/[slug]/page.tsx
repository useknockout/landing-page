import { Callout } from "@/components/Endpoint";

export default function StubSdk({ params }: { params: { slug: string } }) {
  return (
    <article>
      <header className="mb-8">
        <p className="font-mono text-[12px] text-kno-text-gray uppercase tracking-[0.06em]">
          SDKs
        </p>
        <h1
          className="font-bold m-0 mt-2"
          style={{ fontSize: 36, letterSpacing: "-0.025em", lineHeight: 1.15 }}
        >
          {params.slug}
        </h1>
        <p className="text-[16px] leading-[1.55] text-kno-text-gray mt-3 max-w-[640px]">
          SDK reference page draft. See the install snippets in the{" "}
          <a className="underline decoration-kno-green underline-offset-4" href="/docs">
            Quickstart
          </a>{" "}
          for the time being.
        </p>
      </header>
      <Callout tone="info">Page draft — full reference shipping with v1.</Callout>
    </article>
  );
}
