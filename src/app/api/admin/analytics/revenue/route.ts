import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();

    // Get all bookings for revenue calculation
    const bookings = await adapter.getBookings();

    // Only confirmed/completed bookings for revenue
    const confirmed = bookings.filter((b) => b.bookingStatus === "confirmed" || b.bookingStatus === "completed");

    // Revenue by date (last 30 days)
    const revenueByDate: Record<string, number> = {};
    const bookingsByDate: Record<string, number> = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      revenueByDate[key] = 0;
      bookingsByDate[key] = 0;
    }

    for (const b of confirmed) {
      const dateKey = b.bookingDate;
      if (revenueByDate[dateKey] !== undefined) {
        revenueByDate[dateKey] += b.totalPrice;
        bookingsByDate[dateKey] += 1;
      }
    }

    // Revenue by hour (peak hours)
    const revenueByHour: Record<number, number> = {};
    const bookingsByHour: Record<number, number> = {};
    for (let h = 0; h < 24; h++) {
      revenueByHour[h] = 0;
      bookingsByHour[h] = 0;
    }
    for (const b of confirmed) {
      const hour = parseInt(b.startTime.split(":")[0]);
      revenueByHour[hour] += b.totalPrice;
      bookingsByHour[hour] += 1;
    }

    // Revenue by court
    const courts = await adapter.getCourts();
    const venues = await adapter.getVenues();
    const revenueByCourt: Record<string, { name: string; venue: string; revenue: number; bookings: number }> = {};

    for (const court of courts) {
      const venue = venues.find((v) => v.id === court.venueId);
      revenueByCourt[court.id] = {
        name: court.name,
        venue: venue?.name || "Unknown",
        revenue: 0,
        bookings: 0,
      };
    }

    for (const b of confirmed) {
      if (revenueByCourt[b.courtId]) {
        revenueByCourt[b.courtId].revenue += b.totalPrice;
        revenueByCourt[b.courtId].bookings += 1;
      }
    }

    // Total stats
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = confirmed.length;
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    // This month vs last month
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthRevenue = confirmed
      .filter((b) => {
        const d = new Date(b.bookingDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthRevenue = confirmed
      .filter((b) => {
        const d = new Date(b.bookingDate);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const monthlyGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalBookings,
        avgBookingValue,
        thisMonthRevenue,
        lastMonthRevenue,
        monthlyGrowth,
      },
      revenueByDate: Object.entries(revenueByDate).map(([date, revenue]) => ({
        date,
        revenue,
        bookings: bookingsByDate[date],
      })),
      revenueByHour: Object.entries(revenueByHour).map(([hour, revenue]) => ({
        hour: parseInt(hour),
        revenue,
        bookings: bookingsByHour[parseInt(hour)],
      })),
      revenueByCourt: Object.values(revenueByCourt)
        .filter((c) => c.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue),
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik revenue" },
      { status: 500 }
    );
  }
}
