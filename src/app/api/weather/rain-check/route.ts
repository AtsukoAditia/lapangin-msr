import { NextResponse } from "next/server";
import { getRainForecast } from "@/lib/weather/client";
import { getRainPricingFactor, type VenueRainConfig } from "@/lib/weather/rain-factor";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "Jakarta";
  const indoorType = searchParams.get("indoorType") || "outdoor";
  const venueId = searchParams.get("venueId") || "";

  // If venueId provided, read venue's rain config
  let venueConfig: VenueRainConfig | undefined;
  if (venueId) {
    const adapter = getDatabaseAdapter();
    const venue = await adapter.getVenueById(venueId);
    if (venue) {
      venueConfig = (venue as unknown as Record<string, unknown>).rainDiscountConfig as VenueRainConfig | undefined;
    }
  }

  const weather = await getRainForecast(city, 1);
  if (!weather) {
    return NextResponse.json({ available: false, reason: "Weather data unavailable" });
  }

  const today = weather.forecast[0];
  const rain = getRainPricingFactor(today.totalPrecipMm, today.chanceOfRain, indoorType, venueConfig);

  return NextResponse.json({
    available: true,
    location: weather.location,
    date: today.date,
    condition: today.condition,
    precipMm: today.totalPrecipMm,
    chanceOfRain: today.chanceOfRain,
    pricing: rain,
  });
}
