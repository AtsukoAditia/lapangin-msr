import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { cookies } from "next/headers";
import { verifyToken, OWNER_TOKEN_NAME, ADMIN_TOKEN_NAME } from "@/lib/auth/jwt";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

async function requireAuth() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
  if (adminToken) {
    const s = await verifyToken(adminToken);
    if (s && (s.role === "admin" || s.role === "super_admin")) return s;
  }
  const ownerToken = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  if (ownerToken) {
    const s = await verifyToken(ownerToken);
    if (s && s.role === "owner") return s;
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courtId } = await params;
    const { rows } = await pool.query(
      "SELECT * FROM court_photos WHERE court_id = $1 ORDER BY sort_order ASC, created_at DESC",
      [courtId],
    );
    return NextResponse.json({ photos: rows });
  } catch (error) {
    console.error("[Photos GET] Error:", error);
    return NextResponse.json({ error: "Gagal mengambil foto" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courtId } = await params;
    const { url, caption, sortOrder } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL foto wajib diisi" }, { status: 400 });
    }

    const photoId = `photo-${Date.now()}`;
    await pool.query(
      "INSERT INTO court_photos (id, court_id, url, caption, sort_order) VALUES ($1, $2, $3, $4, $5)",
      [photoId, courtId, url, caption || "", sortOrder || 0],
    );

    return NextResponse.json({ id: photoId, courtId, url, caption: caption || "", sortOrder: sortOrder || 0 }, { status: 201 });
  } catch (error) {
    console.error("[Photos POST] Error:", error);
    return NextResponse.json({ error: "Gagal menambah foto" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courtId } = await params;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json({ error: "photoId wajib diisi" }, { status: 400 });
    }

    await pool.query(
      "DELETE FROM court_photos WHERE id = $1 AND court_id = $2",
      [photoId, courtId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Photos DELETE] Error:", error);
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}
