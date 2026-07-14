import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool =
  globalForPg.__pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.role !== "owner" || !session.ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adapter = getDatabaseAdapter();
    const venues = await adapter.getVenuesByOwner(session.ownerId);
    const venueIds = venues.map((v) => v.id);

    if (venueIds.length === 0) {
      return NextResponse.json({
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        totalBookings: 0,
        occupancyRate: 0,
        revenueByCourt: [],
        revenueByMonth: [],
        recentBookings: [],
        topCustomers: [],
      });
    }

    // Fetch owner's courts
    const allCourts = await adapter.getAllCourts();
    const ownerCourts = allCourts.filter((c) => venueIds.includes(c.venueId));
    const courtIds = ownerCourts.map((c) => c.id);

    // Fetch bookings for owner's courts via pg for aggregation
    const { rows: bookings } = await pool.query(
      `SELECT * FROM bookings WHERE court_id = ANY($1) ORDER BY created_at DESC`,
      [courtIds],
    );

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const paidBookings = bookings.filter(
      (b: Record<string, unknown>) => b.payment_status === "paid" || b.booking_status === "confirmed" || b.booking_status === "completed",
    );

    // Revenue this/last month
    const revenueThisMonth = paidBookings
      .filter((b: Record<string, unknown>) => {
        const d = new Date(b.booking_date as string);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((s: number, b: Record<string, unknown>) => s + Number(b.total_price), 0);

    const revenueLastMonth = paidBookings
      .filter((b: Record<string, unknown>) => {
        const d = new Date(b.booking_date as string);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((s: number, b: Record<string, unknown>) => s + Number(b.total_price), 0);

    // Total bookings count
    const totalBookings = bookings.length;

    // Occupancy rate: booked hours / available hours (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentConfirmed = bookings.filter(
      (b: Record<string, unknown>) =>
        (b.booking_status === "confirmed" || b.booking_status === "completed") &&
        new Date(b.booking_date as string) >= thirtyDaysAgo,
    );
    const bookedHours = recentConfirmed.reduce(
      (s: number, b: Record<string, unknown>) => s + (Number(b.duration_minutes) || 60) / 60,
      0,
    );
    // Available hours: courts × days × (avg open hours per day ~10h)
    const availableHours = ownerCourts.length * 30 * 10;
    const occupancyRate =
      availableHours > 0
        ? Math.round((bookedHours / availableHours) * 100)
        : 0;

    // Revenue by court
    const courtRevenueMap: Record<string, number> = {};
    for (const b of paidBookings) {
      const cid = b.court_id as string;
      courtRevenueMap[cid] = (courtRevenueMap[cid] || 0) + Number(b.total_price);
    }
    const revenueByCourt = ownerCourts.map((c) => {
      const venue = venues.find((v) => v.id === c.venueId);
      return {
        label: c.name,
        value: courtRevenueMap[c.id] || 0,
        venueName: venue?.name || "",
      };
    });

    // Revenue by month (last 6 months)
    const revenueByMonth: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthLabel = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const revenue = paidBookings
        .filter((b: Record<string, unknown>) => {
          const bd = new Date(b.booking_date as string);
          return bd.getMonth() === m && bd.getFullYear() === y;
        })
        .reduce((s: number, b: Record<string, unknown>) => s + Number(b.total_price), 0);
      revenueByMonth.push({ label: monthLabel, value: revenue });
    }

    // Recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10).map((b: Record<string, unknown>) => {
      const court = ownerCourts.find((c) => c.id === b.court_id);
      const venue = court ? venues.find((v) => v.id === court.venueId) : undefined;
      return {
        id: b.id,
        bookingCode: b.booking_code,
        customerName: b.customer_name,
        courtName: court?.name || "-",
        venueName: venue?.name || "-",
        bookingDate: b.booking_date,
        startTime: b.start_time,
        endTime: b.end_time,
        totalPrice: Number(b.total_price),
        bookingStatus: b.booking_status,
        paymentStatus: b.payment_status,
      };
    });

    // Top customers by spending
    const customerMap: Record<string, { name: string; phone: string; totalSpent: number; bookingCount: number }> = {};
    for (const b of paidBookings) {
      const key = (b.customer_phone as string) || (b.customer_name as string) || "unknown";
      if (!customerMap[key]) {
        customerMap[key] = {
          name: b.customer_name as string,
          phone: b.customer_phone as string,
          totalSpent: 0,
          bookingCount: 0,
        };
      }
      customerMap[key].totalSpent += Number(b.total_price);
      customerMap[key].bookingCount += 1;
    }
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return NextResponse.json({
      revenueThisMonth,
      revenueLastMonth,
      totalBookings,
      occupancyRate,
      revenueByCourt,
      revenueByMonth,
      recentBookings,
      topCustomers,
    });
  } catch (error) {
    console.error("Owner analytics error:", error);
    return NextResponse.json(
      { error: "Gagal memuat analytics" },
      { status: 500 },
    );
  }
}
