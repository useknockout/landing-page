import { FeatureCarousel, type CarouselItem } from "@/components/ui/feature-carousel";

const ITEMS: CarouselItem[] = [
  {
    tag: "Hair",
    img: "/assets/examples/woman-laptop-cutout.png",
    title: "Wisps without halos",
    body: "Closed-form foreground matting cleans soft edges. No fringing, even on stark color contrasts. This was a real run on the playground — your eyes, not a marketing render.",
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

        <FeatureCarousel items={ITEMS} />
      </div>
    </section>
  );
}
