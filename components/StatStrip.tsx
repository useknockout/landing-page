const LAUNCH_DATE = "2026-04-22";
const NPM_PACKAGES = ["@useknockout/node", "@useknockout/react", "@useknockout/cli"];
const REVALIDATE_SECONDS = 3600;

const FALLBACK = { downloads: 3000, stars: 50 };

type LiveStats = { downloads: number; stars: number };

async function fetchLiveStats(): Promise<LiveStats> {
  const end = new Date().toISOString().slice(0, 10);

  try {
    const [npmResults, pypi, gh] = await Promise.all([
      Promise.all(
        NPM_PACKAGES.map((pkg) =>
          fetch(`https://api.npmjs.org/downloads/range/${LAUNCH_DATE}:${end}/${pkg}`, {
            next: { revalidate: REVALIDATE_SECONDS },
          }).then((r) => (r.ok ? r.json() : { downloads: [] })),
        ),
      ),
      fetch("https://pypistats.org/api/packages/useknockout/overall?mirrors=false", {
        next: { revalidate: REVALIDATE_SECONDS },
      }).then((r) => (r.ok ? r.json() : { data: [] })),
      fetch("https://api.github.com/repos/useknockout/api", {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: { Accept: "application/vnd.github+json" },
      }).then((r) => (r.ok ? r.json() : { stargazers_count: 0 })),
    ]);

    const npmTotal = npmResults.reduce(
      (sum: number, r: { downloads?: { downloads: number }[] }) =>
        sum + (r.downloads ?? []).reduce((s, d) => s + (d.downloads ?? 0), 0),
      0,
    );
    const pypiTotal = ((pypi as { data?: { downloads: number }[] }).data ?? []).reduce(
      (s: number, d: { downloads: number }) => s + (d.downloads ?? 0),
      0,
    );
    const stars = (gh as { stargazers_count?: number }).stargazers_count ?? 0;

    const downloads = npmTotal + pypiTotal;

    if (downloads < FALLBACK.downloads || stars < 1) return FALLBACK;
    return { downloads, stars };
  } catch {
    return FALLBACK;
  }
}

function formatDownloads(n: number): string {
  if (n >= 10000) return `${Math.floor(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("en-US");
}

export async function StatStrip() {
  const { downloads, stars } = await fetchLiveStats();

  const stats: { v: string; l: string }[] = [
    { v: "20", l: "Endpoints in one API" },
    { v: "200ms", l: "Warm latency, 1024×1024" },
    { v: "40×", l: "Cheaper than remove.bg" },
    { v: formatDownloads(downloads), l: `Downloads · ${stars}★ on GitHub` },
  ];

  return (
    <section className="bg-kno-black text-kno-white px-8 py-10">
      <div className="max-w-kno-content mx-auto grid gap-8 grid-cols-2 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="flex flex-col gap-1 border-l-2 border-kno-green pl-4">
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
