// Rain-based pricing factor for outdoor courts

export interface RainPricingResult {
  factor: number; // 0.7 – 1.0
  label: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Calculate price factor based on rainfall forecast.
 * Indoor courts → always 1.0 (no discount).
 * Outdoor courts → discount based on forecast rainfall.
 */
export function getRainPricingFactor(
  totalPrecipMm: number,
  chanceOfRain: number,
  indoorType: string,
): RainPricingResult {
  if (indoorType === "indoor") {
    return {
      factor: 1.0,
      label: "Indoor",
      icon: "🏟️",
      color: "text-gray-500",
      description: "Lapangan indoor — tidak terpengaruh cuaca",
    };
  }

  // Chance of rain < 30% = no discount
  if (chanceOfRain < 30 && totalPrecipMm < 1) {
    return {
      factor: 1.0,
      label: "Cerah",
      icon: "☀️",
      color: "text-yellow-600",
      description: "Cuaca cerah — harga normal",
    };
  }

  // Light rain: 1-5mm OR 30-60% chance
  if (totalPrecipMm < 5 || (chanceOfRain < 60 && totalPrecipMm < 3)) {
    return {
      factor: 0.9,
      label: "Hujan Ringan",
      icon: "🌦️",
      color: "text-blue-400",
      description: "Hujan ringan — diskon 10%",
    };
  }

  // Moderate rain: 5-15mm OR 60-80% chance
  if (totalPrecipMm < 15 || chanceOfRain < 80) {
    return {
      factor: 0.8,
      label: "Hujan Sedang",
      icon: "🌧️",
      color: "text-blue-600",
      description: "Hujan sedang — diskon 20%",
    };
  }

  // Heavy rain: >15mm OR >80% chance
  return {
    factor: 0.7,
    label: "Hujan Deras",
    icon: "⛈️",
    color: "text-blue-800",
    description: "Hujan deras — diskon 30%",
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
