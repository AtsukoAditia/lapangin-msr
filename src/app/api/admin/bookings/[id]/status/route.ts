import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";
import type { Booking } from "@/lib/types/domain";

const VALID_STATUSES: Booking["bookingStatus"][] = [
  "pending",
  "waiting_payment",
  "paid",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
  "no_show",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !VALID_STATUSES.includes(status as Booking["bookingStatus"])) {
      return NextResponse.json(
        { error: `Status tidak valid. Gunakan: ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    const booking = await adapter.updateBookingStatus(
      id,
      status as Booking["bookingStatus"],
    );

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    const message =
      error instanceof Error ? error.message : "Gagal update status booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}