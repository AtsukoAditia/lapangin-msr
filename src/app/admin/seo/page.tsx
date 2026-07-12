"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  structuredData: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
  analyticsId: string;
  gtmId: string;
}

const DEFAULT_SEO: SeoSettings = {
  title: "Lapangin — Booking Lapangan Olahraga Online",
  description: "Booking lapangan futsal, badminton, basket, dan olahraga lainnya secara online. Cek jadwal, harga, dan lokasi terdekat.",
  keywords: "booking lapangan, sewa lapangan, futsal, badminton, basket, olahraga, lapangan online",
  ogImage: "",
  ogTitle: "",
  ogDescription: "",
  canonicalUrl: "",
  structuredData: "",
  robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dashboard/\nDisallow: /api/\n\nSitemap: https://lapangin.id/sitemap.xml",
  sitemapEnabled: true,
  analyticsId: "",
  gtmId: "",
};

export default function AdminSeoPage() {
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSeo((prev) => ({ ...prev, ...data.settings }));
      })
      .catch(() => {});
  }, []);

  function handleChange(key: keyof SeoSettings, value: string | boolean) {
    setSeo((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seo),
      });
      if (res.ok) setSaved(true);
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">SEO & Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola meta tags, SEO, dan analytics website</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : saved ? "✅ Tersimpan" : "💾 Simpan"}
          </button>
        </div>

        {/* Meta Tags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🏷️ Meta Tags</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={seo.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <p className="text-xs text-gray-400 mt-1">{seo.title.length}/60 karakter</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={seo.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <p className="text-xs text-gray-400 mt-1">{seo.description.length}/160 karakter</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input
                type="text"
                value={seo.keywords}
                onChange={(e) => handleChange("keywords", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input
                type="text"
                value={seo.canonicalUrl}
                onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="https://lapangin.id"
              />
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📱 Open Graph (Social Media)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => handleChange("ogTitle", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Kosongkan untuk pakai title biasa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
              <textarea
                value={seo.ogDescription}
                onChange={(e) => handleChange("ogDescription", e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Kosongkan untuk pakai description biasa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
              <input
                type="text"
                value={seo.ogImage}
                onChange={(e) => handleChange("ogImage", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="https://lapangin.id/og-image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Robots & Sitemap */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 Robots & Sitemap</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">robots.txt</label>
              <textarea
                value={seo.robotsTxt}
                onChange={(e) => handleChange("robotsTxt", e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sitemap"
                checked={seo.sitemapEnabled}
                onChange={(e) => handleChange("sitemapEnabled", e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="sitemap" className="text-sm text-gray-700">
                Aktifkan sitemap.xml
              </label>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={seo.analyticsId}
                onChange={(e) => handleChange("analyticsId", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Tag Manager ID</label>
              <input
                type="text"
                value={seo.gtmId}
                onChange={(e) => handleChange("gtmId", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Structured Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Structured Data (JSON-LD)</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom JSON-LD</label>
            <textarea
              value={seo.structuredData}
              onChange={(e) => handleChange("structuredData", e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder='{"@context":"https://schema.org","@type":"LocalBusiness",...}'
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
