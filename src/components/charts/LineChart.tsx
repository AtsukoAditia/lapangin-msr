"use client";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export default function LineChart({
  data,
  height = 200,
  color = "#10b981",
  formatValue,
}: LineChartProps) {
  if (data.length === 0) return null;

  const padX = 8;
  const padY = 24;
  const padTop = 20;
  const width = Math.max(data.length * 40, 300);
  const chartW = width - padX * 2;
  const chartH = height - padY - padTop;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = 0;

  const toX = (i: number) => padX + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) => padTop + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  // Build smooth path
  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padTop + chartH * (1 - pct);
          const val = minVal + (maxVal - minVal) * pct;
          return (
            <g key={pct}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray={pct === 0 ? "" : "4,4"}
              />
              <text x={0} y={y + 3} fontSize={9} fill="#9ca3af">
                {formatValue ? formatValue(Math.round(val)) : Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={color} opacity={0.08} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="white" stroke={color} strokeWidth={2} />
        ))}

        {/* X-axis labels (show every nth) */}
        {data.map((d, i) => {
          const step = Math.ceil(data.length / 10);
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={toX(i)}
              y={height - 4}
              fontSize={9}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
