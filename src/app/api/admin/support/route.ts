import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { cookies } from "next/headers";
import { verifyToken, ADMIN_TOKEN_NAME } from "@/lib/auth/jwt";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };
const pool = globalForPg.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (!globalForPg.__pgPool) globalForPg.__pgPool = pool;

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session || (session.role !== "admin" && session.role !== "super_admin" && session.role !== "staff")) return null;
  return session;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    if (id) {
      // Get single conversation with messages
      const { rows: conv } = await pool.query(
        `SELECT sc.*, c.name as customer_name, c.email as customer_email
         FROM support_conversations sc
         LEFT JOIN customers c ON c.id = sc.customer_id
         WHERE sc.id = $1`,
        [id],
      );
      if (conv.length === 0) {
        return NextResponse.json({ error: "Percakapan tidak ditemukan" }, { status: 404 });
      }
      const { rows: messages } = await pool.query(
        "SELECT * FROM support_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
        [id],
      );
      // Mark admin messages as read
      await pool.query(
        "UPDATE support_messages SET is_read = true WHERE conversation_id = $1 AND sender_type = 'customer' AND is_read = false",
        [id],
      );
      return NextResponse.json({ conversation: conv[0], messages });
    }

    // List all conversations
    const statusFilter = status || "open";
    const { rows } = await pool.query(
      `SELECT sc.*,
        c.name as customer_name, c.email as customer_email,
        (SELECT COUNT(*) FROM support_messages sm WHERE sm.conversation_id = sc.id AND sm.is_read = false AND sm.sender_type = 'customer') as unread_count,
        (SELECT sm.message FROM support_messages sm WHERE sm.conversation_id = sc.id ORDER BY sm.created_at DESC LIMIT 1) as last_message
       FROM support_conversations sc
       LEFT JOIN customers c ON c.id = sc.customer_id
       WHERE sc.status = $1
       ORDER BY sc.last_message_at DESC`,
      [statusFilter],
    );

    return NextResponse.json({ conversations: rows });
  } catch (error) {
    console.error("Admin support GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, message, action } = await request.json();

    if (action === "close" && conversationId) {
      await pool.query(
        "UPDATE support_conversations SET status = 'closed' WHERE id = $1",
        [conversationId],
      );
      return NextResponse.json({ success: true });
    }

    if (!conversationId || !message?.trim()) {
      return NextResponse.json({ error: "conversationId dan message wajib diisi" }, { status: 400 });
    }

    const msgId = `sm-${Date.now()}`;
    await pool.query(
      "INSERT INTO support_messages (id, conversation_id, sender_type, sender_id, message) VALUES ($1, $2, 'admin', $3, $4)",
      [msgId, conversationId, session.userId || "admin", message.trim()],
    );
    await pool.query(
      "UPDATE support_conversations SET last_message_at = NOW(), status = 'answered' WHERE id = $1",
      [conversationId],
    );

    return NextResponse.json({ success: true, messageId: msgId });
  } catch (error) {
    console.error("Admin support POST error:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
