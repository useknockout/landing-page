"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "How fast is it?",
    a: "Warm latency is around 200ms for a 1024×1024 image on a Modal L4 GPU. Cold starts add ~3 seconds. Most production calls hit a warm container.",
  },
  {
    q: "How does the price compare?",
    a: "$0.005 per image on the paid tier — about 40× cheaper than remove.bg's $0.20 PAYG rate. The free tier covers 50 images per month with no card required.",
  },
  {
    q: "Is the model open source?",
    a: "Yes. Both the API code and the BiRefNet model weights are MIT licensed. You can self-host on your own Modal account in four commands, or fork everything outright.",
  },
  {
    q: "What image formats are supported?",
    a: "Input: JPG, PNG, WebP, HEIC, up to 10 MB and 4096×4096. Output: PNG (with alpha) by default, or WebP for smaller files. Set the format via the response Accept header or the format param.",
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

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-kno-white px-8 py-20">
      <div className="max-w-[760px] mx-auto">
        <div className="mb-8">
          <h2
            className="font-bold m-0"
            style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="border border-kno-border-gray rounded-kno-xl overflow-hidden divide-y divide-kno-border-gray">
          {ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 bg-kno-white hover:bg-kno-surface-gray transition-colors duration-kno-fast ease-kno-out"
                >
                  <span className="text-[15px] font-semibold text-kno-black">{item.q}</span>
                  <span
                    className={`text-kno-text-gray font-mono text-[18px] transition-transform duration-kno-base ease-kno-out ${
                      open ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {open && (
                  <div className="px-5 pb-5 text-[14px] leading-[1.6] text-kno-text-gray">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
