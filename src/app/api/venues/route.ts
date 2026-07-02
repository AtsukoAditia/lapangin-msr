import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(request: NextRequest) {
  try {
    const adapter = getDatabaseAdapter();
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get("areaId") ?? undefined;
    const sportId = searchParams.get("sportId") ?? undefined;

    let venues = await adapter.getVenues();
    // Only show active approved venues to public
    venues = venues.filter((v) => v.approvalStatus === "active");

    // Filter by area
    if (areaId) {
      venues = venues.filter((v) => v.areaId === areaId);
    }

    // Filter by sport — venue has courts with that sport
    if (sportId) {
      const courts = await adapter.getCourts();
      const venueIdsWithSport = new Set(
        courts.filter((c) => c.sportId === sportId).map((c) => c.venueId),
      );
      venues = venues.filter((v) => venueIdsWithSport.has(v.id));
    }

    return NextResponse.json({ venues });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data venue." },
      { status: 500 },
    );
  }
}