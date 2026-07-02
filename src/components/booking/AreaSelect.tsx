"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Area } from "@/lib/types/domain";

interface AreaSelectProps {
  areas: Area[];
  selectedAreaId?: string;
}

export default function AreaSelect({ areas, selectedAreaId }: AreaSelectProps) {
  const router = useRouter();

  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  const provinces = useMemo(
    () => [...new Set(areas.map((a) => a.province))].sort(),
    [areas]
  );

  const [currentProvince, currentCity, currentDaerah] = useMemo(() => {
    if (!selectedArea) return ["", "", ""];
    return [selectedArea.province, selectedArea.city, selectedArea.district || selectedArea.village || ""];
  }, [selectedArea]);

  const cities = useMemo(() => {
    if (!currentProvince) return [];
    return [...new Set(areas.filter((a) => a.province === currentProvince).map((a) => a.city))].sort();
  }, [areas, currentProvince]);

  const daerahs = useMemo(() => {
    if (!currentProvince || !currentCity) return [];
    const filtered = areas.filter((a) => a.province === currentProvince && a.city === currentCity);
    return filtered.map((a) => ({ id: a.id, label: a.village || a.district || a.label || a.city }));
  }, [areas, currentProvince, currentCity]);

  function buildUrl(areaId: string | null) {
    return areaId ? `/booking?area=${areaId}` : "/booking";
  }

  function selectProvince(value: string) {
    if (value === currentProvince) return;
    router.push(buildUrl(null));
  }

  function selectCity(value: string) {
    if (value === currentCity) return;
    const firstArea = areas.find((a) => a.province === currentProvince && a.city === value);
    if (firstArea) router.push(buildUrl(firstArea.id));
    else router.push(buildUrl(null));
  }

  function selectDaerah(value: string) {
    if (value === selectedAreaId) return;
    router.push(buildUrl(value || null));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Provinsi */}
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi</label>
        <select
          value={currentProvince}
          onChange={(e) => selectProvince(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Semua Provinsi</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Kota */}
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Kota</label>
        <select
          value={currentCity}
          onChange={(e) => selectCity(e.target.value)}
          disabled={!currentProvince}
          className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">{currentProvince ? "Semua Kota" : "Pilih provinsi"}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Daerah */}
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Daerah</label>
        <select
          value={selectedAreaId && currentDaerah ? selectedAreaId : ""}
          onChange={(e) => selectDaerah(e.target.value)}
          disabled={!currentCity}
          className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">{currentCity ? "Semua Daerah" : "Pilih kota"}</option>
          {daerahs.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}