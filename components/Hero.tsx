import Image from "next/image";
import { Button } from "./Button";
import { CodeBlock } from "./CodeBlock";

const SNIPPET = `curl -X POST "https://useknockout--api.modal.run/remove" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@cat.jpg" -o out.png`;

export function Hero() {
  return (
    <section className="px-8 py-20 max-w-kno-content-wide mx-auto">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-[5px] rounded-full bg-kno-surface-gray border border-kno-border-gray text-[12px] font-medium font-mono text-kno-black w-fit">
            <span className="w-[6px] h-[6px] rounded-full bg-kno-green" aria-hidden />
            Public beta · free during beta
          </div>

          <h1
            className="font-bold text-kno-black"
            style={{ fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            Background removal API <span className="text-kno-green">for developers.</span>
          </h1>

          <p className="text-[18px] leading-[1.5] text-kno-text-gray max-w-[540px]">
            Drop an image in. Get a transparent PNG out. ~200&nbsp;ms per call. BiRefNet on Modal
            GPUs. MIT licensed, self-hostable, 40× cheaper than remove.bg.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Button href="https://github.com/useknockout/api" variant="primary" size="lg">
              Get API token →
            </Button>
            <Button href="https://github.com/useknockout/api" variant="secondary" size="lg">
              View on GitHub
            </Button>
          </div>

          <div className="mt-2">
            <CodeBlock dark language="bash">
              {SNIPPET}
            </CodeBlock>
          </div>
        </div>

        <Compare />
      </div>
    </section>
  );
}

function Compare() {
  return (
    <div className="grid grid-cols-2 rounded-kno-xl overflow-hidden border border-kno-border-gray shadow-kno-lg">
      <div className="aspect-square relative">
        <span className="absolute top-3 left-3 z-10 font-mono text-[11px] px-2 py-1 rounded-full bg-black/85 text-kno-white">
          Original
        </span>
        <Image
          src="/assets/examples/dog-on-blue.jpg"
          alt="Original photo"
          fill
          sizes="(max-width: 1024px) 50vw, 360px"
          className="object-cover"
        />
      </div>
      <div className="aspect-square relative checker">
        <span className="absolute top-3 left-3 z-10 font-mono text-[11px] px-2 py-1 rounded-full bg-black/85 text-kno-white">
          Cutout
        </span>
        <Image
          src="/assets/examples/hair-cutout.png"
          alt="Background-removed cutout"
          fill
          sizes="(max-width: 1024px) 50vw, 360px"
          className="object-contain p-[6%]"
        />
      </div>
    </div>
  );
}
