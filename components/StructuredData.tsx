/**
 * JSON-LD structured data for the homepage.
 * Renders two schema.org records:
 *   - Product (the API itself, with offer + ratings)
 *   - FAQPage (mirrors the FAQ section copy verbatim)
 *
 * Google reads these for rich-result snippets in SERP. If we change the FAQ
 * copy in components/FAQ.tsx, update FAQ_ITEMS below to match — they need to
 * be byte-for-byte identical or Google flags it as a manipulation attempt.
 */

const SITE_URL = "https://useknockout.com";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "How fast is it?",
    a: "Warm calls are around 200ms for a 1024x1024 image on a Modal L4 GPU. The first request after a cold container is 60-90s while we load BiRefNet, Swin2SR, and GFPGAN weights — the trade-off for $0 idle cost. Production traffic stays on warm containers; pin a keep_warm=1 worker if you want to eliminate cold starts entirely.",
  },
  {
    q: "How does the price compare?",
    a: "$0.005 per image on the paid tier — about 40x cheaper than remove.bg's $0.20 PAYG rate. The free tier covers 20 images per month with no card required.",
  },
  {
    q: "Is the model open source?",
    a: "Yes. Both the API code and the BiRefNet model weights are MIT licensed. You can self-host on your own Modal account in four commands, or fork everything outright.",
  },
  {
    q: "What image formats are supported?",
    a: "Input: JPG, PNG, WebP, HEIC, up to 10 MB and 4096x4096. Output: PNG (with alpha) by default, or WebP for smaller files. Set the format via the response Accept header or the format param.",
  },
  {
    q: "Do you store my images?",
    a: "No. Images are processed in-memory and discarded after the response is returned. Nothing is logged beyond per-request latency, status, and content size.",
  },
  {
    q: "What happens if quality is poor on my images?",
    a: "Open an issue on GitHub with a sample. BiRefNet handles hair, glass, and group photos well, but edge cases exist. Contributions to the eval set are welcomed.",
  },
  {
    q: "Is there a webhook for batch processing?",
    a: "Sync is the default — the response body is the cutout PNG. For batches, use the SDK's Promise.all pattern or roll your own queue. A native batch endpoint is on the roadmap.",
  },
  {
    q: "Where do I report a bug?",
    a: "github.com/useknockout/api — issues are triaged daily. For private security reports, email security@useknockout.com.",
  },
];

const product = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "useknockout",
  description:
    "Open-source image API for developers. Background removal, super-resolution, face restore, sticker outlines, studio composites, batch processing, and 20+ more endpoints. ~200ms per call. MIT licensed, self-hostable, 40x cheaper than remove.bg.",
  brand: { "@type": "Brand", name: "useknockout" },
  url: SITE_URL,
  image: `${SITE_URL}/og-card.png`,
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "0.005",
    priceCurrency: "USD",
    offerCount: "3",
    availability: "https://schema.org/InStock",
  },
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (HTTP API)",
};

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "useknockout",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-icon.png`,
  sameAs: [
    "https://github.com/useknockout/api",
    "https://x.com/useknockout",
  ],
};

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
