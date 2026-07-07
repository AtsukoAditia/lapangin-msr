"use client";

import { useMemo, useState } from "react";
import type { Area } from "@/lib/types/domain";

interface AreaSelectProps {
  areas: Area[];
  selectedAreaId?: string;
  onAreaChange?: (areaId: string | null) => void;
}

export default function AreaSelect({ areas, selectedAreaId, onAreaChange }: AreaSelectProps) {
  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  // Internal cascading state (tracks user intermediate selections)
  const [localProvince, setLocalProvince] = useState("");
  const [localCity, setLocalCity] = useState("");

  // Use selectedArea values when set, otherwise fall back to local state
  const province = selectedArea?.province || localProvince;
  const city = selectedArea?.city || localCity;

  const provinces = useMemo(
    () => [...new Set(areas.map((a) => a.province))].sort(),
    [areas]
  );

  const cities = useMemo(() => {
    if (!province) return [];
    return [...new Set(areas.filter((a) => a.province === province).map((a) => a.city))].sort();
  }, [areas, province]);

  const daerahs = useMemo(() => {
    if (!province || !city) return [];
    const filtered = areas.filter((a) => a.province === province && a.city === city);
    return filtered.map((a) => ({ id: a.id, label: a.district || a.village || a.label || a.city }));
  }, [areas, province, city]);

  function handleProvinceChange(value: string) {
    setLocalProvince(value);
    setLocalCity("");
    onAreaChange?.(null);
  }

  function handleCityChange(value: string) {
    setLocalCity(value);
    onAreaChange?.(null);
  }

  function handleDaerahChange(value: string) {
    onAreaChange?.(value || null);
  }

  const selectClass = (disabled: boolean) =>
    `w-full px-3 py-2.5 rounded-lg text-sm font-medium border appearance-none cursor-pointer transition-all duration-200 ${
      disabled
        ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
    }`;

  const chevronStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 0.75rem center",
    backgroundRepeat: "no-repeat" as const,
    backgroundSize: "1.25em 1.25em",
    paddingRight: "2.5rem",
  };

  const iconClass = "w-3.5 h-3.5 text-emerald-600";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Provinsi */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
            <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Provinsi
          </label>
          <select
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={selectClass(false)}
            style={chevronStyle}
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Kota */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
            <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Kota
          </label>
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!province}
            className={selectClass(!province)}
            style={chevronStyle}
          >
            <option value="">{province ? "Pilih Kota" : "Pilih provinsi dulu"}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Daerah */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
            <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Daerah
          </label>
          <select
            value={selectedAreaId || ""}
            onChange={(e) => handleDaerahChange(e.target.value)}
            disabled={!city}
            className={selectClass(!city)}
            style={chevronStyle}
          >
            <option value="">{city ? "Pilih Daerah" : "Pilih kota dulu"}</option>
            {daerahs.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
