import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Sayfa başına başlık/açıklama/canonical/OG etiketlerini günceller.
 *
 * NEDEN SAYFA BAŞINA: Bu iş önce `LanguageContext` içinde tek merkezden
 * yapılıyordu ve site geneli başlığı HER sayfaya yazıyordu — vaka sayfası
 * prerender'dan doğru başlıkla geliyor, React mount olunca üzerine ana
 * sayfanın başlığını basıyordu. Sekmede yanlış başlık, paylaşılan bir vaka
 * linkinde de kafa karışıklığı demekti.
 *
 * Crawler'lar zaten statik HTML'i görür (bkz. scripts/prerender.mjs); bu hook
 * uygulama içinde gezinen gerçek ziyaretçi için tutarlılığı sağlar.
 *
 * Argümanlar bilinçli olarak düz string: obje verilseydi her render'da yeni
 * referans oluşup effect boşuna tetiklenirdi. `title` boşsa hiçbir şey
 * yapılmaz — çağıran taraf henüz veriyi bilmiyordur.
 */
export default function usePageMeta(title, description, ogDescription = description) {
  const { t, canonicalPath } = useLanguage();
  const { siteUrl, locale } = t.meta;

  useEffect(() => {
    if (!title) return;

    // `useLocation()` KULLANILMIYOR: `<Routes location={...}>` alt ağaca dil
    // ön eki silinmiş bir konum veriyor, canonical `/en/case/x` yerine
    // `/case/x` çıkıyordu. Gerçek adres context'ten geliyor.
    const url = `${siteUrl}${canonicalPath}`;
    document.title = title;

    const set = (selector, attr, value) => {
      const el = document.head.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    set('meta[name="description"]', "content", description);
    set('link[rel="canonical"]', "href", url);
    set('meta[property="og:url"]', "content", url);
    set('meta[property="og:locale"]', "content", locale);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", ogDescription);
    set('meta[name="twitter:title"]', "content", title);
    set('meta[name="twitter:description"]', "content", ogDescription);
  }, [title, description, ogDescription, canonicalPath, siteUrl, locale]);
}
