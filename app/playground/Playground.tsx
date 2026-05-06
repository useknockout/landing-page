"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { StatusPill } from "@/components/StatusPill";

type Endpoint =
  | "/remove"
  | "/remove-url"
  | "/replace-bg"
  | "/mask"
  | "/sticker"
  | "/outline"
  | "/smart-crop"
  | "/shadow"
  | "/studio-shot"
  | "/headshot"
  | "/upscale"
  | "/face-restore"
  | "/preview";

const ENDPOINTS: { value: Endpoint; label: string }[] = [
  { value: "/remove", label: "POST /remove — transparent PNG" },
  { value: "/remove-url", label: "POST /remove-url — same, source from URL" },
  { value: "/replace-bg", label: "POST /replace-bg — composite onto color or image" },
  { value: "/mask", label: "POST /mask — grayscale alpha matte" },
  { value: "/sticker", label: "POST /sticker — die-cut outlined cutout" },
  { value: "/outline", label: "POST /outline — thin colored stroke" },
  { value: "/smart-crop", label: "POST /smart-crop — tight bounding box" },
  { value: "/shadow", label: "POST /shadow — drop shadow composite" },
  { value: "/studio-shot", label: "POST /studio-shot — e-commerce preset" },
  { value: "/headshot", label: "POST /headshot — portrait cleanup" },
  { value: "/upscale", label: "POST /upscale — Swin2SR / Real-ESRGAN" },
  { value: "/face-restore", label: "POST /face-restore — GFPGAN" },
  { value: "/preview", label: "POST /preview — low-res quick preview" },
];

const EXAMPLES = [
  { src: "/assets/examples/dog-on-blue.jpg", out: "/assets/examples/compare-example.png", name: "dog-on-blue.jpg" },
  { src: "/assets/examples/cocktail-glass.png", out: "/assets/examples/cocktail-glass.png", name: "cocktail-glass.png" },
  { src: "/assets/examples/group-on-mountains.png", out: "/assets/examples/group-on-mountains.png", name: "group-on-mountains.png" },
  { src: "/assets/examples/studio-shot-example.jpg", out: "/assets/examples/studio-shot-example.jpg", name: "studio-shot.jpg" },
];

type Lang = "cURL" | "Node" | "React" | "Python";
const LANGS: Lang[] = ["cURL", "Node", "React", "Python"];

function snippet(lang: Lang, endpoint: Endpoint, file: string, format: string): string {
  switch (lang) {
    case "cURL":
      return `curl -X POST "https://useknockout--api.modal.run${endpoint}" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@${file}" \\
  -F "format=${format}" \\
  -o out.${format}

# response: image/${format} · 184ms · 248 KB`;
    case "Node":
      return `import { Knockout } from "@useknockout/node";

const client = new Knockout({ token: process.env.KNOCKOUT_TOKEN });
const png = await client.${endpoint.replace("/", "")}({
  file: "./${file}",
  format: "${format}",
});
await png.writeFile("out.${format}");`;
    case "React":
      return `import { useRemoveBackground } from "@useknockout/react";

const { remove, dataUrl, isLoading } = useRemoveBackground({
  token: process.env.NEXT_PUBLIC_KNOCKOUT_TOKEN,
  endpoint: "${endpoint}",
  format: "${format}",
});

<input type="file" onChange={e => remove(e.target.files[0])} />
{dataUrl && <img src={dataUrl} />}`;
    case "Python":
      return `import requests

resp = requests.post(
    "https://useknockout--api.modal.run${endpoint}",
    headers={"Authorization": f"Bearer {TOKEN}"},
    files={"file": open("${file}", "rb")},
    data={"format": "${format}"},
)
open("out.${format}", "wb").write(resp.content)`;
  }
}

type RunState =
  | { kind: "idle" }
  | { kind: "running" }
  | {
      kind: "ok";
      blobUrl: string;
      latencyMs: number;
      contentType: string;
      sizeBytes: number;
      model: string;
    }
  | { kind: "error"; status: number; message: string };

export function Playground() {
  const [endpoint, setEndpoint] = useState<Endpoint>("/remove");
  const [format, setFormat] = useState<"png" | "webp">("png");
  const [exampleIdx, setExampleIdx] = useState(0);
  const [lang, setLang] = useState<Lang>("cURL");
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const example = EXAMPLES[exampleIdx];
  const filename = uploadedFile?.name ?? example.name;
  const code = useMemo(
    () => snippet(lang, endpoint, filename, format),
    [lang, endpoint, filename, format],
  );

  // Revoke object URLs to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (run.kind === "ok") URL.revokeObjectURL(run.blobUrl);
    };
  }, [run]);

  async function loadFileFromUrl(url: string, name: string): Promise<File> {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new File([blob], name, { type: blob.type || "image/jpeg" });
  }

  async function runRequest(file?: File) {
    const sourceFile =
      file ?? uploadedFile ?? (await loadFileFromUrl(example.src, example.name));

    setRun({ kind: "running" });
    const start = performance.now();
    try {
      const fd = new FormData();
      fd.append("file", sourceFile);
      fd.append("format", format);

      const resp = await fetch(
        `/api/playground?endpoint=${encodeURIComponent(endpoint)}`,
        { method: "POST", body: fd },
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        setRun({
          kind: "error",
          status: resp.status,
          message: errorMessage(resp.status, body.error),
        });
        return;
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const headerLatency = Number.parseInt(
        resp.headers.get("x-knockout-latency") ?? "0",
        10,
      );
      const latencyMs = headerLatency > 0 ? headerLatency : Math.round(performance.now() - start);

      setRun({
        kind: "ok",
        blobUrl,
        latencyMs,
        contentType: resp.headers.get("content-type") ?? `image/${format}`,
        sizeBytes: blob.size,
        model: resp.headers.get("x-knockout-model") ?? "BiRefNet",
      });
    } catch (err) {
      setRun({
        kind: "error",
        status: 0,
        message: err instanceof Error ? err.message : "Request failed",
      });
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    void runRequest(file);
  }

  // Choose canvas source. Priority:
  //   1. result blob (after a successful run — this is the cutout we want to brag about)
  //   2. uploaded preview (while waiting on the run, so the user sees what they picked)
  //   3. example baked output
  // Memoize the upload preview URL so we don't leak object URLs every render.
  const uploadPreviewUrl = useMemo(() => {
    if (!uploadedFile) return null;
    return URL.createObjectURL(uploadedFile);
  }, [uploadedFile]);
  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const canvasSrc =
    run.kind === "ok"
      ? run.blobUrl
      : uploadPreviewUrl ?? example.out;

  const canvasIsResult = run.kind === "ok";

  return (
    <div className="max-w-kno-content-wide mx-auto px-8 py-8 grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[36px] font-bold tracking-[-0.025em] m-0">Try it. No signup.</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kno-success-mint border border-[#A7F3D0] font-mono text-[11px] text-kno-success-fg font-medium">
            <span className="w-[6px] h-[6px] rounded-full bg-kno-green" aria-hidden />
            Live · ~200ms warm
          </span>
        </div>
        <p className="text-[16px] text-kno-text-gray mt-1.5 max-w-[640px]">
          Pick an example or drop your own image. Hits the real Modal API — the cutout you
          see is the cutout your code would get. The right panel shows the exact request that
          produced it.
        </p>
        {run.kind === "error" && run.status === 503 && (
          <div className="mt-4 px-4 py-3 rounded-kno-md border border-kno-warn-border bg-kno-warn-bg text-[13px] text-kno-warn-fg flex items-start gap-3">
            <span className="font-mono font-semibold uppercase tracking-[0.04em]">Heads up</span>
            <span>
              The browser playground is briefly offline while we rotate the public-beta token.
              The code panel is still accurate — copy and run it locally with your own token.{" "}
              <a
                href="https://github.com/useknockout/api"
                className="underline decoration-kno-warn-amber underline-offset-4 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get a token &rarr;
              </a>
            </span>
          </div>
        )}
      </div>

      {/* canvas panel */}
      <div className="border border-kno-border-gray rounded-kno-xl overflow-hidden bg-kno-white flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-kno-border-gray bg-kno-surface-gray">
          <span className="inline-flex px-2 py-[3px] rounded-kno-sm font-mono text-[11px] font-semibold bg-kno-black text-kno-green tracking-[0.04em]">
            POST
          </span>
          <span className="font-semibold text-[14px]">{endpoint}</span>
          <span className="ml-auto">
            {run.kind === "running" ? (
              <span className="font-mono text-[11px] text-kno-text-gray">running…</span>
            ) : run.kind === "ok" ? (
              <StatusPill status="operational" label={`${run.latencyMs}ms`} />
            ) : (
              <StatusPill status="operational" label="ready" />
            )}
          </span>
        </div>

        <div className="aspect-square relative checker">
          {canvasSrc.startsWith("blob:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={canvasSrc}
              alt={canvasIsResult ? "API result" : "Source preview"}
              className="absolute inset-0 w-full h-full object-contain p-[8%]"
            />
          ) : (
            <Image
              src={canvasSrc}
              alt="Cutout preview"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-contain p-[8%]"
            />
          )}
          {run.kind === "running" && (
            <div className="absolute inset-0 bg-kno-white/60 flex items-center justify-center">
              <div className="font-mono text-[12px] text-kno-black bg-kno-white border border-kno-border-gray rounded-full px-3 py-1.5 shadow-kno-sm">
                processing…
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-kno-border-gray bg-kno-surface-gray">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.name}
              type="button"
              onClick={() => {
                setExampleIdx(i);
                setUploadedFile(null);
                setRun({ kind: "idle" });
              }}
              className={`aspect-square bg-kno-white border rounded-kno-md overflow-hidden cursor-pointer transition-all duration-kno-fast ease-kno-out ${
                i === exampleIdx && !uploadedFile
                  ? "border-kno-green ring-2 ring-kno-green/35"
                  : "border-kno-border-gray hover:border-kno-border-strong"
              }`}
              aria-label={`Use example ${e.name}`}
            >
              <Image
                src={e.src}
                alt=""
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="px-4 py-3.5 border-t border-kno-border-gray bg-kno-white flex flex-col gap-3">
          <div className="flex gap-2.5 items-center">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[12px] text-kno-text-gray font-medium">Endpoint</label>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value as Endpoint)}
                className="font-sans text-[13px] px-2.5 py-2 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
              >
                {ENDPOINTS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 max-w-[120px]">
              <label className="text-[12px] text-kno-text-gray font-medium">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "png" | "webp")}
                className="font-sans text-[13px] px-2.5 py-2 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
              >
                <option value="png">png</option>
                <option value="webp">webp</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2.5 items-center">
            <button
              type="button"
              onClick={() => void runRequest()}
              disabled={run.kind === "running"}
              className="bg-kno-green text-kno-black border-0 px-3.5 py-2.5 rounded-kno-md font-semibold text-[13px] cursor-pointer hover:bg-kno-green-hover active:bg-kno-green-press disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-kno-fast ease-kno-out"
            >
              {run.kind === "running" ? "Running…" : "Run"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-kno-white border border-kno-border-gray text-kno-black px-3.5 py-2.5 rounded-kno-md font-semibold text-[13px] cursor-pointer hover:bg-kno-surface-gray transition-colors duration-kno-fast ease-kno-out"
            >
              Upload your own…
            </button>
            <span className="ml-auto font-mono text-[11px] text-kno-text-gray">
              ~200ms · L4 GPU
            </span>
          </div>
          {run.kind === "error" && run.status !== 503 && (
            <div className="px-3 py-2 rounded-kno-md border border-[#FCA5A5] bg-kno-error-bg text-[13px] text-[#B91C1C]">
              {run.message}
            </div>
          )}
        </div>
      </div>

      {/* code panel */}
      <div className="border border-kno-border-gray rounded-kno-xl overflow-hidden bg-kno-white flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-kno-border-gray bg-kno-surface-gray">
          <span className="font-semibold text-[14px]">Code</span>
          <span className="ml-auto font-mono text-[11px] text-kno-text-gray">
            updates live with inputs
          </span>
        </div>

        <div className="flex bg-kno-bg-dark border-b border-kno-border-dark">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3.5 py-2.5 font-sans text-[12px] font-medium cursor-pointer border-b-2 -mb-px transition-colors duration-kno-fast ease-kno-out ${
                lang === l
                  ? "text-kno-green border-kno-green"
                  : "text-kno-text-gray-dark border-transparent hover:text-kno-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <CodeBlock dark className="rounded-none border-0 h-full">
            {code}
          </CodeBlock>
        </div>

        <div className="px-4 py-3.5 border-t border-kno-border-gray bg-kno-surface-gray flex flex-wrap gap-2.5 items-center text-[12px] text-kno-text-gray">
          {run.kind === "ok" ? (
            <>
              <StatusPill status="operational" label="200 OK" />
              <span>
                {run.contentType} · {(run.sizeBytes / 1024).toFixed(1)} KB
              </span>
              <span className="ml-auto font-mono">x-knockout-model: {run.model}</span>
            </>
          ) : (
            <>
              <StatusPill status="operational" label="ready" />
              <span>image/{format} · waiting for run</span>
              <span className="ml-auto font-mono">x-knockout-model: BiRefNet</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function errorMessage(status: number, code?: string): string {
  if (status === 503 && code === "playground_not_configured") {
    return "Playground proxy not yet configured. Star the repo while we wire it up.";
  }
  if (status === 429) return "You're hitting the public-beta rate limit. Wait a minute and retry.";
  if (status === 401) return "Public-beta token rejected. We're investigating.";
  if (status === 413) return "Image too large. Max 10 MB and 4096×4096.";
  if (status === 422) return "We couldn't isolate a subject in this image. Try another.";
  if (code) return `Error: ${code}`;
  return `Request failed (HTTP ${status}).`;
}
