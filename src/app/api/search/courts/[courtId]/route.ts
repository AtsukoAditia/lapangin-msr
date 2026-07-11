import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courtId: string }> },
) {
  try {
    const { courtId } = await params;
    const adapter = getDatabaseAdapter();

    const [court, venues, sports, areas, pricing, allCourts] =
      await Promise.all([
        adapter.getCourtById(courtId),
        adapter.getVenues(),
        adapter.getSports(),
        adapter.getAreas(),
        adapter.getPricingRules(courtId),
        adapter.getCourts(),
      ]);

    if (!court || !court.isActive) {
      return NextResponse.json(
        { error: "Lapangan tidak ditemukan." },
        { status: 404 },
      );
    }

    const venue = venues.find((v) => v.id === court.venueId);
    if (!venue) {
      return NextResponse.json(
        { error: "Venue tidak ditemukan." },
        { status: 404 },
      );
    }

    const sport = sports.find((s) => s.id === court.sportId);
    const area = areas.find((a) => a.id === venue.areaId);

    // Sibling courts (other courts in same venue for same sport)
    const siblingCourts = allCourts
      .filter(
        (c) =>
          c.venueId === venue.id &&
          c.sportId === court.sportId &&
          c.id !== court.id &&
          c.isActive,
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        indoorType: c.indoorType,
        surfaceType: c.surfaceType,
        basePrice: c.basePrice,
      }));

    // Get today + next 7 days bookings for this court
    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const bookingsByDate: Record<
      string,
      Array<{ startTime: string; endTime: string; bookingStatus: string }>
    > = {};

    for (const date of dates) {
      const dayBookings = await adapter.getBookingsByCourtAndDate(
        courtId,
        date,
      );
      // Only include non-cancelled, non-expired bookings
      bookingsByDate[date] = dayBookings
        .filter(
          (b) =>
            !["cancelled", "expired", "rejected"].includes(b.bookingStatus),
        )
        .map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
          bookingStatus: b.bookingStatus,
        }));
    }

    // Fetch venue rating + court reviews
    const [venueRating, courtReviews] = await Promise.all([
      adapter.getVenueRating(venue.id).catch(() => ({ avgRating: 0, reviewCount: 0 })),
      adapter.getReviewsByCourt(courtId).catch(() => []),
    ]);

    return NextResponse.json({
      court: {
        id: court.id,
        name: court.name,
        slug: court.slug,
        surfaceType: court.surfaceType,
        indoorType: court.indoorType,
        capacity: court.capacity,
        basePrice: court.basePrice,
        sportId: court.sportId,
        sportName: sport?.name || "",
        sportSlug: sport?.slug || "",
      },
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        phone: venue.phone,
        mapsUrl: venue.mapsUrl,
        openTime: venue.openTime,
        closeTime: venue.closeTime,
      },
      area: area
        ? {
            label: area.label,
            city: area.city,
            province: area.province,
          }
        : null,
      pricing,
      siblingCourts,
      bookingsByDate,
      rating: {
        avgRating: venueRating.avgRating,
        reviewCount: venueRating.reviewCount,
      },
      reviews: courtReviews.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching court detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail lapangan." },
      { status: 500 },
    );
  }
}
