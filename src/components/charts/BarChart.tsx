"use client";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export default function BarChart({ data, height = 200, color = "#10b981", formatValue }: BarChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="hidden group-hover:block text-xs text-gray-600 mb-1 whitespace-nowrap">
                {formatValue ? formatValue(item.value) : item.value}
              </div>
              <div
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${Math.max(barHeight, 2)}%`,
                  backgroundColor: color,
                  minHeight: item.value > 0 ? "4px" : "1px",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-gray-500 truncate block">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
