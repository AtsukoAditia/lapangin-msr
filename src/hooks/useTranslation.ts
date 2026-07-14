import { useState, useEffect } from "react";
import { t as translate, type Locale } from "@/config/i18n";

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  return { t: (key: string) => translate(key, locale), locale, setLocale };
}
