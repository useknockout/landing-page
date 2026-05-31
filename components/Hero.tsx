import Image from "next/image";
import { Button } from "./Button";
import { CodeTabs } from "./CodeTabs";

const SNIPPETS = [
  {
    name: "cURL",
    code: `curl -X POST "https://useknockout--api.modal.run/remove" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@cat.jpg" -o out.png`,
  },
  {
    name: "Node",
    code: `import { Knockout } from "@useknockout/node";

const client = new Knockout({ token: process.env.KNOCKOUT_TOKEN });
const png = await client.remove({ file: "./cat.jpg" });
await png.writeFile("out.png");`,
  },
  {
    name: "Python",
    code: `import requests

resp = requests.post(
    "https://useknockout--api.modal.run/remove",
    headers={"Authorization": f"Bearer {TOKEN}"},
    files={"file": open("cat.jpg", "rb")},
)
open("out.png", "wb").write(resp.content)`,
  },
  {
    name: "React",
    code: `import { useRemoveBackground } from "@useknockout/react";

const { remove, dataUrl, isLoading } = useRemoveBackground({ token });

<input type="file" onChange={e => remove(e.target.files[0])} />
{dataUrl && <img src={dataUrl} alt="cutout" />}`,
  },
];

export function Hero() {
  return (
    <section className="px-8 py-20 max-w-kno-content-wide mx-auto">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-[5px] rounded-full bg-kno-surface-gray border border-kno-border-gray text-[12px] font-medium font-mono text-kno-black w-fit">
            <span className="w-[6px] h-[6px] rounded-full bg-kno-green" aria-hidden />
            Public beta · free during beta · $0.005/image after
          </div>

          <h1
            className="font-bold text-kno-black"
            style={{ fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            The complete image API <span className="text-kno-green">for developers.</span>
          </h1>

          <p className="text-[18px] leading-[1.5] text-kno-text-gray max-w-[560px]">
            Background removal, super-resolution, face restore, sticker outlines, studio composites, batch
            processing, and 23 endpoints. ~200&nbsp;ms per call. MIT licensed, self-hostable, 40× cheaper than remove.bg.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Button href="/signin?redirect=/dashboard/keys" variant="primary" size="lg">
              Try free →
            </Button>
            <Button href="/playground" variant="secondary" size="lg">
              Try in browser
            </Button>
          </div>

          <div className="mt-2">
            <CodeTabs tabs={SNIPPETS} dark />
          </div>
        </div>

        <Compare />
      </div>
    </section>
  );
}

function Compare() {
  return (
    <div className="relative rounded-kno-xl overflow-hidden border border-kno-border-gray shadow-kno-lg">
      <Image
        src="/assets/examples/compare-example.png"
        alt="Same beagle photo before and after background removal"
        width={1024}
        height={400}
        sizes="(max-width: 1024px) 100vw, 600px"
        className="block w-full h-auto"
        priority
      />
      <span className="absolute top-3 left-3 z-10 font-mono text-[11px] px-2 py-1 rounded-full bg-black/85 text-kno-white">
        Original
      </span>
      <span className="absolute top-3 right-3 z-10 font-mono text-[11px] px-2 py-1 rounded-full bg-black/85 text-kno-white">
        Cutout
      </span>
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-px h-[80%] bg-kno-border-gray opacity-60"
        aria-hidden
      />
    </div>
  );
}
