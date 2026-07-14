"use client";

interface HeatMapProps {
  data: number[][]; // [day][hour] matrix (7 rows x 24 cols)
  dayLabels?: string[];
  hourLabels?: string[];
  formatValue?: (v: number) => string;
}

const DEFAULT_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DEFAULT_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}`);

function heatColor(val: number, max: number): string {
  if (val === 0) return "#f3f4f6";
  const pct = val / max;
  if (pct < 0.2) return "#d1fae5";
  if (pct < 0.4) return "#6ee7b7";
  if (pct < 0.6) return "#34d399";
  if (pct < 0.8) return "#059669";
  return "#047857";
}

export default function HeatMap({
  data,
  dayLabels = DEFAULT_DAYS,
  hourLabels = DEFAULT_HOURS,
  formatValue,
}: HeatMapProps) {
  const maxVal = Math.max(...data.flat(), 1);
  const showHours = hourLabels.length <= 24 ? hourLabels : DEFAULT_HOURS;

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="p-0.5" />
            {showHours.map((h, i) => (
              <th key={i} className="px-0.5 py-1 text-[9px] text-gray-400 font-normal text-center min-w-[24px]">
                {i % 2 === 0 ? h : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, dayIdx) => (
            <tr key={dayIdx}>
              <td className="pr-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                {dayLabels[dayIdx] ?? `D${dayIdx}`}
              </td>
              {row.map((val, hourIdx) => (
                <td key={hourIdx} className="p-0.5">
                  <div
                    className="w-6 h-6 rounded-sm cursor-default transition-colors"
                    style={{ backgroundColor: heatColor(val, maxVal) }}
                    title={`${dayLabels[dayIdx] ?? `Day ${dayIdx}`} ${showHours[hourIdx]}:00 - ${formatValue ? formatValue(val) : val}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[10px] text-gray-400">0</span>
        {["#f3f4f6", "#d1fae5", "#6ee7b7", "#34d399", "#059669", "#047857"].map((c) => (
          <span key={c} className="w-4 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-gray-400">max</span>
      </div>
    </div>
  );
}
