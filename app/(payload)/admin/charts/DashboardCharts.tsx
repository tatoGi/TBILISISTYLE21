"use client";

const PALETTE = ["#405189", "#0ab39c", "#f7b84b", "#f06548", "#299cdb", "#6559cc"];
const SVG_WIDTH = 640;
const SVG_HEIGHT = 260;

function formatGel(value: number) {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 0 })} GEL`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export function RevenueAreaChart({ days, totals }: { days: string[]; totals: number[] }) {
  const max = Math.max(...totals, 1);
  const min = Math.min(...totals, 0);
  const range = Math.max(max - min, 1);
  const points = totals.map((value, index) => {
    const x = totals.length === 1 ? SVG_WIDTH / 2 : (index / (totals.length - 1)) * SVG_WIDTH;
    const y = SVG_HEIGHT - ((value - min) / range) * (SVG_HEIGHT - 34) - 17;

    return { x, y, value, day: days[index] ?? "" };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${line} ${SVG_WIDTH},${SVG_HEIGHT} 0,${SVG_HEIGHT}`;
  const firstDay = days[0] ?? "";
  const lastDay = days.at(-1) ?? "";

  return (
    <div className="h-[320px]">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="h-[260px] w-full overflow-visible">
        <defs>
          <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0ab39c" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#0ab39c" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((tick) => {
          const y = 18 + tick * 70;

          return (
            <line
              key={tick}
              x1="0"
              x2={SVG_WIDTH}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="6 6"
            />
          );
        })}
        <polygon points={area} fill="url(#revenue-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#0ab39c"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {points.map((point, index) => (
          <g key={`${point.day}-${index}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#fff" stroke="#0ab39c" strokeWidth="3" />
            <title>{`${point.day}: ${formatGel(point.value)}`}</title>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>{firstDay}</span>
        <span>{formatGel(max)}</span>
        <span>{lastDay}</span>
      </div>
    </div>
  );
}

export function SalesByTypeDonut({ labels, values }: { labels: string[]; values: number[] }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const safeTotal = Math.max(total, 1);
  const slices = values.reduce<
    Array<{
      color: string;
      end: number;
      label: string;
      start: number;
      value: number;
    }>
  >((acc, value, index) => {
    const start = acc.at(-1)?.end ?? 0;
    const end = start + (value / safeTotal) * 360;

    return [
      ...acc,
      {
        color: PALETTE[index % PALETTE.length],
        end,
        label: labels[index] ?? "Other",
        start,
        value,
      },
    ];
  }, []);

  return (
    <div className="grid h-[320px] place-items-center">
      <div className="grid w-full gap-4">
        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 220 220" className="h-full w-full">
            <circle cx="110" cy="110" r="78" fill="none" stroke="#e2e8f0" strokeWidth="28" />
            {slices.map((slice) => (
              <path
                key={slice.label}
                d={describeArc(110, 110, 78, slice.start, slice.end)}
                fill="none"
                stroke={slice.color}
                strokeLinecap="round"
                strokeWidth="28"
              >
                <title>{`${slice.label}: ${formatGel(slice.value)}`}</title>
              </path>
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-2xl font-black text-slate-900">{formatGel(total)}</p>
              <p className="text-[11px] font-bold uppercase text-slate-400">total sales</p>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="shrink-0 font-bold text-slate-800">{Math.round((slice.value / safeTotal) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
