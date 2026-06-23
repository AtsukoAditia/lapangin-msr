import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import { AvailabilityService } from "@/lib/services/availability-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const date = searchParams.get("date");

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "Parameter courtId dan date wajib diisi." },
        { status: 400 }
      );
    }

    const adapter = getDatabaseAdapter();
    const service = new AvailabilityService(adapter);

    const slots = await service.getAvailableSlots({ courtId, date });

    return NextResponse.json({
      data: slots,
      total: slots.length,
      available: slots.filter((s) => s.isAvailable).length,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data ketersediaan." },
      { status: 500 }
    );
  }
}