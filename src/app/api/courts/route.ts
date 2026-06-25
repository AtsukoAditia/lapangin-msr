import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(request: NextRequest) {
  try {
    const adapter = getDatabaseAdapter();
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId") ?? undefined;
    const sportId = searchParams.get("sportId") ?? undefined;

    const allCourts = await adapter.getCourts();
    let courts = allCourts;

    if (venueId) {
      courts = courts.filter((c) => c.venueId === venueId);
    }
    if (sportId) {
      courts = courts.filter((c) => c.sportId === sportId);
    }

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lapangan." },
      { status: 500 },
    );
  }
}