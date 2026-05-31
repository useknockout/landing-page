"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselItem = {
  tag: string;
  img: string;
  title: string;
  body: string;
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeatureCarousel({ items }: { items: CarouselItem[] }) {
  const total = items.length;
  const [index, setIndex] = useState(Math.floor(total / 2));
  const paused = useRef(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) return;
    }
    const timer = setInterval(() => {
      if (!paused.current) next();
    }, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const active = items[index];

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      {/* 3D coverflow */}
      <div className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center [perspective:1200px]">
        {items.map((item, i) => {
          const offset = i - index;
          let pos = (offset + total) % total;
          if (pos > Math.floor(total / 2)) pos -= total;

          const isCenter = pos === 0;
          const visible = Math.abs(pos) <= 1;

          return (
            <button
              key={item.tag}
              type="button"
              aria-label={`Show ${item.title}`}
              aria-hidden={!visible}
              tabIndex={visible && !isCenter ? 0 : -1}
              onClick={() => !isCenter && setIndex(i)}
              className="absolute w-60 h-72 md:w-80 md:h-96 transition-all duration-500 ease-kno-out focus:outline-none focus-visible:ring-2 focus-visible:ring-kno-green rounded-kno-xl"
              style={{
                transform: `translateX(${pos * 52}%) scale(${isCenter ? 1 : 0.82}) rotateY(${pos * -14}deg)`,
                zIndex: isCenter ? 10 : 5,
                opacity: visible ? (isCenter ? 1 : 0.5) : 0,
                filter: isCenter ? "none" : "blur(2px)",
                visibility: visible ? "visible" : "hidden",
                pointerEvents: visible && !isCenter ? "auto" : "none",
              }}
            >
              <div className="relative w-full h-full rounded-kno-xl overflow-hidden border border-kno-border-gray shadow-kno-lg checker">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 240px, 320px"
                  className="object-contain p-[10%]"
                />
                <span className="absolute top-2.5 left-2.5 font-mono text-[10px] px-[7px] py-[3px] rounded-full bg-black/85 text-kno-white">
                  {item.tag}
                </span>
              </div>
            </button>
          );
        })}

        {/* Navigation */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous"
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-kno-white border border-kno-border-gray shadow-kno-sm text-kno-black hover:bg-kno-surface-gray transition-colors duration-kno-fast"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next"
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-kno-white border border-kno-border-gray shadow-kno-sm text-kno-black hover:bg-kno-surface-gray transition-colors duration-kno-fast"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* Active caption */}
      <div key={active.tag} className="mt-6 text-center max-w-[480px] px-4 animate-kno-fade-up">
        <h3 className="text-[18px] font-semibold m-0">{active.title}</h3>
        <p className="text-[14px] text-kno-text-gray mt-1.5 leading-[1.5] m-0">{active.body}</p>
      </div>

      {/* Dots */}
      <div className="mt-5 flex gap-2" role="tablist" aria-label="Select example">
        {items.map((item, i) => (
          <button
            key={item.tag}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to ${item.title}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-kno-base ${
              i === index ? "w-5 bg-kno-green" : "w-2 bg-kno-border-strong hover:bg-kno-text-gray"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
