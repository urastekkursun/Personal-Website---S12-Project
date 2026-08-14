import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useLocalStorage from "../hooks/useLocalStorage";
import content from "../data/content.json";
import { localize } from "../utils/localize";
import { postJson, isTimeoutError } from "../utils/apiClient";
import { env, isLanguageApiEnabled, logError } from "../utils/env";
import { isValidLang, swapLang, localePath, parsePath } from "../routes";

const LanguageContext = createContext(null);

/**
 * Dilin TEK doğruluk kaynağı URL'dir; `lang` prop'u route tanımından gelir.
 *
 * localStorage artık dili BELİRLEMİYOR, yalnızca yazılıyor. Sebebi somut:
 * daha önce İngilizce konuşan birine gönderilen `/` linki, tarayıcısında
 * kayıtlı `lang: "tr"` yüzünden Türkçe açılıyordu. Artık `/en` her zaman
 * İngilizce, `/` her zaman Türkçe.
 */
export function LanguageProvider({ lang, children }) {
  const { pathname } = useLocation();
  const t = useMemo(() => localize(content, lang), [lang]);

  // Yalnızca yazılıyor: okunan değerin dil seçimine etkisi yok.
  const [, persistLang] = useLocalStorage("lang", lang, isValidLang);
  useEffect(() => {
    persistLang(lang);
  }, [lang, persistLang]);

  // Başlık/açıklama/OG etiketleri BURADA yönetilmiyor: her sayfa kendi
  // meta'sını `usePageMeta` ile veriyor. Tek merkezden yazıldığında vaka
  // sayfaları da ana sayfanın başlığını alıyordu.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Dil değişimi bir NAVİGASYON olduğu için içerik anında değişiyor; API'ye
  // haber verme işi tamamen arka planda, ilk render'da tetiklenmeden.
  const previousLang = useRef(lang);
  useEffect(() => {
    if (previousLang.current === lang) return;
    previousLang.current = lang;

    const success =
      lang === "tr" ? "Dil Türkçe olarak güncellendi" : "Language updated to English";

    if (!isLanguageApiEnabled) {
      toast.success(success);
      return;
    }

    let cancelled = false;
    postJson(env.apiLanguageEndpoint, { language: lang })
      .then(() => {
        if (!cancelled) toast.success(success);
      })
      .catch((error) => {
        if (cancelled) return;
        // Stack trace sadece development'ta konsola düşer.
        logError("Dil değişimi API isteği başarısız oldu:", error);
        const timedOut = isTimeoutError(error);
        toast.error(
          lang === "tr"
            ? timedOut
              ? "Sunucu yanıt vermedi, dil yine de değiştirildi"
              : "Dil sunucuya bildirilemedi, dil yine de değiştirildi"
            : timedOut
              ? "The server did not respond, language changed anyway"
              : "Couldn't notify the server, language changed anyway"
        );
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const value = useMemo(() => {
    const otherLang = lang === "tr" ? "en" : "tr";
    return {
      lang,
      t,
      otherLang,
      // Aynı sayfanın diğer dildeki adresi — 404'te ve ileride vaka
      // sayfalarında da doğru hedefi verir.
      switchPath: swapLang(pathname, otherLang),
      // Uygulama içi linkler bunu kullanmalı: `path("/case/difod")` aktif
      // dilin ön ekini ve segment karşılığını kendisi ekler.
      path: (rest) => localePath(rest, lang),
      // Canonical/OG adresleri BURADAN alınmalı, `useLocation()`'dan değil:
      // `<Routes location={...}>` alt ağaca dil ön eki SİLİNMİŞ bir konum
      // veriyor, o yüzden sayfa içindeki bir bileşen gerçek adresi göremez.
      // Bu provider `<Routes>`'un dışında olduğu için gerçek konumu görüyor.
      canonicalPath: localePath(parsePath(pathname).rest, lang),
    };
  }, [lang, t, pathname]);

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
