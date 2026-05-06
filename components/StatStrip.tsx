const STATS: { v: string; l: string }[] = [
  { v: "20", l: "Endpoints in one API" },
  { v: "200ms", l: "Warm latency, 1024×1024" },
  { v: "40×", l: "Cheaper than remove.bg" },
  { v: "MIT", l: "Self-hostable, your weights" },
];

export function StatStrip() {
  return (
    <section className="bg-kno-black text-kno-white px-8 py-10">
      <div className="max-w-kno-content mx-auto grid gap-8 grid-cols-2 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.v} className="flex flex-col gap-1 border-l-2 border-kno-green pl-4">
            <div
              className="font-bold"
              style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              {s.v}
            </div>
            <div className="text-[13px] text-kno-text-gray-dark">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
