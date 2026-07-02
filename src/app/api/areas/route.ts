import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  const adapter = await getDatabaseAdapter();
  const areas = await adapter.getAreas();
  return NextResponse.json({ success: true, data: areas });
}