import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getDatabaseAdapter } from "@/lib/adapters";

async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session || session.role !== "customer") return null;
  return session;
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adapter = getDatabaseAdapter();
    const venues = await adapter.getCustomerFavorites(session.userId);
    return NextResponse.json({ success: true, data: venues });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json({ error: "Gagal mengambil data favorit" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { venueId } = await request.json();
    if (!venueId) {
      return NextResponse.json({ error: "venueId diperlukan" }, { status: 400 });
    }

    const adapter = getDatabaseAdapter();
    await adapter.addFavorite(session.userId, venueId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json({ error: "Gagal menambahkan favorit" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { venueId } = await request.json();
    if (!venueId) {
      return NextResponse.json({ error: "venueId diperlukan" }, { status: 400 });
    }

    const adapter = getDatabaseAdapter();
    await adapter.removeFavorite(session.userId, venueId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json({ error: "Gagal menghapus favorit" }, { status: 500 });
  }
}
