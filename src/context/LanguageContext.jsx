import { createContext, useContext, useEffect, useMemo, useState,useCallback } from "react";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import useLocalStorage from "../hooks/useLocalStorage";
import content from "../data/content.json";
import { localize } from "../utils/localize";
import api from "../utils/apiClient";
import { env, isLanguageApiEnabled, logError } from "../utils/env";

const LanguageContext = createContext(null);

const LANGUAGES = new Set(["tr", "en"]);
const isValidLang = (value) => LANGUAGES.has(value);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useLocalStorage("lang", "tr", isValidLang);
  const [status, setStatus] = useState("idle");
  const t = useMemo(() => localize(content, lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

const changeLanguage = useCallback(async (nextLang) => {
  // API yapılandırılmamışsa ağa hiç çıkma: dil zaten tamamen istemci tarafında
  // değişiyor, istek yalnızca "haber verme" amaçlıydı.
  if (!isLanguageApiEnabled) {
    setLang(nextLang);
    setStatus("success");
    toast.success(
      nextLang === "tr" ? "Dil Türkçe olarak güncellendi" : "Language updated to English"
    );
    return;
  }

  setStatus("loading");
  try {
    await api.post(env.apiLanguageEndpoint, { language: nextLang });
    setStatus("success");
    toast.success(
      nextLang === "tr" ? "Dil Türkçe olarak güncellendi" : "Language updated to English"
    );
  } catch (error) {
    // Stack trace sadece development'ta konsola düşer.
    logError("Dil değişimi API isteği başarısız oldu:", error);
    setStatus("error");

    const timedOut = isAxiosError(error) && error.code === "ECONNABORTED";
    toast.error(
      nextLang === "tr"
        ? timedOut
          ? "Sunucu yanıt vermedi, dil yine de değiştirildi"
          : "Dil sunucuya bildirilemedi, dil yine de değiştirildi"
        : timedOut
          ? "The server did not respond, language changed anyway"
          : "Couldn't notify the server, language changed anyway"
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
