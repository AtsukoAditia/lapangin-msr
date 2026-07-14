"use client";

interface PieChartDatum {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDatum[];
  size?: number;
  centerLabel?: string;
  formatValue?: (v: number) => string;
}

export default function PieChart({
  data,
  size = 200,
  centerLabel,
  formatValue,
}: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.55;

  let cumAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const largeArc = angle > Math.PI ? 1 : 0;

    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle);
    const y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(endAngle);
    const y1i = cy + innerR * Math.sin(endAngle);
    const x2i = cx + innerR * Math.cos(startAngle);
    const y2i = cy + innerR * Math.sin(startAngle);

    const path = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      "Z",
    ].join(" ");

    return { ...d, path, pct: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
        ))}
        {centerLabel && (
          <>
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize={11}
              fill="#6b7280"
            >
              Total
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill="#111827"
            >
              {centerLabel}
            </text>
          </>
        )}
      </svg>
      <div className="space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-700">{s.label}</span>
            <span className="text-gray-400 ml-auto">
              {formatValue ? formatValue(s.value) : s.value} ({s.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
