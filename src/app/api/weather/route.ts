import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Use /api/weather/rain-check",
    endpoints: ["/api/weather/rain-check?lat=...&lng=..."],
  });
}
