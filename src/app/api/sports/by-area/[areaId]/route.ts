import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ areaId: string }> }
) {
  try {
    const { areaId } = await params;
    const adapter = getDatabaseAdapter();

    // Get all data
    const [venues, courts, sports] = await Promise.all([
      adapter.getVenuesByArea(areaId),
      adapter.getAllCourts(),
      adapter.getSports(),
    ]);

    // Filter active venues in this area
    const activeVenues = venues.filter((v) => v.isActive);
    const venueIds = new Set(activeVenues.map((v) => v.id));

    // Get unique sport IDs from courts in those venues
    const sportIds = new Set<string>();
    for (const court of courts) {
      if (court.isActive && venueIds.has(court.venueId)) {
        sportIds.add(court.sportId);
      }
    }

    // Filter sports to only those available
    const availableSports = sports.filter(
      (s) => s.isActive && sportIds.has(s.id)
    );

    return NextResponse.json({ sports: availableSports });
  } catch (error) {
    console.error("Error fetching sports by area:", error);
    return NextResponse.json(
      { error: "Failed to fetch sports" },
      { status: 500 }
    );
  }
}