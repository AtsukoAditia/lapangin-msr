import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.role !== "owner" || !session.ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adapter = getDatabaseAdapter();
    const venues = await adapter.getVenuesByOwner(session.ownerId);
    return NextResponse.json({ venues });
  } catch (error) {
    console.error("Owner venues GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data venue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.role !== "owner" || !session.ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, areaId, phone, description, facilities, openTime, closeTime } = body;

    if (!name || !address) {
      return NextResponse.json({ error: "name dan address wajib diisi" }, { status: 400 });
    }

    const id = `venue-${Date.now()}`;
    const slug = slugify(name);

    await pool.query(
      `INSERT INTO venues (id, name, slug, address, area_id, phone, description, facilities, open_time, close_time, owner_id, approval_status, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending_review', true)`,
      [id, name, slug, address, areaId || null, phone || null, description || null, facilities ? JSON.stringify(facilities) : null, openTime || null, closeTime || null, session.ownerId]
    );

    return NextResponse.json({ success: true, id, slug }, { status: 201 });
  } catch (error) {
    console.error("Owner venues POST error:", error);
    return NextResponse.json({ error: "Gagal membuat venue" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.role !== "owner" || !session.ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, address, areaId, phone, description, facilities, openTime, closeTime } = body;

    if (!id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }

    // Verify ownership
    const adapter = getDatabaseAdapter();
    const venues = await adapter.getVenuesByOwner(session.ownerId);
    const owned = venues.find((v) => v.id === id);
    if (!owned) {
      return NextResponse.json({ error: "Venue tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    const slug = name ? slugify(name) : undefined;

    await pool.query(
      `UPDATE venues SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        address = COALESCE($4, address),
        area_id = COALESCE($5, area_id),
        phone = COALESCE($6, phone),
        description = COALESCE($7, description),
        facilities = COALESCE($8, facilities),
        open_time = COALESCE($9, open_time),
        close_time = COALESCE($10, close_time),
        updated_at = NOW()
       WHERE id = $1`,
      [id, name || null, slug || null, address || null, areaId || null, phone || null, description || null, facilities ? JSON.stringify(facilities) : null, openTime || null, closeTime || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Owner venues PUT error:", error);
    return NextResponse.json({ error: "Gagal mengupdate venue" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.role !== "owner" || !session.ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }

    // Verify ownership
    const adapter = getDatabaseAdapter();
    const venues = await adapter.getVenuesByOwner(session.ownerId);
    const owned = venues.find((v) => v.id === id);
    if (!owned) {
      return NextResponse.json({ error: "Venue tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    await pool.query("UPDATE venues SET is_active = false, updated_at = NOW() WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Owner venues DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus venue" }, { status: 500 });
  }
}
