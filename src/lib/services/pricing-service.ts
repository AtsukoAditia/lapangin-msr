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
}

export function calculatePrice(input: PriceCalculationInput): number {
  const { durationMinutes, basePrice, pricingRules } = input;

  if (pricingRules.length === 0) {
    // No special rules: use base price
    return Math.round((durationMinutes / 60) * basePrice);
  }

  // Use the highest-priority active rule that applies
  const sortedRules = [...pricingRules]
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  if (sortedRules.length > 0) {
    return Math.round((durationMinutes / 60) * sortedRules[0].pricePerHour);
  }

  return Math.round((durationMinutes / 60) * basePrice);
}