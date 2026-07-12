import { useState, useEffect } from "react";

interface RainData {
  available: boolean;
  location?: string;
  condition?: string;
  precipMm?: number;
  chanceOfRain?: number;
  pricing?: {
    factor: number;
    label: string;
    icon: string;
    color: string;
    description: string;
  };
}

export default function RainIndicator({
  city = "Jakarta",
  indoorType = "outdoor",
  basePrice = 0,
}: {
  city?: string;
  indoorType?: string;
  basePrice?: number;
}) {
  const [data, setData] = useState<RainData | null>(null);

  useEffect(() => {
    fetch(`/api/weather/rain-check?city=${encodeURIComponent(city)}&indoorType=${indoorType}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ available: false }));
  }, [city, indoorType]);

  if (!data?.available || !data.pricing) return null;

  const { pricing, condition, precipMm, chanceOfRain } = data;
  const discountedPrice = Math.round(basePrice * pricing.factor);

  return (
    <div className={`rounded-xl border-2 p-3 ${pricing.factor < 1 ? "border-blue-200 bg-blue-50" : "border-yellow-200 bg-yellow-50"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{pricing.icon}</span>
        <span className={`font-bold text-sm ${pricing.color}`}>{pricing.label}</span>
        {pricing.factor < 1 && (
          <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            DISKON {Math.round((1 - pricing.factor) * 100)}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600">{pricing.description}</p>
      {condition && (
        <p className="text-xs text-gray-500 mt-1">
          {condition} · {chanceOfRain}% hujan · {precipMm}mm
        </p>
      )}
      {basePrice > 0 && pricing.factor < 1 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm line-through text-gray-400">
            Rp {basePrice.toLocaleString("id-ID")}
          </span>
          <span className="text-sm font-bold text-green-600">
            Rp {discountedPrice.toLocaleString("id-ID")}
          </span>
        </div>
      )}
    </div>
  );
}
