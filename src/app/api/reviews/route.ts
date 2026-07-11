import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { sanitizeHTML, bookingLimiter, getClientIP, checkRateLimit } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const courtId = searchParams.get("courtId");

    const adapter = getDatabaseAdapter();

    if (venueId) {
      const reviews = await adapter.getReviewsByVenue(venueId);
      const rating = await adapter.getVenueRating(venueId);
      return NextResponse.json({ reviews, ...rating });
    }

    if (courtId) {
      const reviews = await adapter.getReviewsByCourt(courtId);
      return NextResponse.json({ reviews });
    }

    return NextResponse.json(
      { error: "venueId or courtId required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil review" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 }
      );
    }

    // Auth required
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Login diperlukan" },
        { status: 401 }
      );
    }
    const session = await verifyToken(token);
    if (!session || session.role !== "customer") {
      return NextResponse.json(
        { error: "Login diperlukan" },
        { status: 401 }
      );
    }

    const raw = await request.json();
    const bookingId = sanitizeHTML(String(raw.bookingId || "")).slice(0, 50);
    const venueId = sanitizeHTML(String(raw.venueId || "")).slice(0, 50);
    const courtId = sanitizeHTML(String(raw.courtId || "")).slice(0, 50);
    const rating = Math.min(Math.max(Number(raw.rating) || 0, 1), 5);
    const comment = sanitizeHTML(String(raw.comment || "")).trim().slice(0, 1000);
    const photos = Array.isArray(raw.photos)
      ? raw.photos.map((p: string) => sanitizeHTML(String(p)).slice(0, 2000)).slice(0, 5)
      : [];

    if (!bookingId || !venueId || !rating) {
      return NextResponse.json(
        { error: "bookingId, venueId, dan rating wajib diisi" },
        { status: 400 }
      );
    }

    const adapter = getDatabaseAdapter();

    // Check if already reviewed
    const existing = await adapter.getReviewByBooking(bookingId);
    if (existing) {
      return NextResponse.json(
        { error: "Booking ini sudah direview" },
        { status: 409 }
      );
    }

    const review = await adapter.createReview({
      bookingId,
      customerId: session.userId,
      venueId,
      courtId: courtId || undefined,
      rating,
      comment,
      photos: photos.length > 0 ? photos : undefined,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan review" },
      { status: 500 }
    );
  }
}
