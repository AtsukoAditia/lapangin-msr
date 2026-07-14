"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/config/i18n";

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const toggle = () => {
    const next: Locale = locale === "id" ? "en" : "id";
    setLocale(next);
    localStorage.setItem("locale", next);
    document.documentElement.lang = next;
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50 transition"
      title="Switch Language"
    >
      {locale === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
    </button>
  );
}
