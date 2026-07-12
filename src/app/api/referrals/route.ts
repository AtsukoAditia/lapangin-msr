import { NextRequest, NextResponse } from "next/server";
import { sanitizeHTML, bookingLimiter, getClientIP, checkRateLimit } from "@/lib/security";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET — List referrals for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId wajib diisi" }, { status: 400 });
    }

    const { rows: referrals } = await pool.query(
      `SELECT r.*, c.name as referee_name
       FROM referrals r
       LEFT JOIN customers c ON c.id = r.referee_id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC`,
      [customerId]
    );

    const { rows: transactions } = await pool.query(
      `SELECT * FROM loyalty_transactions
       WHERE customer_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [customerId]
    );

    const { rows: stats } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals,
         COALESCE(SUM(points_awarded) FILTER (WHERE status = 'completed'), 0) as total_earned
       FROM referrals
       WHERE referrer_id = $1`,
      [customerId]
    );

    const { rows: customerRow } = await pool.query(
      "SELECT loyalty_points, total_spent FROM customers WHERE id = $1",
      [customerId]
    );

    return NextResponse.json({
      referralCode: referrals[0]?.referral_code || null,
      referrals,
      transactions,
      stats: {
        completedReferrals: parseInt(stats[0]?.completed_referrals || "0"),
        totalPointsEarned: parseInt(stats[0]?.total_earned || "0"),
        currentBalance: customerRow[0]?.loyalty_points || 0,
        totalSpent: customerRow[0]?.total_spent || 0,
      },
    });
  } catch (error) {
    console.error("Referral GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data referral" }, { status: 500 });
  }
}

// POST — Generate referral code for a customer
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 }
      );
    }

    const raw = await request.json();
    const customerId = sanitizeHTML(String(raw.customerId || "")).slice(0, 50);

    if (!customerId) {
      return NextResponse.json({ error: "customerId wajib diisi" }, { status: 400 });
    }

    // Check if customer already has a referral code
    const { rows: existing } = await pool.query(
      "SELECT referral_code FROM referrals WHERE referrer_id = $1 ORDER BY created_at DESC LIMIT 1",
      [customerId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ referralCode: existing[0].referral_code });
    }

    // Generate new referral code
    const code = generateReferralCode();
    const id = `ref-${Date.now()}`;

    await pool.query(
      "INSERT INTO referrals (id, referrer_id, referral_code, status) VALUES ($1, $2, $3, 'pending')",
      [id, customerId, code]
    );

    return NextResponse.json({ referralCode: code }, { status: 201 });
  } catch (error) {
    console.error("Referral POST error:", error);
    return NextResponse.json({ error: "Gagal membuat kode referral" }, { status: 500 });
  }
}

// PATCH — Apply referral code (when referee signs up)
export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 }
      );
    }

    const raw = await request.json();
    const referralCode = sanitizeHTML(String(raw.referralCode || "")).slice(0, 20);
    const refereeId = sanitizeHTML(String(raw.refereeId || "")).slice(0, 50);

    if (!referralCode || !refereeId) {
      return NextResponse.json({ error: "referralCode dan refereeId wajib diisi" }, { status: 400 });
    }

    // Find referral
    const { rows: referral } = await pool.query(
      "SELECT * FROM referrals WHERE referral_code = $1 AND status = 'pending'",
      [referralCode]
    );

    if (referral.length === 0) {
      return NextResponse.json({ error: "Kode referral tidak valid atau sudah digunakan" }, { status: 404 });
    }

    const ref = referral[0];

    // Prevent self-referral
    if (ref.referrer_id === refereeId) {
      return NextResponse.json({ error: "Tidak bisa menggunakan referral sendiri" }, { status: 400 });
    }

    const REFERRAL_POINTS = 50000; // 50k points for referrer
    const REFEREE_POINTS = 25000;  // 25k points for referee

    // Update referral status
    await pool.query(
      "UPDATE referrals SET status = 'completed', referee_id = $1, points_awarded = $2, completed_at = NOW() WHERE id = $3",
      [refereeId, REFERRAL_POINTS, ref.id]
    );

    // Award points to referrer
    await pool.query(
      "UPDATE customers SET loyalty_points = loyalty_points + $1, updated_at = NOW() WHERE id = $2",
      [REFERRAL_POINTS, ref.referrer_id]
    );

    // Award points to referee
    await pool.query(
      "UPDATE customers SET loyalty_points = loyalty_points + $1, updated_at = NOW() WHERE id = $2",
      [REFEREE_POINTS, refereeId]
    );

    // Log transactions
    await pool.query(
      `INSERT INTO loyalty_transactions (customer_id, points, type, description) VALUES
        ($1, $2, 'bonus', $3),
        ($4, $5, 'bonus', $6)`,
      [
        ref.referrer_id, REFERRAL_POINTS, `Bonus referral: teman bergabung`,
        refereeId, REFEREE_POINTS, `Bonus menggunakan kode referral ${referralCode}`,
      ]
    );

    return NextResponse.json({
      success: true,
      referrerPoints: REFERRAL_POINTS,
      refereePoints: REFEREE_POINTS,
    });
  } catch (error) {
    console.error("Referral PATCH error:", error);
    return NextResponse.json({ error: "Gagal menggunakan kode referral" }, { status: 500 });
  }
}
