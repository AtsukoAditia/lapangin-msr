import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseAdapter } from "@/lib/adapters";

export async function GET() {
  try {
    const adapter = getDatabaseAdapter();
    const courts = await adapter.getAllCourts();
    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lapangan" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...input } = body as { id?: string; [key: string]: unknown };

    if (!id) {
      return NextResponse.json(
        { error: "id lapangan wajib diisi" },
        { status: 400 },
      );
    }

    const adapter = getDatabaseAdapter();
    const court = await adapter.updateCourt(id, input);
    return NextResponse.json({ court });
  } catch (error) {
    console.error("Error updating court:", error);
    const message =
      error instanceof Error ? error.message : "Gagal update lapangan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}