import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CMS_FILE = path.join(process.cwd(), "data", "cms-pages.json");

async function ensureDir() {
  await mkdir(path.dirname(CMS_FILE), { recursive: true });
}

async function getPages() {
  try {
    const raw = await readFile(CMS_FILE, "utf-8").catch(() => "{}");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET() {
  const pages = await getPages();
  return NextResponse.json({ pages });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, ...rest } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug wajib diisi" }, { status: 400 });
    }

    await ensureDir();
    const pages = await getPages();
    pages[slug] = {
      ...rest,
      slug,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(CMS_FILE, JSON.stringify(pages, null, 2));
    return NextResponse.json({ success: true, page: pages[slug] });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
