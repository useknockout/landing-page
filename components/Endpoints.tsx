type EP = { v: string; p: string; d: string };
type Group = { title: string; eps: EP[] };

const GROUPS: Group[] = [
  {
    title: "Core",
    eps: [
      { v: "POST", p: "/remove", d: "Background removal → transparent PNG/WebP" },
      { v: "POST", p: "/remove-url", d: "Same, but fetch the source from a URL" },
      { v: "POST", p: "/replace-bg", d: "Composite onto color or remote image" },
    ],
  },
  {
    title: "Batch",
    eps: [
      { v: "POST", p: "/remove-batch", d: "Up to 10 multipart files in one call" },
      { v: "POST", p: "/remove-batch-url", d: "Up to 10 URLs in one call" },
    ],
  },
  {
    title: "Cutout variants",
    eps: [
      { v: "POST", p: "/mask", d: "Grayscale alpha matte for your pipeline" },
      { v: "POST", p: "/sticker", d: "Die-cut subject + thick outline (iMessage-style)" },
      { v: "POST", p: "/outline", d: "Thin colored stroke on transparent background" },
      { v: "POST", p: "/smart-crop", d: "Tight bounding box around subject" },
      { v: "POST", p: "/silhouette", d: "Two-tone silhouette portrait · Apple Music aesthetic" },
      { v: "POST", p: "/inpaint", d: "LaMa erase & fill · auto-subject / mask / bbox modes" },
    ],
  },
  {
    title: "Composition",
    eps: [
      { v: "POST", p: "/shadow", d: "Composite with configurable drop shadow" },
      { v: "POST", p: "/studio-shot", d: "E-commerce preset: cutout, padding, shadow" },
      { v: "POST", p: "/headshot", d: "Portrait-style cleanup for profile photos" },
      { v: "POST", p: "/compare", d: "Before/after side-by-side preview" },
    ],
  },
  {
    title: "Enhancement",
    eps: [
      { v: "POST", p: "/upscale", d: "Swin2SR default · Real-ESRGAN via model param" },
      { v: "POST", p: "/face-restore", d: "GFPGAN face restoration · optional bg upscale" },
      { v: "POST", p: "/colorize", d: "DDColor B&W photo colorization · ~500ms warm" },
    ],
  },
  {
    title: "Utility",
    eps: [
      { v: "POST", p: "/preview", d: "Low-res quick preview before billing the full call" },
      { v: "POST", p: "/estimate", d: "Cost / credits estimator — no GPU spend" },
      { v: "GET", p: "/health", d: "Service status — no auth required" },
      { v: "GET", p: "/stats", d: "Usage stats for your token" },
      { v: "GET", p: "/", d: "Root — API metadata" },
    ],
  },
];

export function Endpoints() {
  return (
    <section id="endpoints" className="bg-kno-white px-8 py-20">
      <div className="max-w-kno-content mx-auto">
        <div className="mb-8">
          <h2
            className="font-bold m-0"
            style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            One API, twenty-three endpoints.
          </h2>
          <p className="text-[16px] text-kno-text-gray mt-2 max-w-[640px]">
            Cover the full image-cutout, composition, and enhancement workflow without stitching
            together half a dozen vendors.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="font-mono text-[12px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold mb-3">
                {g.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 border border-kno-border-gray rounded-kno-xl overflow-hidden">
                {g.eps.map((e, i) => {
                  const isLast = i === g.eps.length - 1;
                  const isOdd = g.eps.length % 2 === 1 && isLast;
                  const slug = e.p === "/" ? "root" : e.p.slice(1);
                  return (
                    <a
                      key={e.p}
                      href={`/docs/endpoints/${slug}`}
                      className={`flex items-center gap-3.5 px-[18px] py-3.5 bg-kno-white hover:bg-kno-surface-gray transition-colors duration-kno-fast ease-kno-out border-b border-kno-border-gray md:[&:nth-child(odd)]:border-r ${
                        isOdd ? "md:col-span-2" : ""
                      }`}
                    >
                      <span className="inline-flex px-2 py-[3px] rounded-kno-sm font-mono text-[11px] font-semibold bg-kno-black text-kno-green tracking-[0.04em] min-w-[42px] justify-center">
                        {e.v}
                      </span>
                      <span className="font-mono text-[14px] text-kno-black font-medium">
                        {e.p}
                      </span>
                      <span className="ml-auto text-[13px] text-kno-text-gray hidden sm:inline">
                        {e.d}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
