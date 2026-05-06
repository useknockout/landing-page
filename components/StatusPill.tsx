type Status = "operational" | "degraded" | "outage";

const styles: Record<Status, { bg: string; fg: string; dot: string; label: string }> = {
  operational: {
    bg: "bg-kno-success-mint",
    fg: "text-kno-success-fg",
    dot: "bg-kno-green",
    label: "All systems operational",
  },
  degraded: {
    bg: "bg-kno-warn-bg",
    fg: "text-kno-warn-fg",
    dot: "bg-kno-warn-amber",
    label: "Degraded performance",
  },
  outage: {
    bg: "bg-kno-error-bg",
    fg: "text-[#B91C1C]",
    dot: "bg-kno-error-red",
    label: "Outage",
  },
};

export function StatusPill({
  status = "operational",
  label,
}: {
  status?: Status;
  label?: string;
}) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-[3px] rounded-full font-mono text-[11px] font-medium ${s.bg} ${s.fg}`}
    >
      <span className={`w-[6px] h-[6px] rounded-full ${s.dot}`} aria-hidden />
      {label ?? s.label}
    </span>
  );
}
