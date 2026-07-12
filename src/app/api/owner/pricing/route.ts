import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { verifyToken, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adapter = getDatabaseAdapter();
  const venues = await adapter.getVenuesByOwner(session.userId);
  const courts: Array<{ id: string; name: string; venueId: string; basePrice: number }> = [];
  const allRules: Array<{ id: string; courtId: string; dayType: string; startTime: string; endTime: string; pricePerHour: number; priority: number }> = [];

  for (const v of venues) {
    const c = await adapter.getCourtsByVenue(v.id);
    courts.push(...c);
    for (const court of c) {
      const rules = await adapter.getPricingRules(court.id);
      allRules.push(...rules);
    }
  }

  // Also get holidays
  const holidays = await adapter.getHolidays();

  return NextResponse.json({ venues, courts, pricingRules: allRules, holidays });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { courtId, dayType, startTime, endTime, pricePerHour } = body;

  if (!courtId || !dayType || !startTime || !endTime || !pricePerHour) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  if (pricePerHour < 0) {
    return NextResponse.json({ error: "Harga tidak boleh negatif" }, { status: 400 });
  }

  const adapter = getDatabaseAdapter();
  const rule = await adapter.createPricingRule({
    courtId,
    dayType,
    startTime,
    endTime,
    pricePerHour,
    priority: dayType === "holiday" ? 10 : dayType === "weekend" ? 5 : 1,
    isActive: true,
  });

  return NextResponse.json({ success: true, rule });
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, pricePerHour, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
  }

  const adapter = getDatabaseAdapter();
  await adapter.updatePricingRule(id, { pricePerHour, isActive });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
  }

  const adapter = getDatabaseAdapter();
  await adapter.deletePricingRule(id);

  return NextResponse.json({ success: true });
}
