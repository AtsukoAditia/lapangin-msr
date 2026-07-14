import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json() as { status?: string };

    if (!status || !["active", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid. Gunakan: active, rejected" },
        { status: 400 },
      );
    }

    await pool.query(
      `UPDATE venues SET approval_status = $2, is_active = $3, updated_at = NOW() WHERE id = $1`,
      [id, status, status === "active"],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin venues PATCH error:", error);
    return NextResponse.json({ error: "Gagal update venue" }, { status: 500 });
  }
}
