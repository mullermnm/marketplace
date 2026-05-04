// Lightweight, dependency-free SVG area chart.
// Pass in a series of {label, value} points.

interface Point { label: string; value: number; }

export function AreaChart({
  data,
  height = 160,
  formatValue = (n: number) => n.toString(),
}: {
  data: Point[];
  height?: number;
  formatValue?: (n: number) => string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--border)] p-8 text-center text-xs text-[color:var(--fg-muted)]">
        No data yet.
      </div>
    );
  }
  const w = 600;
  const h = height;
  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = data.length > 1 ? w / (data.length - 1) : w;
  const points = data.map((d, i) => [i * stepX, h - (d.value / max) * (h - 24) - 8]);
  const lineD = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");
  const areaD = `${lineD} L${(data.length - 1) * stepX},${h} L0,${h} Z`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[160px]" aria-label="Revenue chart">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#ag)" />
        <path d={lineD} fill="none" stroke="var(--brand-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="var(--brand-500)" />
        ))}
      </svg>
      <div className="mt-2 grid text-[10px] text-[color:var(--fg-muted)]" style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 7)}, 1fr)` }}>
        {data.slice(-Math.min(data.length, 7)).map((d, i) => (
          <span key={i} className="truncate text-center">{d.label}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-[color:var(--fg-muted)]">
        Peak {formatValue(max)}
      </p>
    </div>
  );
}

export function buildDailyRevenueSeries(orders: any[], sellerId: string, days = 14): Point[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series: Point[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    let cents = 0;
    for (const o of orders) {
      if (o.paymentStatus !== "completed") continue;
      const t = new Date(o.createdAt).getTime();
      if (t < day.getTime() || t >= next.getTime()) continue;
      for (const it of o.items) {
        if (it.sellerId !== sellerId || it.refunded) continue;
        cents += it.sellerPayoutCents;
      }
    }
    series.push({
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: cents,
    });
  }
  return series;
}
