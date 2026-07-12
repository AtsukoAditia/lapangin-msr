import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.role !== "owner" || !session.ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adapter = getDatabaseAdapter();

    // Get owner's venues
    const venues = await adapter.getVenuesByOwner(session.ownerId);
    const venueIds = new Set(venues.map(v => v.id));

    // Get all courts for owner's venues
    const allCourts = await adapter.getAllCourts();
    const ownerCourts = allCourts.filter(c => venueIds.has(c.venueId));

    // Get all bookings for owner's courts
    const allBookings = await adapter.getBookings();
    const courtIds = new Set(ownerCourts.map(c => c.id));
    const ownerBookings = allBookings.filter(b => courtIds.has(b.courtId));

    const stats = {
      totalBookings: ownerBookings.length,
      pendingBookings: ownerBookings.filter(b => b.bookingStatus === "waiting_payment" || b.bookingStatus === "waiting_verification").length,
      confirmedBookings: ownerBookings.filter(b => b.bookingStatus === "confirmed").length,
      totalRevenue: ownerBookings.filter(b => b.paymentStatus === "paid").reduce((sum, b) => sum + b.totalPrice, 0),
      totalCourts: ownerCourts.length,
      activeCourts: ownerCourts.filter(c => c.isActive).length,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Owner stats error:", error);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
