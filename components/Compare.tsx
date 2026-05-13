/**
 * Vendor comparison table — useknockout vs. remove.bg / Photoroom / Slazzer / ClipDrop.
 * Pricing + feature snapshot as of 2026-05; vendor pages may have changed since.
 */

type Cell = boolean | string;
type Row = { label: string; values: [Cell, Cell, Cell, Cell, Cell] };

const VENDORS = ["useknockout", "remove.bg", "Photoroom", "Slazzer", "ClipDrop"] as const;

const ROWS: Row[] = [
  { label: "Per-image cost (PAYG)", values: ["$0.005", "$0.20", "$0.10", "$0.10", "$0.05"] },
  { label: "Free tier / month", values: ["20 / mo", "1 / mo", "0", "20 / mo", "100 / mo"] },
  { label: "Background removal", values: [true, true, true, true, true] },
  { label: "Super-resolution", values: [true, false, false, true, true] },
  { label: "Face restore", values: [true, false, true, false, true] },
  { label: "Sticker outline", values: [true, false, true, false, false] },
  { label: "Studio composite", values: [true, false, true, false, true] },
  { label: "Drop shadow", values: [true, false, true, false, true] },
  { label: "Smart crop", values: [true, false, true, false, false] },
  { label: "Silhouette portrait", values: [true, false, false, false, false] },
  { label: "Inpainting", values: [true, false, false, false, false] },
  { label: "Batch endpoint", values: [true, true, true, true, false] },
  { label: "Node SDK", values: [true, true, false, false, false] },
  { label: "React SDK", values: [true, false, false, false, false] },
  { label: "Python SDK", values: [true, true, false, false, false] },
  { label: "MIT licensed", values: [true, false, false, false, false] },
  { label: "Self-hostable", values: [true, false, false, false, false] },
];

export function Compare() {
  return (
    <section className="bg-kno-white px-8 py-20">
      <div className="max-w-kno-content mx-auto">
        <div className="mb-8">
          <h2
            className="font-bold m-0"
            style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            How it stacks up.
          </h2>
          <p className="text-[16px] text-kno-text-gray mt-2 max-w-[640px]">
            Most image APIs charge 20–40× more for half the surface area. We&apos;re open source on top.
          </p>
        </div>

        <div className="border border-kno-border-gray rounded-kno-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[760px]">
              <thead>
                <tr className="bg-kno-surface-gray border-b border-kno-border-gray">
                  <th className="text-left font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold py-3 px-5 w-[260px]">
                    Feature
                  </th>
                  {VENDORS.map((v, i) => (
                    <th
                      key={v}
                      className={`text-left font-semibold py-3 px-4 text-[14px] ${
                        i === 0 ? "text-kno-black bg-kno-green-soft" : "text-kno-black"
                      }`}
                    >
                      {v}
                      {i === 0 && (
                        <span className="ml-2 inline-flex px-1.5 py-px rounded-kno-sm bg-kno-green text-kno-black font-mono text-[10px] font-semibold tracking-[0.04em]">
                          OURS
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b last:border-b-0 border-kno-border-gray"
                  >
                    <td className="py-3 px-5 font-medium text-kno-black">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={`py-3 px-4 ${
                          i === 0 ? "bg-kno-green-soft" : ""
                        }`}
                      >
                        {typeof v === "boolean" ? <BoolCell value={v} /> : (
                          <span className="font-mono text-[13px] text-kno-black">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[12px] text-kno-text-gray font-mono mt-4">
          Pricing and feature snapshot as of May 2026. Vendor pages may have changed since — open an issue if anything is stale.
        </p>
      </div>
    </section>
  );
}

function BoolCell({ value }: { value: boolean }) {
  if (value) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-kno-green text-kno-black font-bold text-[11px]" aria-label="yes">
        ✓
      </span>
    );
  }
  return (
    <span className="text-kno-text-gray font-mono text-[16px]" aria-label="no">
      —
    </span>
  );
}
