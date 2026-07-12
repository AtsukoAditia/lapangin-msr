import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session || session.role !== "customer") return null;
  return session;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adapter = getDatabaseAdapter();
    const transactions = await adapter.getLoyaltyTransactions(session.userId);
    const customer = await adapter.getCustomerById(session.userId);
    const rewards = await adapter.getActiveRewards();
    const redemptions = await adapter.getCustomerRedemptions(session.userId);
    return NextResponse.json({ 
      success: true,
      data: {
        transactions, 
        totalPoints: customer?.loyaltyPoints || 0,
        tier: customer?.loyaltyTier || 'bronze',
        totalSpent: customer?.totalSpent || 0,
        rewards,
        redemptions,
      },
    });
  } catch (error) {
    console.error("Get loyalty error:", error);
    return NextResponse.json({ error: "Gagal mengambil data loyalty" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, bookingId } = await request.json();
    const adapter = getDatabaseAdapter();

    if (action === "redeem") {
      if (!bookingId) {
        return NextResponse.json({ error: "Reward ID diperlukan" }, { status: 400 });
      }
      // bookingId parameter is reused as rewardId for redemption
      const result = await adapter.redeemLoyaltyPoints(session.userId, bookingId);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Loyalty action error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}