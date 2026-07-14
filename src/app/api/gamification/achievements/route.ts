import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

async function getAchievements(customerId: string): Promise<Achievement[]> {
  const { rows: customer } = await pool.query(
    "SELECT loyalty_points, total_spent FROM customers WHERE id = $1",
    [customerId]
  );

  const { rows: bookingCount } = await pool.query(
    `SELECT COUNT(*) as count FROM bookings WHERE customer_name = (
      SELECT name FROM customers WHERE id = $1
    ) AND booking_status IN ('confirmed', 'completed')`,
    [customerId]
  );

  const { rows: referralCount } = await pool.query(
    "SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1 AND status = 'completed'",
    [customerId]
  );

  const { rows: reviewCount } = await pool.query(
    "SELECT COUNT(*) as count FROM reviews WHERE customer_id = $1",
    [customerId]
  );

  const points = customer[0]?.loyalty_points || 0;
  const spent = customer[0]?.total_spent || 0;
  const bookings = parseInt(bookingCount[0]?.count || "0");
  const referrals = parseInt(referralCount[0]?.count || "0");
  const reviews = parseInt(reviewCount[0]?.count || "0");

  const achievements: Achievement[] = [
    // Booking milestones
    { id: "first-booking", name: "First Step", description: "Selesaikan booking pertama", icon: "🎯", requirement: 1, current: bookings, unlocked: bookings >= 1, tier: "bronze" },
    { id: "5-bookings", name: "Regular Player", description: "Selesaikan 5 booking", icon: "🏸", requirement: 5, current: bookings, unlocked: bookings >= 5, tier: "silver" },
    { id: "10-bookings", name: "Court Master", description: "Selesaikan 10 booking", icon: "👑", requirement: 10, current: bookings, unlocked: bookings >= 10, tier: "gold" },
    { id: "25-bookings", name: "Legend", description: "Selesaikan 25 booking", icon: "🏆", requirement: 25, current: bookings, unlocked: bookings >= 25, tier: "platinum" },

    // Spending milestones
    { id: "first-500k", name: "Big Spender", description: "Habiskan total Rp 500.000", icon: "💰", requirement: 500000, current: spent, unlocked: spent >= 500000, tier: "bronze" },
    { id: "2m-spent", name: "VIP Player", description: "Habiskan total Rp 2.000.000", icon: "💎", requirement: 2000000, current: spent, unlocked: spent >= 2000000, tier: "silver" },
    { id: "5m-spent", name: "Elite Player", description: "Habiskan total Rp 5.000.000", icon: "⭐", requirement: 5000000, current: spent, unlocked: spent >= 5000000, tier: "gold" },
    { id: "10m-spent", name: "Champion", description: "Habiskan total Rp 10.000.000", icon: "🔥", requirement: 10000000, current: spent, unlocked: spent >= 10000000, tier: "platinum" },

    // Points milestones
    { id: "1k-points", name: "Point Collector", description: "Kumpulkan 1.000 poin", icon: "🪙", requirement: 1000, current: points, unlocked: points >= 1000, tier: "bronze" },
    { id: "10k-points", name: "Point Master", description: "Kumpulkan 10.000 poin", icon: "🏅", requirement: 10000, current: points, unlocked: points >= 10000, tier: "silver" },
    { id: "50k-points", name: "Point Legend", description: "Kumpulkan 50.000 poin", icon: "🎖️", requirement: 50000, current: points, unlocked: points >= 50000, tier: "gold" },

    // Referral milestones
    { id: "first-referral", name: "Influencer", description: "Ajak 1 teman bergabung", icon: "🤝", requirement: 1, current: referrals, unlocked: referrals >= 1, tier: "bronze" },
    { id: "5-referrals", name: "Social Butterfly", description: "Ajak 5 teman bergabung", icon: "🦋", requirement: 5, current: referrals, unlocked: referrals >= 5, tier: "silver" },
    { id: "10-referrals", name: "Community Leader", description: "Ajak 10 teman bergabung", icon: "🌟", requirement: 10, current: referrals, unlocked: referrals >= 10, tier: "gold" },

    // Review milestones
    { id: "first-review", name: "Reviewer", description: "Tulis review pertama", icon: "✍️", requirement: 1, current: reviews, unlocked: reviews >= 1, tier: "bronze" },
    { id: "5-reviews", name: "Trusted Voice", description: "Tulis 5 review", icon: "📣", requirement: 5, current: reviews, unlocked: reviews >= 5, tier: "silver" },
    { id: "10-reviews", name: "Expert Reviewer", description: "Tulis 10 review", icon: "📝", requirement: 10, current: reviews, unlocked: reviews >= 10, tier: "gold" },
  ];

  return achievements;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let customerId = searchParams.get("customerId");

    if (!customerId) {
      const cookieStore = await cookies();
      const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
      const session = token ? await verifyToken(token) : null;
      if (session?.role === "customer" && session?.userId) customerId = session.userId;
    }

    if (!customerId) {
      return NextResponse.json({ error: "customerId wajib diisi (atau login sebagai customer)" }, { status: 401 });
    }

    const achievements = await getAchievements(customerId);
    const unlocked = achievements.filter((a) => a.unlocked);
    const locked = achievements.filter((a) => !a.unlocked);

    const tierCounts = {
      bronze: unlocked.filter((a) => a.tier === "bronze").length,
      silver: unlocked.filter((a) => a.tier === "silver").length,
      gold: unlocked.filter((a) => a.tier === "gold").length,
      platinum: unlocked.filter((a) => a.tier === "platinum").length,
    };

    const totalPoints = achievements.reduce((sum, a) => {
      if (a.unlocked) {
        switch (a.tier) {
          case "bronze": return sum + 100;
          case "silver": return sum + 250;
          case "gold": return sum + 500;
          case "platinum": return sum + 1000;
        }
      }
      return sum;
    }, 0);

    return NextResponse.json({
      achievements: { unlocked, locked },
      stats: {
        totalAchievements: achievements.length,
        unlockedCount: unlocked.length,
        completionPct: Math.round((unlocked.length / achievements.length) * 100),
        tierCounts,
        achievementPoints: totalPoints,
      },
    });
  } catch (error) {
    console.error("Achievements error:", error);
    return NextResponse.json({ error: "Gagal mengambil data achievements" }, { status: 500 });
  }
}
