import { NextRequest, NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json() as { status?: string };

    if (!status || !["active", "rejected", "suspended"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid. Gunakan: active, rejected, suspended" },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    const owner = await adapter.updateVenueOwnerStatus(id, status as "active" | "rejected" | "suspended");

    return NextResponse.json({ success: true, owner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal update status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
