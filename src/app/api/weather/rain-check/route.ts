import { NextResponse } from "next/server";
import { getRainForecast } from "@/lib/weather/client";
import { getRainPricingFactor } from "@/lib/weather/rain-factor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "Jakarta";
  const indoorType = searchParams.get("indoorType") || "outdoor";

  const weather = await getRainForecast(city, 1);
  if (!weather) {
    return NextResponse.json({ available: false, reason: "Weather data unavailable" });
  }

  const today = weather.forecast[0];
  const rain = getRainPricingFactor(today.totalPrecipMm, today.chanceOfRain, indoorType);

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
