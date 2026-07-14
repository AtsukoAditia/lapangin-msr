"use client";

import { useEffect, useState, useRef } from "react";

interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  status: string;
  unread_count: number;
  last_message: string;
  created_at: string;
  last_message_at: string;
}

interface Message {
  id: string;
  sender_type: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = () => {
    fetch(`/api/admin/support?status=${statusFilter}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.conversations) setConversations(d.conversations); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadConversations(); }, [statusFilter]);

  const loadMessages = (convId: string) => {
    fetch(`/api/admin/support?id=${convId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.messages) setMessages(d.messages);
      });
  };

  useEffect(() => {
    if (!activeConv) return;
    loadMessages(activeConv.id);
    const interval = setInterval(() => loadMessages(activeConv.id), 5000);
    return () => clearInterval(interval);
  }, [activeConv?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async () => {
    if (!reply.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.id, message: reply.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        loadMessages(activeConv.id);
        loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!activeConv) return;
    await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeConv.id, action: "close" }),
    });
    setActiveConv(null);
    loadConversations();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">💬 Support Center</h1>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setActiveConv(null); setLoading(true); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex h-[calc(100vh-130px)]">
        {/* Conversation List */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Tidak ada percakapan</div>
          ) : conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveConv(conv); setMessages([]); }}
              className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${activeConv?.id === conv.id ? "bg-emerald-50 border-l-4 border-emerald-500" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm truncate">{conv.customer_name || "Unknown"}</p>
                {Number(conv.unread_count) > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{conv.unread_count}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.subject || conv.last_message}</p>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{activeConv.customer_name}</p>
                  <p className="text-xs text-gray-500">{activeConv.customer_email} • {activeConv.subject || "Bantuan"}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Tutup
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                      msg.sender_type === "admin" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_type === "admin" ? "text-emerald-200" : "text-gray-400"}`}>
                        {new Date(msg.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik balasan..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleReply())}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Balas
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Pilih percakapan untuk melihat pesan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
