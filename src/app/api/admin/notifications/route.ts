import { NextResponse } from "next/server";
import {
  getNotificationLogs,
  markNotificationRead,
} from "@/lib/services/notification-service";

// GET /api/admin/notifications?bookingId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId") || undefined;

    const logs = await getNotificationLogs(bookingId);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[API] GET /admin/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat notifikasi" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/notifications — mark as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID notifikasi diperlukan" },
        { status: 400 },
      );
    }

    const log = await markNotificationRead(id);
    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("[API] PATCH /admin/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui notifikasi" },
      { status: 500 },
    );
  }
}