import type { Metadata } from "next";
import { CodeTabs } from "@/components/CodeTabs";
import { Callout, Section } from "@/components/Endpoint";

export const metadata: Metadata = {
  title: "Self-host on your own GPU",
  description:
    "Run useknockout on bare metal with a single NVIDIA GPU. Docker + uvicorn + nginx, 30 minutes start-to-finish.",
};

const RUN_TABS = [
  {
    name: "Docker",
    code: `# Pull the image
docker pull ghcr.io/useknockout/api:latest

# Run with GPU access. Adjust --gpus flag for your CUDA setup.
docker run -d --name knockout \\
  --gpus all \\
  -p 8000:8000 \\
  -e KNOCKOUT_ADMIN_TOKEN=<random 32 chars> \\
  ghcr.io/useknockout/api:latest

# Verify
curl http://localhost:8000/health`,
  },
  {
    name: "From source",
    code: `# Clone, install, run
git clone https://github.com/useknockout/api
cd api

# Python 3.10+, CUDA 12, ~12 GB VRAM
pip install -r requirements.txt

# Pull weights from HuggingFace
huggingface-cli download ZhengPeng7/BiRefNet \\
  --local-dir ./weights/birefnet

# Start
uvicorn app.main:app --host 0.0.0.0 --port 8000`,
  },
];

const NGINX_TABS = [
  {
    name: "nginx + Let's Encrypt",
    code: `# /etc/nginx/sites-available/knockout
server {
    listen 80;
    server_name api.yourcompany.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourcompany.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourcompany.com/privkey.pem;

    client_max_body_size 12M;
    proxy_read_timeout 60s;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Issue cert + reload
sudo certbot --nginx -d api.yourcompany.com
sudo systemctl reload nginx`,
  },
];

const TUNING_TABS = [
  {
    name: "fp16 + torch.compile",
    code: `# In app/model.py — flip to half precision and compile the forward pass.
# ~2x throughput, ~30% lower VRAM, no quality loss for BiRefNet.

import torch
from BiRefNet.models.birefnet import BiRefNet

model = BiRefNet(bb_pretrained=False).half().cuda()
model.load_state_dict(torch.load("./weights/birefnet/model.pth"))
model = torch.compile(model, mode="reduce-overhead")
model.eval()`,
  },
  {
    name: "Batching",
    code: `# Batch inputs at the request layer to maximize GPU utilization.
# Single requests still respond in ~200ms; batches of 4 in ~340ms.

@app.post("/remove-batch")
async def remove_batch(files: list[UploadFile]):
    if len(files) > 10:
        raise HTTPException(413, "max 10 images per batch")
    images = [Image.open(io.BytesIO(await f.read())) for f in files]
    cutouts = model.batch_predict(images)
    return [serialize_png(c) for c in cutouts]`,
  },
];

export default function ByoGpuPage() {
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
          Run useknockout on your own GPU
        </h1>
        <p className="text-[16px] leading-[1.55] text-kno-text-gray mt-3 max-w-[640px]">
          Bare-metal escape hatch. If you already pay for a GPU server (Hetzner,
          Lambda, on-prem) and want zero per-call cost, this is the path. Modal
          self-host is easier; this is cheaper at steady-state scale.
        </p>
      </header>

      <Callout tone="info">
        Choose this path if you have ≥ 1 idle GPU and predictable load. For bursty
        traffic, Modal&apos;s autoscale-to-zero usually wins on cost.
      </Callout>

      <Section id="prereqs" title="1. Prerequisites">
        <ul className="list-disc pl-5 text-[14px] leading-[1.7] text-kno-black flex flex-col gap-2">
          <li>NVIDIA GPU with ≥ 12 GB VRAM (RTX 3090, 4090, A10, A40, A100, L4, L40)</li>
          <li>NVIDIA driver ≥ 535, CUDA 12.x</li>
          <li>Linux (tested on Ubuntu 22.04, Debian 12)</li>
          <li>Docker with NVIDIA Container Toolkit, OR Python 3.10+</li>
          <li>~10 GB disk for weights + dependencies</li>
        </ul>
      </Section>

      <Section id="run" title="2. Run">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Two options. Docker is the smoothest path because the image bundles model
          weights and CUDA dependencies. From-source gives you full control over
          versions and lets you patch in custom routes.
        </p>
        <CodeTabs tabs={RUN_TABS} dark />
        <p className="text-[14px] leading-[1.6] text-kno-black mt-4">
          First start downloads BiRefNet weights (~880 MB). Subsequent starts are
          instant.
        </p>
      </Section>

      <Section id="reverse-proxy" title="3. Reverse proxy + TLS">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Don&apos;t expose port 8000 directly. nginx + Let&apos;s Encrypt = free,
          5-minute setup.
        </p>
        <CodeTabs tabs={NGINX_TABS} dark />
      </Section>

      <Section id="tuning" title="4. Performance tuning">
        <p className="text-[14px] leading-[1.6] text-kno-black mb-4">
          Stock config processes ~5 images/sec on an L4. With fp16 + compile +
          request batching, you can push 12-15 images/sec.
        </p>
        <CodeTabs tabs={TUNING_TABS} dark />
      </Section>

      <Section id="tradeoffs" title="5. When to pick this over Modal">
        <div className="border border-kno-border-gray rounded-kno-lg overflow-hidden mb-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-kno-surface-gray border-b border-kno-border-gray">
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  Concern
                </th>
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  Modal
                </th>
                <th className="text-left font-semibold py-2.5 px-4 font-mono text-[12px]">
                  BYO GPU
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Cost at 100k img/mo", "~$30", "~$0 (sunk GPU)"],
                ["Cost at 10M img/mo", "~$2,500", "~$0 (sunk GPU)"],
                ["Cold start", "60–90s (autoscale-to-zero)", "0s (always warm)"],
                ["Ops overhead", "Minimal", "You manage updates, security, scaling"],
                ["Best for", "Bursty traffic", "Steady-state high volume"],
                ["Time to first call", "~3 min", "~30 min"],
              ].map(([c, m, b]) => (
                <tr key={c} className="border-b last:border-b-0 border-kno-border-gray">
                  <td className="py-2.5 px-4 font-mono text-kno-black font-medium">
                    {c}
                  </td>
                  <td className="py-2.5 px-4 text-kno-black">{m}</td>
                  <td className="py-2.5 px-4 text-kno-black">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="updating" title="6. Updating">
        <pre className="bg-kno-bg-dark text-[#E5E7EB] border border-kno-border-dark rounded-kno-lg p-[16px_18px] font-mono text-[13px] leading-[1.65] overflow-x-auto m-0">{`# Docker
docker pull ghcr.io/useknockout/api:latest
docker stop knockout && docker rm knockout
# re-run the docker run command from above

# From source
cd api
git pull
pip install -r requirements.txt
sudo systemctl restart knockout`}</pre>
      </Section>

      <Callout tone="warning">
        Pin the image tag in production: <code className="code-chip">ghcr.io/useknockout/api:v1.4.0</code>{" "}
        instead of <code className="code-chip">latest</code>. Auto-pulling
        <code className="code-chip">latest</code> bites you when a regression ships.
      </Callout>

      <div className="mt-8 pt-8 border-t border-kno-border-gray flex justify-between text-[13px]">
        <a
          className="text-kno-text-gray hover:text-kno-black"
          href="/docs/self-hosting/modal"
        >
          ← Self-host on Modal
        </a>
        <a className="text-kno-black font-medium hover:text-kno-green" href="/docs">
          Back to Quickstart →
        </a>
      </div>
    </article>
  );
}
