"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
  { src: "/assets/examples/dog-on-blue.jpg", out: "/assets/examples/hair-cutout.png", name: "dog-on-blue.jpg" },
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

export function Playground() {
  const [endpoint, setEndpoint] = useState<Endpoint>("/remove");
  const [format, setFormat] = useState<"png" | "webp">("png");
  const [exampleIdx, setExampleIdx] = useState(0);
  const [lang, setLang] = useState<Lang>("cURL");
  const example = EXAMPLES[exampleIdx];
  const code = useMemo(
    () => snippet(lang, endpoint, example.name, format),
    [lang, endpoint, example.name, format],
  );

  return (
    <div className="max-w-kno-content-wide mx-auto px-8 py-8 grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <h1 className="text-[36px] font-bold tracking-[-0.025em] m-0">Try it. No signup.</h1>
        <p className="text-[16px] text-kno-text-gray mt-1.5 max-w-[640px]">
          Pick an example or drop your own image. The exact code that produced this result updates
          live on the right.
        </p>
      </div>

      {/* canvas panel */}
      <div className="border border-kno-border-gray rounded-kno-xl overflow-hidden bg-kno-white flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-kno-border-gray bg-kno-surface-gray">
          <span className="inline-flex px-2 py-[3px] rounded-kno-sm font-mono text-[11px] font-semibold bg-kno-black text-kno-green tracking-[0.04em]">
            POST
          </span>
          <span className="font-semibold text-[14px]">{endpoint}</span>
          <span className="ml-auto">
            <StatusPill status="operational" label="184ms" />
          </span>
        </div>

        <div className="aspect-square relative checker">
          <Image
            src={example.out}
            alt="Cutout preview"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-contain p-[8%]"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-kno-border-gray bg-kno-surface-gray">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.name}
              type="button"
              onClick={() => setExampleIdx(i)}
              className={`aspect-square bg-kno-white border rounded-kno-md overflow-hidden cursor-pointer transition-all duration-kno-fast ease-kno-out ${
                i === exampleIdx
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
              className="bg-kno-green text-kno-black border-0 px-3.5 py-2.5 rounded-kno-md font-semibold text-[13px] cursor-pointer hover:bg-kno-green-hover active:bg-kno-green-press transition-colors duration-kno-fast ease-kno-out"
            >
              Run again
            </button>
            <button
              type="button"
              className="bg-kno-white border border-kno-border-gray text-kno-black px-3.5 py-2.5 rounded-kno-md font-semibold text-[13px] cursor-pointer hover:bg-kno-surface-gray transition-colors duration-kno-fast ease-kno-out"
            >
              Upload your own…
            </button>
            <span className="ml-auto font-mono text-[11px] text-kno-text-gray">
              ~200ms · L4 GPU
            </span>
          </div>
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
          <StatusPill status="operational" label="200 OK" />
          <span>image/{format} · 1024×1024 · 248 KB</span>
          <span className="ml-auto font-mono">x-knockout-model: BiRefNet</span>
        </div>
      </div>
    </div>
  );
}
