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

  const configs = venues.map((v) => ({
    venueId: v.id,
    venueName: v.name,
    rainDiscountConfig: (v as unknown as Record<string, unknown>).rainDiscountConfig || { enabled: false },
  }));

  return NextResponse.json({ configs });
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_TOKEN_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { venueId, config } = body;

  if (!venueId || !config) {
    return NextResponse.json({ error: "venueId dan config wajib diisi" }, { status: 400 });
  }

  // Validate config structure
  const validLevels = ["light", "moderate", "heavy"];
  if (config.enabled && config.levels) {
    for (const level of validLevels) {
      const l = config.levels[level];
      if (!l || typeof l.discountPercent !== "number" || l.discountPercent < 0 || l.discountPercent > 50) {
        return NextResponse.json({
          error: `Diskon ${level} harus antara 0-50%`,
        }, { status: 400 });
      }
    }
  }

  const adapter = getDatabaseAdapter();
  await adapter.updateVenueConfig(venueId, { rainDiscountConfig: config });

  return NextResponse.json({ success: true, config });
}
