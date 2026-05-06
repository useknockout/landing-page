import type { Metadata } from "next";
import { CodeTabs } from "@/components/CodeTabs";
import {
  Callout,
  EndpointHeader,
  ParamTable,
  Section,
  type ParamRow,
} from "@/components/Endpoint";

export const metadata: Metadata = {
  title: "POST /remove",
  description: "Remove the background from an image and return a transparent PNG or WebP.",
};

const PARAMS: ParamRow[] = [
  {
    field: "file",
    type: "file",
    desc: "Image to process. JPG, PNG, WebP, HEIC. Up to 10 MB and 4096×4096.",
    required: true,
  },
  {
    field: "format",
    type: "string",
    def: "png",
    desc: "Output format — png (with alpha) or webp.",
  },
  {
    field: "quality",
    type: "int 1-100",
    def: "92",
    desc: "JPEG/WebP quality. Ignored for PNG.",
  },
  {
    field: "matting",
    type: "string",
    def: "closed-form",
    desc: "Edge cleanup algorithm. Options: closed-form, none.",
  },
];

const REQUEST_TABS = [
  {
    name: "cURL",
    code: `curl -X POST "https://useknockout--api.modal.run/remove" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@cat.jpg" \\
  -F "format=png" \\
  -o out.png`,
  },
  {
    name: "Node",
    code: `import { Knockout } from "@useknockout/node";

const client = new Knockout({ token: process.env.KNOCKOUT_TOKEN });
const png = await client.remove({
  file: "./cat.jpg",
  format: "png",
});
await png.writeFile("out.png");`,
  },
  {
    name: "Python",
    code: `import requests

resp = requests.post(
    "https://useknockout--api.modal.run/remove",
    headers={"Authorization": f"Bearer {TOKEN}"},
    files={"file": open("cat.jpg", "rb")},
    data={"format": "png"},
)
resp.raise_for_status()
open("out.png", "wb").write(resp.content)`,
  },
];

const RESPONSE_TABS = [
  {
    name: "Headers",
    code: `HTTP/1.1 200 OK
content-type: image/png
content-length: 254312
x-knockout-latency: 184
x-knockout-model: BiRefNet
x-ratelimit-limit: 60
x-ratelimit-remaining: 59`,
  },
  {
    name: "Body",
    code: "<binary PNG with alpha channel>",
  },
];

const ERRORS: ParamRow[] = [
  { field: "401", type: "unauthorized", desc: "Missing or invalid token." },
  { field: "402", type: "payment_required", desc: "Free tier exhausted. Add a card to continue." },
  { field: "413", type: "payload_too_large", desc: "Image exceeds 10 MB or 4096×4096." },
  { field: "422", type: "no_subject_detected", desc: "Foreground could not be isolated from background." },
  { field: "429", type: "rate_limit_exceeded", desc: "Slow down. Retry-After header tells you when." },
  { field: "500", type: "internal_error", desc: "Something broke on our side. Include request_id when reporting." },
];

export default function RemoveEndpoint() {
  return (
    <article>
      <EndpointHeader
        verb="POST"
        path="/remove"
        title="Remove background"
        lede="Upload an image and get back a transparent PNG or WebP. Edges are cleaned via closed-form foreground matting — no halos, no fringing."
        crumbs={[
          { label: "API reference", href: "/docs" },
          { label: "POST /remove" },
        ]}
      />

      <Section id="parameters" title="Parameters">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Send as <code className="code-chip">multipart/form-data</code>.
        </p>
        <ParamTable rows={PARAMS} />
      </Section>

      <Section id="request" title="Request">
        <CodeTabs tabs={REQUEST_TABS} dark />
      </Section>

      <Section id="response" title="Response">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Returns the processed image as the response body. Metadata travels in headers.
        </p>
        <CodeTabs tabs={RESPONSE_TABS} dark />
      </Section>

      <Section id="errors" title="Errors">
        <ParamTable rows={ERRORS} />
        <Callout tone="info">
          Every error response also includes a <code className="code-chip">request_id</code> in the
          JSON body. Quote it when reporting issues.
        </Callout>
      </Section>

      <Section id="notes" title="Notes">
        <ul className="list-disc pl-5 text-[14px] leading-[1.7] text-kno-black flex flex-col gap-2">
          <li>The model runs on a Modal L4 GPU. Cold starts add ~3 seconds.</li>
          <li>Images are processed in-memory and discarded after the response is returned.</li>
          <li>For batch workflows, fan out with Promise.all in Node or asyncio.gather in Python.</li>
        </ul>
      </Section>

      <div className="mt-8 pt-8 border-t border-kno-border-gray flex justify-between text-[13px]">
        <a className="text-kno-text-gray hover:text-kno-black" href="/docs">
          ← Quickstart
        </a>
        <a
          className="text-kno-black font-medium hover:text-kno-green"
          href="/docs/endpoints/replace-bg"
        >
          POST /replace-bg →
        </a>
      </div>
    </article>
  );
}
