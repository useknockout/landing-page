import { Callout } from "@/components/Endpoint";

export default function StubEndpoint({ params }: { params: { slug: string } }) {
  return (
    <article>
      <header className="mb-8">
        <p className="font-mono text-[12px] text-kno-text-gray uppercase tracking-[0.06em]">
          Endpoints
        </p>
        <h1
          className="font-bold m-0 mt-2"
          style={{ fontSize: 36, letterSpacing: "-0.025em", lineHeight: 1.15 }}
        >
          POST /{params.slug}
        </h1>
        <p className="text-[16px] leading-[1.55] text-kno-text-gray mt-3 max-w-[640px]">
          Reference for this endpoint is coming soon. The shape mirrors{" "}
          <a className="underline decoration-kno-green underline-offset-4" href="/docs/endpoints/remove">
            POST /remove
          </a>
          .
        </p>
      </header>
      <Callout tone="info">
        Working draft. Open an issue on GitHub if you need this page sooner — we ship docs in the
        order people ask.
      </Callout>
      <div className="mt-8 pt-8 border-t border-kno-border-gray flex justify-between text-[13px]">
        <a className="text-kno-text-gray hover:text-kno-black" href="/docs">
          ← Quickstart
        </a>
        <a
          className="text-kno-black font-medium hover:text-kno-green"
          href="/docs/endpoints/remove"
        >
          POST /remove (full reference) →
        </a>
      </div>
    </article>
  );
}
