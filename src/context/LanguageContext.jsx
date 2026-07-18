import { createContext, useContext, useEffect, useMemo, useState,useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useLocalStorage from "../hooks/useLocalStorage";
import content from "../data/content.json";
import { localize } from "../utils/localize";

const LanguageContext = createContext(null);

// reqres.in için merkezi bir axios instance'ı.
// Görev talimatındaki gibi dil değişiminde POST atıp,
// dış servisle iletişimi göstermek amacıyla kullanılıyor.
const api = axios.create({
  baseURL: "https://reqres.in/api",
  headers: { "x-api-key": "reqres-free-v1" },
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useLocalStorage("lang", "tr");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  // content.json TEK dosya; her alan { tr, en } tutuyor.
  // localize() bu ağacı, aktif dile göre düz string'lere indirger.
  // Dil değiştiğinde sadece bu memo yeniden hesaplanır, veri dosyası tek.
  const t = useMemo(() => localize(content, lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

const changeLanguage = useCallback(async (nextLang) => {
  setStatus("loading");
  try {
    await api.post("/workintech", { language: nextLang });
    setStatus("success");
    toast.success(
      nextLang === "tr" ? "Dil Türkçe olarak güncellendi" : "Language updated to English"
    );
  } catch (error) {
    console.error("Dil değişimi API isteği başarısız oldu:", error);
    setStatus("error");
    toast.error(
      nextLang === "tr"
        ? "Dil güncellenemedi, tekrar deneyin"
        : "Couldn't update language, please try again"
    );
  } finally {
    setLang(nextLang);
  }
}, [setLang]);
const toggleLanguage = useCallback(
  () => changeLanguage(lang === "tr" ? "en" : "tr"),
  [lang, changeLanguage]
);

const value = useMemo(
  () => ({ lang, t, status, toggleLanguage }),
  [lang, t, status, toggleLanguage]
);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage, LanguageProvider içinde kullanılmalı");
  }
  return context;
}
