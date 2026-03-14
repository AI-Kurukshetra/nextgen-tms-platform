type PiePoint = {
  label: string;
  value: number;
  color: string;
};

type PieChartProps = {
  title?: string;
  data: PiePoint[];
  size?: number;
  innerRadius?: number;
};

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function createArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ title, data, size = 220, innerRadius = 56 }: PieChartProps) {
  const total = Math.max(1, data.reduce((acc, item) => acc + item.value, 0));
  const radius = size / 2 - 10;
  const center = size / 2;
  const segments = data.reduce<{
    items: Array<{ label: string; color: string; path: string }>;
    nextAngle: number;
  }>(
    (acc, item) => {
      const startAngle = acc.nextAngle;
      const angle = (item.value / total) * 360;
      const endAngle = startAngle + angle;
      const path = createArcPath(center, center, radius, startAngle, endAngle);
      return {
        items: [...acc.items, { label: item.label, color: item.color, path }],
        nextAngle: endAngle,
      };
    },
    { items: [], nextAngle: 0 }
  ).items;

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-semibold text-slate-800">{title}</p>}
      <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44">
          {segments.map((segment) => (
            <path
              key={segment.label}
              d={segment.path}
              fill={segment.color}
              className="origin-center transition-all duration-700 hover:opacity-85"
            />
          ))}
          <circle cx={center} cy={center} r={innerRadius} className="fill-white" />
          <text x={center} y={center - 4} textAnchor="middle" className="fill-slate-900 text-xs font-semibold">
            Total
          </text>
          <text x={center} y={center + 16} textAnchor="middle" className="fill-slate-600 text-xs">
            {total}
          </text>
        </svg>

        <div className="space-y-2">
          {data.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" aria-hidden="true">
                    <circle cx="5" cy="5" r="5" fill={item.color} />
                  </svg>
                  <span>{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {item.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
