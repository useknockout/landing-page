import Image from "next/image";

const ITEMS = [
  {
    tag: "Hair",
    img: "/assets/examples/hair-cutout.png",
    title: "Wisps without halos",
    body: "Closed-form foreground matting cleans soft edges. No fringing, even on stark color contrasts.",
  },
  {
    tag: "Glass",
    img: "/assets/examples/cocktail-glass.png",
    title: "Transparent objects",
    body: "Cocktail glasses, perfume bottles, water — handled cleanly. The matte preserves real opacity.",
  },
  {
    tag: "Multi-subject",
    img: "/assets/examples/group-on-mountains.png",
    title: "Group photos",
    body: "Multiple people, overlapping subjects, complex backgrounds. BiRefNet handles them in one pass.",
  },
  {
    tag: "Stickers",
    img: "/assets/examples/sticker-example.png",
    title: "Sticker style",
    body: "iMessage / WhatsApp / Telegram-ready cutouts with a configurable outline width.",
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-kno-white px-8 py-20">
      <div className="max-w-kno-content mx-auto">
        <div className="mb-8">
          <h2
            className="font-bold m-0"
            style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            SOTA quality. Real photos.
          </h2>
          <p className="text-[16px] text-kno-text-gray mt-2 max-w-[560px]">
            BiRefNet ranks #1 on DIS5K and HRSOD. We benchmark against remove.bg on hard subjects:
            hair, fur, glass, group photos.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => (
            <article
              key={it.tag}
              className="bg-kno-white border border-kno-border-gray rounded-kno-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-square relative checker">
                <Image
                  src={it.img}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 280px"
                  className="object-contain p-[8%]"
                />
                <span className="absolute top-2.5 left-2.5 font-mono text-[10px] px-[7px] py-[3px] rounded-full bg-black/85 text-kno-white">
                  {it.tag}
                </span>
              </div>
              <div className="p-[18px] flex flex-col gap-1.5">
                <h3 className="text-[16px] font-semibold m-0">{it.title}</h3>
                <p className="text-[13px] text-kno-text-gray m-0 leading-[1.5]">{it.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
