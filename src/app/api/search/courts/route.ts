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
    const sort = searchParams.get("sort") || "name"; // name | price_asc | price_desc | rating_desc | distance_asc
    const minRating = Number(searchParams.get("minRating")) || 0;
    const userLat = Number(searchParams.get("lat")) || 0;
    const userLng = Number(searchParams.get("lng")) || 0;

    const [sports, venues, courts, areas, allPricing] = await Promise.all([
      adapter.getSports(),
      adapter.getVenues(),
      adapter.getCourts(),
      adapter.getAreas(),
      adapter.getAllPricingRules(),
    ]);

    // Batch fetch venue ratings for all active venues
    const activeVenuesEarly = venues.filter((v) => v.isActive && v.approvalStatus === "active");
    const ratingEntries = await Promise.all(
      activeVenuesEarly.map((v) => adapter.getVenueRating(v.id).catch(() => ({ avgRating: 0, reviewCount: 0 })))
    );
    const venueRatingMap = new Map(activeVenuesEarly.map((v, i) => [v.id, ratingEntries[i]]));

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

        const venueRating = venueRatingMap.get(venue.id) || { avgRating: 0, reviewCount: 0 };

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
          avgRating: venueRating.avgRating,
          reviewCount: venueRating.reviewCount,
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

    // Rating filter
    if (minRating > 0) {
      results = results.filter((r) => r.avgRating >= minRating);
    }

    // Distance calculation (mock: use venue address hash for stable coords if no real lat/lng stored)
    const hasUserLocation = userLat !== 0 && userLng !== 0;
    if (hasUserLocation) {
      // Haversine distance from user to approximate venue coords
      // Venue coords stored in venue.mapsUrl or we use mock coords based on areaId hash
      const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {};
      function getAreaCoords(areaId: string): { lat: number; lng: number } {
        if (MOCK_COORDS[areaId]) return MOCK_COORDS[areaId];
        // Generate stable mock coords from areaId hash centered around Jakarta
        let hash = 0;
        for (let i = 0; i < areaId.length; i++) hash = ((hash << 5) - hash + areaId.charCodeAt(i)) | 0;
        const lat = -6.2 + (Math.abs(hash % 100) / 100) * 0.5;
        const lng = 106.8 + (Math.abs((hash >> 8) % 100) / 100) * 0.5;
        const coords = { lat, lng };
        MOCK_COORDS[areaId] = coords;
        return coords;
      }

      function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      results = results.map((r) => {
        const coords = getAreaCoords(r.areaId);
        return { ...r, distanceKm: Math.round(haversine(userLat, userLng, coords.lat, coords.lng) * 10) / 10 };
      });
    }

    // Sort
    if (sort === "price_asc") {
      results.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sort === "price_desc") {
      results.sort((a, b) => b.minPrice - a.minPrice);
    } else if (sort === "rating_desc") {
      results.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === "distance_asc" && hasUserLocation) {
      results.sort((a, b) => ((a as unknown as Record<string, number>).distanceKm ?? 9999) - ((b as unknown as Record<string, number>).distanceKm ?? 9999));
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
