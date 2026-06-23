import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();
    const rules = await adapter.getAllPricingRules();
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data aturan harga" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courtId, dayType, startTime, endTime, pricePerHour, priority } =
      body as {
        courtId?: string;
        dayType?: string;
        startTime?: string;
        endTime?: string;
        pricePerHour?: number;
        priority?: number;
      };

    if (!courtId || !dayType || !startTime || !endTime || !pricePerHour) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    const rule = await adapter.createPricingRule({
      courtId,
      dayType: dayType as "weekday" | "weekend" | "holiday" | "all",
      startTime,
      endTime,
      pricePerHour,
      priority: priority ?? 0,
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat aturan harga";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...input } = body as { id?: string; [key: string]: unknown };

    if (!id) {
      return NextResponse.json(
        { error: "id aturan harga wajib diisi" },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    const rule = await adapter.updatePricingRule(id, input);
    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    const message =
      error instanceof Error ? error.message : "Gagal update aturan harga";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id aturan harga wajib diisi" },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    await adapter.deletePricingRule(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    const message =
      error instanceof Error ? error.message : "Gagal hapus aturan harga";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}