"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Court {
  id: string;
  name: string;
  venueId: string;
}

interface CourtPhoto {
  id: string;
  courtId: string;
  url: string;
  caption: string;
  sortOrder: number;
}

export default function VenuePhotosPage() {
  const params = useParams();
  const venueId = params?.id as string;

  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [photos, setPhotos] = useState<CourtPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load courts for this venue
  useEffect(() => {
    if (!venueId) return;
    fetch(`/api/courts?venueId=${venueId}`)
      .then((r) => r.json())
      .then((d) => {
        const courtList = d.courts ?? [];
        setCourts(courtList);
        if (courtList.length > 0) setSelectedCourtId(courtList[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [venueId]);

  // Load photos for selected court
  const loadPhotos = useCallback(async () => {
    if (!selectedCourtId) return;
    try {
      const res = await fetch(`/api/courts/${selectedCourtId}/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos ?? []);
      }
    } catch {
      // ignore
    }
  }, [selectedCourtId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedCourtId) return;

    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert to base64
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      // Upload via general uploads endpoint
      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          mimeType: file.type,
          filename: file.name,
        }),
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal upload file.");
      }

      const { url } = await uploadRes.json();

      // Add photo to court
      const photoRes = await fetch(`/api/courts/${selectedCourtId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption }),
      });

      if (!photoRes.ok) {
        const data = await photoRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal menambahkan foto.");
      }

      setCaption("");
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload foto.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(photoId: string) {
    if (!confirm("Hapus foto ini?")) return;

    try {
      const res = await fetch(
        `/api/courts/${selectedCourtId}/photos?photoId=${photoId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal menghapus foto.");
      }

      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus foto.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Foto Lapangan</h1>
        <div className="bg-white rounded-2xl p-12 text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">Foto Lapangan</h1>
          <Link href="/dashboard/venues" className="text-emerald-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-5xl mb-4">🏟️</p>
          <p className="text-lg font-bold text-gray-700">Venue belum punya lapangan</p>
          <p className="text-gray-500 text-sm mt-1">Tambahkan lapangan terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📸 Foto Lapangan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola foto untuk setiap lapangan</p>
        </div>
        <Link href="/dashboard/venues" className="text-emerald-600 text-sm font-medium hover:underline">
          ← Kembali
        </Link>
      </div>

      {/* Court Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Lapangan</label>
        <select
          value={selectedCourtId}
          onChange={(e) => setSelectedCourtId(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
        >
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3">Upload Foto Baru</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (opsional)"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          />
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              {uploading ? (
                <span className="text-sm text-gray-500">Mengupload...</span>
              ) : (
                <>
                  <span className="text-2xl">📷</span>
                  <span className="text-sm font-medium text-gray-700">
                    Pilih foto (max 5MB, format gambar)
                  </span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3">Foto Terupload ({photos.length})</h3>
        {photos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Belum ada foto.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={photo.url}
                  alt={photo.caption || "Foto lapangan"}
                  className="w-full h-32 object-cover"
                />
                {photo.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1.5 truncate">
                    {photo.caption}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
