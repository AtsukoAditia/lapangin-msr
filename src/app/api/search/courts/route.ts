import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(request: NextRequest) {
  try {
    const adapter = getDatabaseAdapter();
    const { searchParams } = new URL(request.url);

    const sportSlug = searchParams.get("sport") || "";
    const areaId = searchParams.get("areaId") || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 0;
    const search = (searchParams.get("q") || "").toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const sort = searchParams.get("sort") || "name"; // name | price_asc | price_desc

    const [sports, venues, courts, areas, allPricing] = await Promise.all([
      adapter.getSports(),
      adapter.getVenues(),
      adapter.getCourts(),
      adapter.getAreas(),
      adapter.getAllPricingRules(),
    ]);

    // Find sport by slug
    const sport = sports.find((s) => s.slug === sportSlug && s.isActive);
    if (!sport) {
      return NextResponse.json({ courts: [], total: 0, page, limit });
    }

    // Filter active venues
    const activeVenues = venues.filter(
      (v) => v.isActive && v.approvalStatus === "active"
    );
    const activeVenueIds = new Set(activeVenues.map((v) => v.id));

    // Build enriched court list
    let results = courts
      .filter((c) => c.sportId === sport.id && c.isActive && activeVenueIds.has(c.venueId))
      .map((court) => {
        const venue = activeVenues.find((v) => v.id === court.venueId)!;
        const area = areas.find((a) => a.id === venue.areaId);
        const courtPricing = allPricing.filter((p) => p.courtId === court.id);
        const minRulePrice = courtPricing.length > 0
          ? Math.min(...courtPricing.map((p) => p.pricePerHour))
          : court.basePrice;
        const maxRulePrice = courtPricing.length > 0
          ? Math.max(...courtPricing.map((p) => p.pricePerHour))
          : court.basePrice;

        return {
          courtId: court.id,
          courtName: court.name,
          courtSlug: court.slug,
          surfaceType: court.surfaceType,
          indoorType: court.indoorType,
          capacity: court.capacity,
          basePrice: court.basePrice,
          minPrice: minRulePrice,
          maxPrice: maxRulePrice,
          venueId: venue.id,
          venueName: venue.name,
          venueSlug: venue.slug,
          venueAddress: venue.address,
          venuePhone: venue.phone,
          openTime: venue.openTime,
          closeTime: venue.closeTime,
          areaId: venue.areaId || "",
          areaLabel: area?.label || "",
          areaCity: area?.city || "",
          areaProvince: area?.province || "",
        };
      });

    // Apply filters
    if (areaId) {
      results = results.filter((r) => r.areaId === areaId);
    }
    if (minPrice > 0) {
      results = results.filter((r) => r.maxPrice >= minPrice);
    }
    if (maxPrice > 0) {
      results = results.filter((r) => r.minPrice <= maxPrice);
    }
    if (search) {
      results = results.filter(
        (r) =>
          r.courtName.toLowerCase().includes(search) ||
          r.venueName.toLowerCase().includes(search) ||
          r.venueAddress.toLowerCase().includes(search) ||
          r.areaLabel.toLowerCase().includes(search) ||
          r.areaCity.toLowerCase().includes(search)
      );
    }

    // Sort
    if (sort === "price_asc") {
      results.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sort === "price_desc") {
      results.sort((a, b) => b.minPrice - a.minPrice);
    } else {
      results.sort((a, b) => a.courtName.localeCompare(b.courtName));
    }

    const total = results.length;
    const offset = (page - 1) * limit;
    const paged = results.slice(offset, offset + limit);

    return NextResponse.json({
      courts: paged,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error searching courts:", error);
    return NextResponse.json(
      { error: "Gagal mencari lapangan." },
      { status: 500 }
    );
  }
}
