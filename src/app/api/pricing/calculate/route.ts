import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

interface PricingMultiplier {
  name: string;
  factor: number;
  reason: string;
}

function getPeakHourMultiplier(hour: number): PricingMultiplier | null {
  // Peak hours: 17:00-21:00 (after work) → 1.25x
  if (hour >= 17 && hour < 21) {
    return { name: "Peak Hour", factor: 1.25, reason: "Jam ramai (17:00-21:00)" };
  }
  // Early morning: 06:00-08:00 → 0.9x (discount)
  if (hour >= 6 && hour < 8) {
    return { name: "Early Bird", factor: 0.9, reason: "Diskon pagi hari (06:00-08:00)" };
  }
  // Late night: 21:00-23:00 → 0.95x (slight discount)
  if (hour >= 21 && hour < 23) {
    return { name: "Night Discount", factor: 0.95, reason: "Diskon malam hari (21:00-23:00)" };
  }
  return null;
}

function getDayMultiplier(dateStr: string): PricingMultiplier | null {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay(); // 0=Sun, 6=Sat

  if (day === 0 || day === 6) {
    return { name: "Weekend", factor: 1.15, reason: "Weekend surcharge (+15%)" };
  }
  return null;
}

function getDemandMultiplier(existingBookings: number, totalSlots: number): PricingMultiplier | null {
  if (totalSlots === 0) return null;
  const occupancy = existingBookings / totalSlots;

  // High demand: >70% occupancy → 1.2x
  if (occupancy > 0.7) {
    return { name: "High Demand", factor: 1.2, reason: `Permintaan tinggi (${Math.round(occupancy * 100)}% terisi)` };
  }
  // Low demand: <20% occupancy → 0.9x
  if (occupancy < 0.2 && existingBookings > 0) {
    return { name: "Low Demand", factor: 0.9, reason: `Diskon rendah (${Math.round(occupancy * 100)}% terisi)` };
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!courtId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Parameter courtId, date, startTime, endTime wajib diisi" },
        { status: 400 }
      );
    }

    const adapter = getDatabaseAdapter();
    const courts = await adapter.getCourts();
    const court = courts.find((c) => c.id === courtId);

    if (!court) {
      return NextResponse.json({ error: "Court tidak ditemukan" }, { status: 404 });
    }

    // Get base price from pricing rules
    const rules = await adapter.getAllPricingRules();
    const dayOfWeek = new Date(date + "T00:00:00").getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const matchingRules = rules.filter((r) => {
      if (r.courtId !== courtId) return false;
      if (r.dayType !== "all") {
        if (r.dayType === "weekend" && !isWeekend) return false;
        if (r.dayType === "weekday" && isWeekend) return false;
      }
      return true;
    });

    // Use highest priority rule, or court base price
    const rule = matchingRules.sort((a, b) => b.priority - a.priority)[0];
    const basePrice = rule ? rule.pricePerHour : court.basePrice;

    // Calculate duration
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    const durationHours = endHour - startHour;

    if (durationHours <= 0) {
      return NextResponse.json({ error: "Jam akhir harus setelah jam mulai" }, { status: 400 });
    }

    // Get existing bookings for demand calculation
    const existingBookings = await adapter.getBookingsByCourtAndDate(courtId, date);
    const confirmedBookings = existingBookings.filter(
      (b) => b.bookingStatus !== "expired" && b.bookingStatus !== "cancelled"
    );

    // Assume 14 slots per day (06:00-22:00)
    const totalSlots = 14;

    // Collect multipliers
    const multipliers: PricingMultiplier[] = [];

    const peakMult = getPeakHourMultiplier(startHour);
    if (peakMult) multipliers.push(peakMult);

    const dayMult = getDayMultiplier(date);
    if (dayMult) multipliers.push(dayMult);

    const demandMult = getDemandMultiplier(confirmedBookings.length, totalSlots);
    if (demandMult) multipliers.push(demandMult);

    // Apply multipliers
    let finalMultiplier = 1.0;
    for (const m of multipliers) {
      finalMultiplier *= m.factor;
    }

    const baseTotal = basePrice * durationHours;
    const finalTotal = Math.round(baseTotal * finalMultiplier);

    return NextResponse.json({
      courtId,
      courtName: court.name,
      date,
      startTime,
      endTime,
      durationHours,
      basePricePerHour: basePrice,
      baseTotal,
      finalTotal,
      finalMultiplier: Math.round(finalMultiplier * 100) / 100,
      savings: baseTotal - finalTotal,
      multipliers,
      rule: rule ? { id: rule.id, name: rule.dayType, priority: rule.priority } : null,
      demand: {
        existingBookings: confirmedBookings.length,
        totalSlots,
        occupancy: Math.round((confirmedBookings.length / totalSlots) * 100),
      },
    });
  } catch (error) {
    console.error("Pricing calculation error:", error);
    return NextResponse.json({ error: "Gagal menghitung harga" }, { status: 500 });
  }
}
