import { CodeTabs } from "@/components/CodeTabs";
import { Callout, Section } from "@/components/Endpoint";

const QUICKSTART_TABS = [
  {
    name: "Node",
    code: `npm i @useknockout/node

import { Knockout } from "@useknockout/node";
const client = new Knockout({ token: process.env.KNOCKOUT_TOKEN });

const png = await client.remove({ file: "./input.jpg" });
await png.writeFile("out.png");`,
  },
  {
    name: "React",
    code: `npm i @useknockout/react

import { useRemoveBackground } from "@useknockout/react";
const { remove, dataUrl, isLoading } = useRemoveBackground({ token });

<input type="file" onChange={e => remove(e.target.files[0])} />
{dataUrl && <img src={dataUrl} alt="cutout" />}`,
  },
  {
    name: "Python",
    code: `pip install requests

import requests
resp = requests.post(
    "https://useknockout--api.modal.run/remove",
    headers={"Authorization": f"Bearer {TOKEN}"},
    files={"file": open("input.jpg", "rb")},
)
open("out.png", "wb").write(resp.content)`,
  },
  {
    name: "cURL",
    code: `curl -X POST "https://useknockout--api.modal.run/remove" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@cat.jpg" \\
  -o out.png`,
  },
];

export default function DocsHome() {
  return (
    <article className="flex flex-col">
      <header className="mb-8">
        <p className="font-mono text-[12px] text-kno-text-gray uppercase tracking-[0.06em]">
          Getting Started
        </p>
        <h1
          className="font-bold m-0 mt-2"
          style={{ fontSize: 40, letterSpacing: "-0.025em", lineHeight: 1.1 }}
        >
          Quickstart
        </h1>
        <p className="text-[16px] leading-[1.55] text-kno-text-gray mt-3 max-w-[640px]">
          Hit the API in under a minute. No credit card required during the public beta.
        </p>
      </header>

      <Section id="install" title="1. Install an SDK">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          We have official SDKs for Node, React, and Python. You can also use any HTTP client.
        </p>
        <CodeTabs tabs={QUICKSTART_TABS} dark />
      </Section>

      <Section id="authentication" title="2. Authenticate">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Every request needs a token in the <code className="code-chip">Authorization</code>{" "}
          header. Get one by{" "}
          <a
            className="underline decoration-kno-green underline-offset-4"
            href="https://github.com/useknockout/api"
            target="_blank"
            rel="noopener noreferrer"
          >
            requesting beta access on GitHub
          </a>{" "}
          — it&apos;s free during beta.
        </p>
        <Callout tone="warning">
          Never ship a token in client-side code. Use a server route or proxy.
        </Callout>
      </Section>

      <Section id="errors" title="3. Handle errors">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Errors return a structured JSON body with a stable <code className="code-chip">code</code>,
          a human <code className="code-chip">message</code>, and a{" "}
          <code className="code-chip">request_id</code> for support.
        </p>
        <pre className="bg-kno-bg-dark text-[#E5E7EB] border border-kno-border-dark rounded-kno-lg p-[16px_18px] font-mono text-[13px] leading-[1.65] overflow-x-auto m-0">{`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "60 req/min limit hit. Retry in 23s.",
    "request_id": "req_01HK..."
  }
}`}</pre>
      </Section>

      <Section id="rate-limits" title="4. Rate limits">
        <p className="text-[14px] leading-[1.6] text-kno-black">
          Free tier: 60 req/min, 20 images/month. Paid tier: 600 req/min, no monthly cap. The
          response always includes <code className="code-chip">x-ratelimit-limit</code> and{" "}
          <code className="code-chip">x-ratelimit-remaining</code>.
        </p>
      </Section>

      <Section id="self-hosting" title="5. Self-host (optional)">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          The whole stack — API, model weights, infra config — is MIT licensed. Run it on your
          Modal account in four commands:
        </p>
        <pre className="bg-kno-bg-dark text-[#E5E7EB] border border-kno-border-dark rounded-kno-lg p-[16px_18px] font-mono text-[13px] leading-[1.65] overflow-x-auto m-0">{`git clone https://github.com/useknockout/api
cd api
modal deploy app.py
echo "Your endpoint: $(modal app list | grep useknockout)"`}</pre>
      </Section>

      <div className="mt-8 pt-8 border-t border-kno-border-gray flex justify-between text-[13px]">
        <a className="text-kno-text-gray hover:text-kno-black" href="/">
          ← Home
        </a>
        <a
          className="text-kno-black font-medium hover:text-kno-green"
          href="/docs/endpoints/remove"
        >
          POST /remove →
        </a>
      </div>
    </article>
  );
}
