import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_TOKEN_NAME, OWNER_TOKEN_NAME } from "@/lib/auth/jwt";
import { getClientIP, checkRateLimit, bookingLimiter } from "@/lib/security";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimited = await checkRateLimit(bookingLimiter, ip);
    if (rateLimited) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimited.retryAfter} detik.` },
        { status: 429 },
      );
    }

    // Auth required — admin or owner
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
    const ownerToken = cookieStore.get(OWNER_TOKEN_NAME)?.value;
    const token = adminToken || ownerToken;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session || (session.role !== "admin" && session.role !== "super_admin" && session.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file: base64Data, filename: originalName, mimeType } = await request.json();

    if (!base64Data || typeof base64Data !== "string") {
      return NextResponse.json({ error: "file (base64 string) diperlukan" }, { status: 400 });
    }

    // Decode base64
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "File maksimal 5MB" }, { status: 400 });
    }

    // Determine mime type
    const mime = typeof mimeType === "string" && ALLOWED.includes(mimeType) ? mimeType : "image/jpeg";
    const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];

    await mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url, filename, size: buffer.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal upload file" }, { status: 500 });
  }
}
