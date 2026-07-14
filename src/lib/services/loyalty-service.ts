/**
 * LoyaltyService — single source of truth for all loyalty point operations.
 *
 * Extracted from auth/service.ts and booking-service.ts to prevent duplicate
 * logic and ensure consistent point awarding/deduction across the app.
 */

import type { DatabaseAdapter } from "@/lib/adapters/database-adapter";
import type { LoyaltyTransaction, Reward, RewardRedemption } from "@/lib/types/domain";

// Points earned per Rp 10.000 confirmed booking value
const POINTS_PER_10K_DIVISOR = 10_000;

export class LoyaltyService {
  constructor(private readonly adapter: DatabaseAdapter) {}

  /**
   * Award loyalty points for a confirmed booking.
   *
   * Prevents duplicate awards by checking the loyalty ledger for an existing
   * "earned" transaction with the same bookingId.
   */
  async awardBookingPoints(
    customerId: string,
    bookingId: string,
    totalPrice: number,
    bookingCode: string,
  ): Promise<{ pointsEarned: number; transaction: LoyaltyTransaction } | null> {
    const points = Math.floor(totalPrice / POINTS_PER_10K_DIVISOR);
    if (points <= 0) return null;

    // Prevent duplicate awards
    const existing = await this.getEarnedTransactionForBooking(customerId, bookingId);
    if (existing) {
      console.warn(`[Loyalty] Points already awarded for booking ${bookingCode}`);
      return null;
    }

    const description = `Poin dari booking ${bookingCode} - Rp ${totalPrice.toLocaleString("id-ID")}`;
    const tx = await this.adapter.addLoyaltyPoints(customerId, points, bookingId, description, "earned");
    return { pointsEarned: points, transaction: tx };
  }

  /**
   * Add bonus or manual points (referral, campaign, admin adjustment).
   */
  async addBonusPoints(
    customerId: string,
    points: number,
    description: string,
  ): Promise<LoyaltyTransaction> {
    return this.adapter.addLoyaltyPoints(customerId, points, undefined, description, "bonus");
  }

  /**
   * Deduct points for a reward redemption.
   * Throws if insufficient balance.
   */
  async deductPoints(
    customerId: string,
    points: number,
    description: string,
  ): Promise<{ id: string; newBalance: number }> {
    const customer = await this.adapter.getCustomerById(customerId);
    if (!customer) throw new Error("Customer not found");
    if (customer.loyaltyPoints < points) throw new Error("Poin tidak mencukupi");

    const tx = await this.adapter.addLoyaltyPoints(customerId, -points, undefined, description, "redeemed");
    const updated = await this.adapter.getCustomerById(customerId);
    return { id: tx.id, newBalance: updated?.loyaltyPoints ?? 0 };
  }

  /**
   * Get loyalty balance for a customer.
   */
  async getBalance(customerId: string): Promise<number> {
    const customer = await this.adapter.getCustomerById(customerId);
    return customer?.loyaltyPoints ?? 0;
  }

  /**
   * Get all loyalty transactions for a customer.
   */
  async getTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    return this.adapter.getLoyaltyTransactions(customerId);
  }

  /**
   * Get available rewards.
   */
  async getRewards(): Promise<Reward[]> {
    return this.adapter.getActiveRewards();
  }

  /**
   * Redeem a reward. Deducts points and creates a redemption record.
   */
  async redeemReward(
    customerId: string,
    rewardId: string,
  ): Promise<RewardRedemption> {
    return this.adapter.redeemLoyaltyPoints(customerId, rewardId);
  }

  /**
   * Get customer's redemption history.
   */
  async getRedemptions(customerId: string): Promise<RewardRedemption[]> {
    return this.adapter.getCustomerRedemptions(customerId);
  }

  /**
   * Calculate loyalty tier based on points.
   */
  getTier(points: number): "bronze" | "silver" | "gold" | "platinum" {
    if (points >= 10_000) return "platinum";
    if (points >= 5_000) return "gold";
    if (points >= 2_000) return "silver";
    return "bronze";
  }

  // ── Private ──

  private async getEarnedTransactionForBooking(customerId: string, bookingId: string): Promise<LoyaltyTransaction | undefined> {
    // PG unique index `loyalty_one_earned_tx_per_booking` is the primary guard.
    // Service-level check is a best-effort early bail.
    // ponytail: add adapter.getLoyaltyByBookingId() if this becomes a hot path.
    const txs = await this.adapter.getLoyaltyTransactions(customerId);
    return txs.find((tx) => tx.bookingId === bookingId && tx.type === "earned");
  }
}
