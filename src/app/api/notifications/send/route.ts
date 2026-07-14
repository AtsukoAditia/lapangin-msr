import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_TOKEN_NAME, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Admin-only endpoint
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
    const ownerToken = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    const authToken = adminToken || ownerToken;
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifyToken(authToken);
    if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, title, body, data } = await request.json();

    if (!token || !title) {
      return NextResponse.json({ error: "token dan title wajib diisi." }, { status: 400 });
    }

    // Use Firebase Admin SDK or REST API to send
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const serverKey = process.env.FIREBASE_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json({ error: "Push notifications not configured on server." }, { status: 500 });
    }

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serverKey}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title,
              body: body || "",
            },
            data: data || {},
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("FCM send error:", errorData);
      return NextResponse.json({ error: "Gagal mengirim notifikasi." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengirim notifikasi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
