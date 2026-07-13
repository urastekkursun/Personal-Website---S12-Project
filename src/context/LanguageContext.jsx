import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

  const changeLanguage = async (nextLang) => {
    if (nextLang === lang) return;

    const messages = localize(content.toast, nextLang);
    setStatus("loading");

    const toastId = toast.loading(messages.loading);

    try {
      // Dil değişimini dış bir servise (reqres.in) bildiriyoruz.
      await api.post("/workintech", { language: nextLang });
      setStatus("success");
      toast.update(toastId, {
        render: messages.success,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Dil değişimi API isteği başarısız oldu:", error);
      setStatus("error");
      toast.update(toastId, {
        render: messages.error,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLang(nextLang);
    }
  };

  const toggleLanguage = () => changeLanguage(lang === "tr" ? "en" : "tr");

  const value = { lang, t, status, toggleLanguage };

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
