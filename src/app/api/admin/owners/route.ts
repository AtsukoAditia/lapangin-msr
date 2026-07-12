import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();
    const owners = await adapter.getVenueOwners();
    return NextResponse.json({ owners });
  } catch (error) {
    console.error("Error fetching owners:", error);
    return NextResponse.json({ error: "Gagal memuat data owner" }, { status: 500 });
  }
}
