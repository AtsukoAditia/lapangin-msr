"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface CmsPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
}

const AVAILABLE_PAGES = [
  { slug: "tentang", label: "Tentang", icon: "ℹ️", description: "Halaman tentang Lapangin" },
  { slug: "kebijakan", label: "Kebijakan & Privasi", icon: "🔒", description: "Kebijakan privasi pengguna" },
  { slug: "syarat", label: "Syarat & Ketentuan", icon: "📋", description: "Syarat ketentuan penggunaan" },
  { slug: "kontak", label: "Kontak", icon: "📞", description: "Informasi kontak" },
];

export default function AdminCmsPage() {
  const [pages, setPages] = useState<Record<string, CmsPage>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editMeta, setEditMeta] = useState({ metaTitle: "", metaDescription: "", ogTitle: "", ogDescription: "", ogImage: "" });

  useEffect(() => {
    fetch("/api/admin/cms")
      .then((r) => r.json())
      .then((data) => setPages(data.pages || {}))
      .catch(() => {});
  }, []);

  function startEditing(slug: string) {
    const page = pages[slug] || { content: "", metaTitle: "", metaDescription: "", ogTitle: "", ogDescription: "", ogImage: "" };
    setEditing(slug);
    setEditContent(page.content || "");
    setEditMeta({
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      ogTitle: page.ogTitle || "",
      ogDescription: page.ogDescription || "",
      ogImage: page.ogImage || "",
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editing,
          ...editMeta,
          content: editContent,
          isPublished: true,
        }),
      });
      if (res.ok) {
        setSaved(true);
        const data = await fetch("/api/admin/cms").then((r) => r.json());
        setPages(data.pages || {});
      }
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">CMS — Halaman Statis</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola konten halaman Tentang, Kebijakan, Syarat, dan Kontak</p>
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_PAGES.map((p) => {
              const page = pages[p.slug];
              const hasContent = !!page?.content;
              return (
                <button
                  key={p.slug}
                  onClick={() => startEditing(p.slug)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{p.label}</h3>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${hasContent ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {hasContent ? "✅ Custom" : "📄 Default"}
                    </span>
                  </div>
                  {page?.updatedAt && (
                    <p className="text-xs text-gray-400">Terakhir diubah: {new Date(page.updatedAt).toLocaleDateString("id-ID")}</p>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700 font-medium">
                ← Kembali
              </button>
              <h2 className="text-lg font-bold text-gray-900">
                Edit: {AVAILABLE_PAGES.find((p) => p.slug === editing)?.label}
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : saved ? "✅ Tersimpan" : "💾 Simpan"}
              </button>
            </div>

            {/* SEO Meta */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🏷️ SEO Meta Tags</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={editMeta.metaTitle}
                    onChange={(e) => setEditMeta((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Judul untuk SEO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <input
                    type="text"
                    value={editMeta.metaDescription}
                    onChange={(e) => setEditMeta((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Deskripsi untuk SEO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Title (Social Media)</label>
                  <input
                    type="text"
                    value={editMeta.ogTitle}
                    onChange={(e) => setEditMeta((prev) => ({ ...prev, ogTitle: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Judul untuk share di social media"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                  <input
                    type="text"
                    value={editMeta.ogDescription}
                    onChange={(e) => setEditMeta((prev) => ({ ...prev, ogDescription: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Deskripsi untuk share di social media"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                  <input
                    type="text"
                    value={editMeta.ogImage}
                    onChange={(e) => setEditMeta((prev) => ({ ...prev, ogImage: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="https://lapangin.id/og-image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">📝 Konten Halaman</h3>
              <p className="text-xs text-gray-500 mb-3">Format: Markdown. Gunakan # untuk heading, ## untuk subheading, - untuk list, **teks** untuk bold.</p>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={25}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Tulis konten halaman di sini..."
              />
              <p className="text-xs text-gray-400 mt-2">{editContent.length} karakter</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
