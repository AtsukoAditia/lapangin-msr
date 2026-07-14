"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  subject: string;
  status: string;
  last_message: string;
  unread_count: number;
  created_at: string;
  last_message_at: string;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function SupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadConversations = () => {
    fetch("/api/customer/support")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.conversations) setConversations(d.conversations); })
      .finally(() => setLoading(false));
  };

  const loadMessages = (convId: string) => {
    fetch(`/api/customer/support?id=${convId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.messages) setMessages(d.messages);
        if (d?.conversation) setActiveConv(d.conversation);
      });
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeConv) return;
    loadMessages(activeConv.id);
    const interval = setInterval(() => loadMessages(activeConv.id), 5000);
    return () => clearInterval(interval);
  }, [activeConv?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/customer/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(activeConv ? { conversationId: activeConv.id } : { subject }),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (data.success || data.conversationId) {
        setMessage("");
        if (!activeConv && data.conversationId) {
          setActiveConv({ id: data.conversationId, subject: subject || "Bantuan", status: "open", last_message: message, unread_count: 0, created_at: new Date().toISOString(), last_message_at: new Date().toISOString() });
          setShowNew(false);
        }
        loadConversations();
        if (activeConv) loadMessages(activeConv.id);
        else if (data.conversationId) loadMessages(data.conversationId);
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/profile" className="text-emerald-600 text-sm hover:underline">← Profil</Link>
            <h1 className="text-lg font-bold mt-1">Bantuan & Support</h1>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            {showNew ? "×" : "+ Baru"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* New Conversation Form */}
        {showNew && (
          <div className="bg-white rounded-xl p-4 shadow-sm border mb-4">
            <input
              type="text"
              placeholder="Subjek (opsional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
            />
            <textarea
              placeholder="Tulis pesan Anda..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg mb-2 text-sm resize-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        )}

        {/* Conversation List */}
        <div className="space-y-2">
          {conversations.length === 0 && !showNew ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-medium">Belum ada percakapan</p>
              <p className="text-sm mt-1">Klik "+ Baru" untuk memulai chat dengan tim support</p>
            </div>
          ) : conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveConv(conv); setShowNew(false); }}
              className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition ${activeConv?.id === conv.id ? "border-emerald-400 ring-2 ring-emerald-100" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{conv.subject || "Bantuan"}</p>
                  <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                </div>
                <div className="flex flex-col items-end ml-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${conv.status === "open" ? "bg-green-100 text-green-700" : conv.status === "answered" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                    {conv.status === "open" ? "Open" : conv.status === "answered" ? "Dibalas" : "Tutup"}
                  </span>
                  {Number(conv.unread_count) > 0 && (
                    <span className="mt-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Chat */}
        {activeConv && (
          <div className="bg-white rounded-xl shadow-sm border mt-4 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="font-semibold text-sm">{activeConv.subject || "Percakapan"}</p>
              <p className="text-xs text-gray-400">
                {new Date(activeConv.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                    msg.sender_type === "customer"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_type === "customer" ? "text-emerald-200" : "text-gray-400"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t flex gap-2">
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
