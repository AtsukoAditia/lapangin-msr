import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adapter = getDatabaseAdapter();
    const booking = await adapter.getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
