import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: [],
    message: "Booking API placeholder",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      message: "Create booking placeholder. Connect this route to BookingService.",
    },
    { status: 201 },
  );
}
