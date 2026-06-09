import { CodeTabs } from "@/components/CodeTabs";
import {
  Callout,
  EndpointHeader,
  ParamTable,
  Section,
  type ParamRow,
} from "@/components/Endpoint";
import type { EndpointSpec } from "@/lib/endpoints";

/**
 * Renders a complete endpoint reference page from a spec.
 * One template, 19 endpoints, no copy-pasted JSX.
 */
export function EndpointDoc({ spec }: { spec: EndpointSpec }) {
  const params: ParamRow[] = (spec.params ?? []).map((p) => ({
    field: p.field,
    type: p.type,
    def: p.def,
    desc: p.desc,
    required: p.required,
  }));

  const errors: ParamRow[] = (spec.errors ?? []).map((e) => ({
    field: e.status,
    type: e.code,
    desc: e.desc,
  }));

  const requestTabs = [
    spec.curl ? { name: "cURL", code: spec.curl } : null,
    spec.node ? { name: "Node", code: spec.node } : null,
    spec.python ? { name: "Python", code: spec.python } : null,
  ].filter((t): t is { name: string; code: string } => t !== null);

  const responseTabs = [
    spec.responseHeaders ? { name: "Headers", code: spec.responseHeaders } : null,
    spec.responseBody ? { name: "Body", code: spec.responseBody } : null,
  ].filter((t): t is { name: string; code: string } => t !== null);

  return (
    <article>
      <EndpointHeader
        verb={spec.verb}
        path={spec.path}
        title={spec.title}
        lede={spec.lede}
        crumbs={[
          { label: "API reference", href: "/docs" },
          { label: `${spec.verb} ${spec.path}` },
        ]}
      />

      {params.length > 0 && (
        <Section id="parameters" title="Parameters">
          <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
            {spec.verb === "POST"
              ? "Send as multipart/form-data unless noted otherwise."
              : "No parameters."}
          </p>
          <ParamTable rows={params} />
        </Section>
      )}

      {requestTabs.length > 0 && (
        <Section id="request" title="Request">
          <CodeTabs tabs={requestTabs} dark />
        </Section>
      )}

      {responseTabs.length > 0 && (
        <Section id="response" title="Response">
          <CodeTabs tabs={responseTabs} dark />
        </Section>
      )}

      {errors.length > 0 && (
        <Section id="errors" title="Errors">
          <ParamTable rows={errors} />
          <Callout tone="info">
            Every error response also includes a{" "}
            <code className="code-chip">request_id</code> in the JSON body. Quote it
            when reporting issues.
          </Callout>
        </Section>
      )}

      {spec.notes && spec.notes.length > 0 && (
        <Section id="notes" title="Notes">
          <ul className="list-disc pl-5 text-[14px] leading-[1.7] text-kno-black flex flex-col gap-2">
            {spec.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-8 pt-8 border-t border-kno-border-gray flex justify-between text-[13px]">
        {spec.prev ? (
          <a
            className="text-kno-text-gray hover:text-kno-black"
            href={`/docs/endpoints/${spec.prev.slug}`}
          >
            ← {spec.prev.label}
          </a>
        ) : (
          <a className="text-kno-text-gray hover:text-kno-black" href="/docs">
            ← Quickstart
          </a>
        )}
        {spec.next && (
          <a
            className="text-kno-black font-medium hover:text-kno-green"
            href={`/docs/endpoints/${spec.next.slug}`}
          >
            {spec.next.label} →
          </a>
        )}
      </div>
    </article>
  );
}
