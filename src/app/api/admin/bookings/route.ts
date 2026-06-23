import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();
    const bookings = await adapter.getBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data booking" },
      { status: 500 },
    );
  }
}