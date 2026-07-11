import type { DatabaseAdapter } from "@/lib/adapters/database-adapter";
import type { PricingRule } from "@/lib/types/domain";

export class PricingService {
  constructor(private readonly adapter: DatabaseAdapter) {}

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    return this.adapter.getPricingRules(courtId);
  }
}

interface PriceCalculationInput {
  durationMinutes: number;
  basePrice: number;
  pricingRules: PricingRule[];
  bookingDate?: string;
  startTime?: string;
  courtId?: string;
  adapter?: DatabaseAdapter;
}

function getPeakHourMultiplier(hour: number): number {
  if (hour >= 17 && hour < 21) return 1.25; // Peak hours
  if (hour >= 6 && hour < 8) return 0.9;    // Early bird discount
  if (hour >= 21 && hour < 23) return 0.95;  // Night discount
  return 1.0;
}

function getDayMultiplier(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay();
  if (day === 0 || day === 6) return 1.15; // Weekend +15%
  return 1.0;
}

export async function calculateDynamicPrice(
  input: PriceCalculationInput,
  adapter?: DatabaseAdapter
): Promise<number> {
  const { durationMinutes, basePrice, pricingRules, bookingDate, startTime, courtId } = input;

  // Get base price from rules
  let effectiveBasePrice = basePrice;
  const sortedRules = [...pricingRules]
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  if (sortedRules.length > 0) {
    effectiveBasePrice = sortedRules[0].pricePerHour;
  }

  let baseTotal = Math.round((durationMinutes / 60) * effectiveBasePrice);

  // Apply dynamic multipliers if date/time available
  if (bookingDate && startTime) {
    const startHour = parseInt(startTime.split(":")[0]);

    baseTotal = Math.round(baseTotal * getPeakHourMultiplier(startHour));
    baseTotal = Math.round(baseTotal * getDayMultiplier(bookingDate));

    // Apply demand multiplier if adapter available
    if (adapter && courtId) {
      try {
        const bookings = await adapter.getBookingsByCourtAndDate(courtId, bookingDate);
        const confirmed = bookings.filter(
          (b) => b.bookingStatus !== "expired" && b.bookingStatus !== "cancelled"
        );
        const occupancy = confirmed.length / 14; // 14 slots per day
        if (occupancy > 0.7) baseTotal = Math.round(baseTotal * 1.2);
        else if (occupancy < 0.2 && confirmed.length > 0) baseTotal = Math.round(baseTotal * 0.9);
      } catch {
        // Skip demand multiplier on error
      }
    }
  }

  return baseTotal;
}

export function calculatePrice(input: PriceCalculationInput): number {
  const { durationMinutes, basePrice, pricingRules } = input;

  if (pricingRules.length === 0) {
    return Math.round((durationMinutes / 60) * basePrice);
  }

  const sortedRules = [...pricingRules]
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  if (sortedRules.length > 0) {
    return Math.round((durationMinutes / 60) * sortedRules[0].pricePerHour);
  }

  return Math.round((durationMinutes / 60) * basePrice);
}
