import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { cookies } from "next/headers";
import { verifyToken, CUSTOMER_TOKEN_NAME } from "@/lib/auth/jwt";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT sc.*,
        (SELECT COUNT(*) FROM support_messages sm WHERE sm.conversation_id = sc.id AND sm.is_read = false AND sm.sender_type = 'admin') as unread_count,
        (SELECT sm.message FROM support_messages sm WHERE sm.conversation_id = sc.id ORDER BY sm.created_at DESC LIMIT 1) as last_message
       FROM support_conversations sc
       WHERE sc.customer_id = $1
       ORDER BY sc.last_message_at DESC`,
      [session.userId],
    );

    return NextResponse.json({ conversations: rows });
  } catch (error) {
    console.error("Support GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message, conversationId, bookingId } = await request.json();

    if (conversationId) {
      // Reply to existing conversation
      if (!message || !message.trim()) {
        return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
      }
      const msgId = `sm-${Date.now()}`;
      await pool.query(
        "INSERT INTO support_messages (id, conversation_id, sender_type, sender_id, message) VALUES ($1, $2, 'customer', $3, $4)",
        [msgId, conversationId, session.userId, message.trim()],
      );
      await pool.query(
        "UPDATE support_conversations SET last_message_at = NOW(), status = 'open' WHERE id = $1",
        [conversationId],
      );
      return NextResponse.json({ success: true, messageId: msgId });
    }

    // Create new conversation
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
    }
    const convId = `sc-${Date.now()}`;
    const msgId = `sm-${Date.now()}-msg`;
    await pool.query(
      "INSERT INTO support_conversations (id, customer_id, booking_id, subject) VALUES ($1, $2, $3, $4)",
      [convId, session.userId, bookingId || null, subject || "Bantuan"],
    );
    await pool.query(
      "INSERT INTO support_messages (id, conversation_id, sender_type, sender_id, message) VALUES ($1, $2, 'customer', $3, $4)",
      [msgId, convId, session.userId, message.trim()],
    );
    return NextResponse.json({ success: true, conversationId: convId }, { status: 201 });
  } catch (error) {
    console.error("Support POST error:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
