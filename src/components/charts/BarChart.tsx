type BarPoint = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  title?: string;
  data: BarPoint[];
};

const DEFAULT_COLORS = ["#22D3EE", "#0EA5E9", "#10B981", "#6366F1", "#F59E0B", "#EF4444"];

export function BarChart({ title, data }: BarChartProps) {
  const width = 520;
  const rowHeight = 34;
  const labelWidth = 140;
  const valueWidth = 44;
  const barArea = width - labelWidth - valueWidth - 24;
  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const height = Math.max(90, data.length * rowHeight + 16);

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-semibold text-slate-800">{title}</p>}
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">No comparison data available.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
            {data.map((item, idx) => {
              const y = 8 + idx * rowHeight;
              const color = item.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
              const barWidth = Math.max(4, Math.round((item.value / maxValue) * barArea));
              return (
                <g key={item.label}>
                  <text x={2} y={y + 17} className="fill-slate-700 text-[11px]">
                    {item.label}
                  </text>
                  <rect x={labelWidth} y={y + 6} width={barArea} height={10} rx={5} fill="#E2E8F0" />
                  <rect
                    x={labelWidth}
                    y={y + 6}
                    width={barWidth}
                    height={10}
                    rx={5}
                    fill={color}
                    className="transition-all duration-700"
                  />
                  <text x={width - valueWidth} y={y + 17} className="fill-slate-600 text-[11px]">
                    {item.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
