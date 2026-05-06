type Props = {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  sparkline?: number[];
};

export function StatTile({ label, value, delta, sparkline }: Props) {
  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5 flex flex-col gap-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-kno-text-gray font-semibold">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="font-bold text-kno-black"
          style={{ fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          {value}
        </span>
        {delta && (
          <span
            className={`font-mono text-[11px] font-medium ${
              delta.positive ? "text-kno-success-fg" : "text-kno-error-red"
            }`}
          >
            {delta.positive ? "+" : ""}
            {delta.value}
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const stepX = w / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="32"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="#57C985"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
