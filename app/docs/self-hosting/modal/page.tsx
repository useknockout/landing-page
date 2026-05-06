import type { Metadata } from "next";
import { CodeTabs } from "@/components/CodeTabs";
import { Callout, Section } from "@/components/Endpoint";

export const metadata: Metadata = {
  title: "Self-host on Modal",
  description:
    "Run useknockout on your own Modal account in four commands. ~50k free image-equivalents/month before billing kicks in.",
};

const DEPLOY_TABS = [
  {
    name: "Bash",
    code: `# 1. Clone the repo
git clone https://github.com/useknockout/api
cd api

# 2. Authenticate Modal (one-time, opens browser)
modal token new

# 3. Deploy to your Modal account
modal deploy app.py

# 4. Confirm it's live
curl https://<your-username>--api.modal.run/health`,
  },
  {
    name: "PowerShell",
    code: `# 1. Clone the repo
git clone https://github.com/useknockout/api
cd api

# 2. Authenticate Modal (one-time, opens browser)
modal token new

# 3. Deploy to your Modal account
modal deploy app.py

# 4. Confirm it's live
curl https://<your-username>--api.modal.run/health`,
  },
];

const ENV_TABS = [
  {
    name: "Modal Secrets",
    code: `# Set via Modal dashboard or CLI. The deploy reads these at runtime.

modal secret create useknockout-secrets \\
  KNOCKOUT_ADMIN_TOKEN=<random 32 chars> \\
  SUPABASE_URL=https://<project>.supabase.co \\
  SUPABASE_SERVICE_ROLE_KEY=<your service role key> \\
  STRIPE_SECRET_KEY=sk_live_... \\
  STRIPE_METER_EVENT_NAME=images.processed`,
  },
  {
    name: "GPU override",
    code: `# In app.py, the default GPU is L4. Override per function:

@app.function(gpu="A10G", image=image, secrets=[secret])
def remove_bg_a10g(image_bytes: bytes) -> bytes:
    ...

# Available: L4 ($0.80/hr), A10G ($1.10/hr), A100-40GB ($3.10/hr).
# L4 is the sweet spot for 1024x1024 BiRefNet workloads.`,
  },
];

export default function ModalSelfHostingPage() {
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
          Run useknockout on Modal
        </h1>
        <p className="text-[16px] leading-[1.55] text-kno-text-gray mt-3 max-w-[640px]">
          The whole stack — API code, model weights, infrastructure config — is MIT
          licensed. Deploy your own copy to Modal in four commands. You keep the GPU
          credits, we keep the open source.
        </p>
      </header>

      <Callout tone="success">
        Modal&apos;s free tier covers ~50,000 image-equivalents per month before
        billing kicks in. Plenty of runway to ship a side project or evaluate the
        platform.
      </Callout>

      <Section id="prereqs" title="1. Prerequisites">
        <ul className="list-disc pl-5 text-[14px] leading-[1.7] text-kno-black flex flex-col gap-2 mb-4">
          <li>
            <a
              className="underline decoration-kno-green underline-offset-4"
              href="https://modal.com/signup"
              target="_blank"
              rel="noopener noreferrer"
            >
              Modal account
            </a>{" "}
            (free tier is fine; $30/month free credits as of 2025)
          </li>
          <li>
            Python 3.10 or newer locally for <code className="code-chip">modal</code> CLI
          </li>
          <li>
            <code className="code-chip">pip install modal</code> in any virtualenv
          </li>
          <li>
            A Stripe account if you want to monetize the deployment (optional)
          </li>
        </ul>
      </Section>

      <Section id="deploy" title="2. Deploy">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Modal handles GPU provisioning, autoscaling, and HTTPS endpoints. The repo
          ships with a <code className="code-chip">app.py</code> that defines the
          functions, mounts, and image. You don&apos;t need to touch it for a stock
          deploy.
        </p>
        <CodeTabs tabs={DEPLOY_TABS} dark />
        <p className="text-[14px] leading-[1.6] text-kno-black mt-4">
          The first deploy builds the image and downloads BiRefNet weights — takes
          ~3 minutes. Subsequent deploys are seconds because Modal caches the image
          layer cache.
        </p>
      </Section>

      <Section id="env" title="3. Configure secrets (optional)">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Stock <code className="code-chip">app.py</code> works with no secrets — it
          accepts unauthenticated requests. To gate access by token, point at your
          own Supabase tokens table, or report metered usage to Stripe, set these:
        </p>
        <CodeTabs tabs={ENV_TABS} dark />
      </Section>

      <Section id="costs" title="4. Cost math">
        <div className="border border-kno-border-gray rounded-kno-lg overflow-hidden mb-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-kno-surface-gray border-b border-kno-border-gray">
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  GPU
                </th>
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  Cost / hr
                </th>
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  Throughput
                </th>
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  Cost / image
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  gpu: "L4",
                  cost: "$0.80",
                  rate: "5 img/sec",
                  per: "~$0.000044",
                },
                {
                  gpu: "A10G",
                  cost: "$1.10",
                  rate: "8 img/sec",
                  per: "~$0.000038",
                },
                {
                  gpu: "A100-40GB",
                  cost: "$3.10",
                  rate: "18 img/sec",
                  per: "~$0.000048",
                },
              ].map((row) => (
                <tr key={row.gpu} className="border-b last:border-b-0 border-kno-border-gray">
                  <td className="py-2.5 px-4 font-mono text-kno-black font-medium">
                    {row.gpu}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-kno-black">{row.cost}</td>
                  <td className="py-2.5 px-4 font-mono text-kno-text-gray">
                    {row.rate}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-kno-black">{row.per}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[14px] leading-[1.6] text-kno-black">
          L4 is the recommended starting point: cheapest per-image, generous Modal
          free tier, and Modal autoscales to zero when idle so you don&apos;t pay for
          empty containers. Cold start is 60–90 seconds while BiRefNet, Swin2SR, and
          GFPGAN weights load into VRAM. Production workloads should pin{" "}
          <code className="code-chip">keep_warm=1</code> on the Modal function decorator
          to eliminate cold starts; the warm container costs ~$0.80/hr but cuts
          latency back to 200ms.
        </p>
      </Section>

      <Section id="custom-domain" title="5. Custom domain (optional)">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Modal hands you a default URL like{" "}
          <code className="code-chip">https://&lt;username&gt;--api.modal.run</code>.
          To use your own domain (e.g. <code className="code-chip">api.yourcompany.com</code>):
        </p>
        <ol className="list-decimal pl-5 text-[14px] leading-[1.7] text-kno-black flex flex-col gap-2">
          <li>
            Modal dashboard → Settings → Custom domains → Add{" "}
            <code className="code-chip">api.yourcompany.com</code>
          </li>
          <li>
            Modal returns a target hostname; add a CNAME at your DNS provider
          </li>
          <li>Wait ~5 minutes for cert provisioning</li>
        </ol>
      </Section>

      <Section id="updates" title="6. Updating">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Pull the latest changes and redeploy:
        </p>
        <pre className="bg-kno-bg-dark text-[#E5E7EB] border border-kno-border-dark rounded-kno-lg p-[16px_18px] font-mono text-[13px] leading-[1.65] overflow-x-auto m-0">{`git pull
modal deploy app.py`}</pre>
        <p className="text-[14px] leading-[1.6] text-kno-black mt-4">
          Modal does a rolling redeploy with zero downtime. Old containers drain
          gracefully.
        </p>
      </Section>

      <div className="mt-8 pt-8 border-t border-kno-border-gray flex justify-between text-[13px]">
        <a className="text-kno-text-gray hover:text-kno-black" href="/docs">
          ← Quickstart
        </a>
        <a
          className="text-kno-black font-medium hover:text-kno-green"
          href="/docs/self-hosting/byo-gpu"
        >
          Self-host on your own GPU →
        </a>
      </div>
    </article>
  );
}
