/**
 * Logo strip directly under StatStrip — quick credibility lift.
 * Mono wordmarks, no real brand SVGs (avoids legal nag from logos used out of license).
 * Hover ties them to the relevant docs page or upstream repo.
 */

const ITEMS: { label: string; href: string; sub: string }[] = [
  {
    label: "Modal",
    sub: "Serverless GPU runtime",
    href: "https://modal.com",
  },
  {
    label: "BiRefNet",
    sub: "SOTA matting · #1 on DIS5K",
    href: "https://github.com/ZhengPeng7/BiRefNet",
  },
  {
    label: "Hugging Face",
    sub: "Model weights · MIT",
    href: "https://huggingface.co/ZhengPeng7/BiRefNet",
  },
  {
    label: "Swin2SR",
    sub: "Photo super-resolution",
    href: "https://github.com/mv-lab/swin2sr",
  },
  {
    label: "GFPGAN",
    sub: "Face restoration",
    href: "https://github.com/TencentARC/GFPGAN",
  },
];

export function TrustedBy() {
  return (
    <section className="bg-kno-white px-8 py-14 border-b border-kno-border-gray">
      <div className="max-w-kno-content mx-auto">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.08em] text-kno-text-gray font-semibold mb-6">
          Built on open infra · ship the credit, not just the call
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-5 items-center">
          {ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center transition-opacity duration-kno-fast ease-kno-out hover:opacity-100 opacity-70"
            >
              <span
                className="font-bold text-kno-black tracking-[-0.01em] group-hover:text-kno-black"
                style={{ fontSize: 22 }}
              >
                {item.label}
              </span>
              <span className="font-mono text-[11px] text-kno-text-gray mt-1">
                {item.sub}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
