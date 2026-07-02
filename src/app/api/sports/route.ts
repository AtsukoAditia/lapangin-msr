import { NextResponse } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();
    const sports = await adapter.getSports();
    return NextResponse.json({ sports });
  } catch (error) {
    console.error("Error fetching sports:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data olahraga." },
      { status: 500 },
    );
  }
}