// Rain-based pricing factor for outdoor courts

import type { VenueRainConfig } from "@/lib/types/domain";

export type { VenueRainConfig } from "@/lib/types/domain";

export interface RainPricingResult {
  factor: number; // 0.7 – 1.0
  label: string;
  icon: string;
  color: string;
  description: string;
}

const DEFAULT_DISCOUNTS = { light: 10, moderate: 20, heavy: 30 };

/**
 * Calculate price factor based on rainfall forecast.
 * Indoor courts → always 1.0 (no discount).
 * Outdoor courts → discount based on forecast rainfall + venue config.
 */
export function getRainPricingFactor(
  totalPrecipMm: number,
  chanceOfRain: number,
  indoorType: string,
  venueConfig?: VenueRainConfig,
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

  // If venue has rain discount disabled, return normal
  if (venueConfig && !venueConfig.enabled) {
    return {
      factor: 1.0,
      label: "",
      icon: "",
      color: "",
      description: "",
    };
  }

  // Use venue-specific discounts or defaults
  const discounts = venueConfig?.levels
    ? { light: venueConfig.levels.light.discountPercent, moderate: venueConfig.levels.moderate.discountPercent, heavy: venueConfig.levels.heavy.discountPercent }
    : DEFAULT_DISCOUNTS;

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
    const d = discounts.light;
    return {
      factor: 1 - d / 100,
      label: "Hujan Ringan",
      icon: "🌦️",
      color: "text-blue-400",
      description: `Hujan ringan — diskon ${d}%`,
    };
  }

  // Moderate rain: 5-15mm OR 60-80% chance
  if (totalPrecipMm < 15 || chanceOfRain < 80) {
    const d = discounts.moderate;
    return {
      factor: 1 - d / 100,
      label: "Hujan Sedang",
      icon: "🌧️",
      color: "text-blue-600",
      description: `Hujan sedang — diskon ${d}%`,
    };
  }

  // Heavy rain: >15mm OR >80% chance
  const d = discounts.heavy;
  return {
    factor: 1 - d / 100,
    label: "Hujan Deras",
    icon: "⛈️",
    color: "text-blue-800",
    description: `Hujan deras — diskon ${d}%`,
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
