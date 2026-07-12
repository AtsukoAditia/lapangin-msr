import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "seo-settings.json");

async function ensureDir() {
  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
}

export async function GET() {
  try {
    await ensureDir();
    const raw = await readFile(SETTINGS_FILE, "utf-8").catch(() => "{}");
    const settings = JSON.parse(raw);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: {} });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();
    await ensureDir();
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
