import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();

    const [bookings, courts, venues, sports] = await Promise.all([
      adapter.getBookings(),
      adapter.getCourts(),
      adapter.getVenues(),
      adapter.getSports(),
    ]);

    const confirmed = bookings.filter(
      (b) => b.bookingStatus === "confirmed" || b.bookingStatus === "completed"
    );

    const courtMap = new Map(courts.map((c) => [c.id, c]));
    const venueMap = new Map(venues.map((v) => [v.id, v]));
    const sportMap = new Map(sports.map((s) => [s.id, s]));

    // Revenue by date (last 30 days)
    const revenueByDate: Record<string, { revenue: number; bookings: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      revenueByDate[key] = { revenue: 0, bookings: 0 };
    }
    for (const b of confirmed) {
      if (revenueByDate[b.bookingDate]) {
        revenueByDate[b.bookingDate].revenue += b.totalPrice;
        revenueByDate[b.bookingDate].bookings += 1;
      }
    }

    // Revenue by hour
    const revenueByHour: Record<number, { revenue: number; bookings: number }> = {};
    for (let h = 0; h < 24; h++) revenueByHour[h] = { revenue: 0, bookings: 0 };
    for (const b of confirmed) {
      const hour = parseInt(b.startTime.split(":")[0]);
      revenueByHour[hour].revenue += b.totalPrice;
      revenueByHour[hour].bookings += 1;
    }

    // Revenue by court
    const revenueByCourt: Record<string, { name: string; venue: string; revenue: number; bookings: number }> = {};
    for (const court of courts) {
      const venue = venueMap.get(court.venueId);
      revenueByCourt[court.id] = { name: court.name, venue: venue?.name || "Unknown", revenue: 0, bookings: 0 };
    }
    for (const b of confirmed) {
      if (revenueByCourt[b.courtId]) {
        revenueByCourt[b.courtId].revenue += b.totalPrice;
        revenueByCourt[b.courtId].bookings += 1;
      }
    }

    // Summary stats
    const totalRevenue = confirmed.reduce((s, b) => s + b.totalPrice, 0);
    const totalBookings = confirmed.length;
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthRevenue = confirmed
      .filter((b) => { const d = new Date(b.bookingDate); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
      .reduce((s, b) => s + b.totalPrice, 0);
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthRevenue = confirmed
      .filter((b) => { const d = new Date(b.bookingDate); return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear; })
      .reduce((s, b) => s + b.totalPrice, 0);
    const monthlyGrowth = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

    // ── NEW: Revenue by sport ──
    const revenueBySport: Record<string, { name: string; revenue: number; bookings: number; color: string }> = {};
    const sportColors = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
    for (const s of sports) {
      revenueBySport[s.id] = { name: s.name, revenue: 0, bookings: 0, color: "" };
    }
    for (const b of confirmed) {
      if (revenueBySport[b.sportId]) {
        revenueBySport[b.sportId].revenue += b.totalPrice;
        revenueBySport[b.sportId].bookings += 1;
      }
    }
    let colorIdx = 0;
    for (const key of Object.keys(revenueBySport)) {
      if (revenueBySport[key].revenue > 0) {
        revenueBySport[key].color = sportColors[colorIdx % sportColors.length];
        colorIdx++;
      }
    }

    // ── NEW: Bookings by day of week ──
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const bookingsByDay = dayNames.map((name) => ({ name, count: 0 }));
    for (const b of confirmed) {
      const dow = new Date(b.bookingDate).getDay();
      bookingsByDay[dow].count += 1;
    }

    // ── NEW: Heatmap data (day x hour) ──
    // 7 rows (Mon=0..Sun=6) x 24 cols
    const heatmapData: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const b of confirmed) {
      const d = new Date(b.bookingDate);
      // JS getDay(): 0=Sun, convert to Mon=0..Sun=6
      const dow = (d.getDay() + 6) % 7;
      const hour = parseInt(b.startTime.split(":")[0]);
      heatmapData[dow][hour] += 1;
    }

    // ── NEW: Monthly trend (last 12 months) ──
    const monthlyTrend: { month: string; revenue: number; bookings: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const monthBookings = confirmed.filter((b) => {
        const bd = new Date(b.bookingDate);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      monthlyTrend.push({
        month: label,
        revenue: monthBookings.reduce((s, b) => s + b.totalPrice, 0),
        bookings: monthBookings.length,
      });
    }

    return NextResponse.json({
      summary: { totalRevenue, totalBookings, avgBookingValue, thisMonthRevenue, lastMonthRevenue, monthlyGrowth },
      revenueByDate: Object.entries(revenueByDate).map(([date, d]) => ({ date, ...d })),
      revenueByHour: Object.entries(revenueByHour).map(([hour, d]) => ({ hour: parseInt(hour), ...d })),
      revenueByCourt: Object.values(revenueByCourt).filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue),
      revenueBySport: Object.values(revenueBySport).filter((s) => s.revenue > 0).sort((a, b) => b.revenue - a.revenue),
      bookingsByDay,
      heatmapData,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil statistik revenue" }, { status: 500 });
  }
}
