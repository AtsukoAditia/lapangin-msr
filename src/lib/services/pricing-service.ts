import type { PricingRule } from "@/lib/types/domain";

export function calculatePrice(params: {
  durationMinutes: number;
  basePrice: number;
  pricingRules?: PricingRule[];
}): number {
  const hours = params.durationMinutes / 60;

  // MVP: use base price first.
  // Later: apply pricing rule by day type, peak hour, weekend, holiday.
  return params.basePrice * hours;
}
