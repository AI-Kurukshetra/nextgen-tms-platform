type LinePoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  title?: string;
  data: LinePoint[];
  stroke?: string;
};

export function LineChart({ title, data, stroke = "#06B6D4" }: LineChartProps) {
  const width = 420;
  const height = 220;
  const padding = 28;
  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const stepX = data.length <= 1 ? 0 : (width - padding * 2) / (data.length - 1);

  const points = data
    .map((item, idx) => {
      const x = padding + idx * stepX;
      const y = height - padding - (item.value / maxValue) * (height - padding * 2);
      return { ...item, x, y };
    })
    .map((item) => `${item.x},${item.y}`)
    .join(" ");

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-semibold text-slate-800">{title}</p>}
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">No trend data available.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#CBD5E1" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#CBD5E1" />
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - padding - ratio * (height - padding * 2);
              return <line key={ratio} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />;
            })}
            <polyline
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              points={points}
              className="drop-shadow-sm transition-all duration-700"
            />
            {data.map((item, idx) => {
              const x = padding + idx * stepX;
              const y = height - padding - (item.value / maxValue) * (height - padding * 2);
              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="4" fill={stroke} />
                  <text x={x} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
                    {item.label}
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
