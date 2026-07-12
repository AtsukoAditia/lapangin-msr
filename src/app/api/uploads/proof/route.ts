import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getClientIP, checkRateLimit, bookingLimiter } from "@/lib/security";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "payments");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File diperlukan" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File maksimal 5MB" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau PDF" },
        { status: 400 },
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = file.name.split(".").pop() || (file.type === "application/pdf" ? "pdf" : "jpg");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/payments/${filename}`;

    return NextResponse.json({ success: true, url, filename, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal upload file" }, { status: 500 });
  }
}
