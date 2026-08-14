/**
 * Dil ⇄ URL eşlemesinin TEK doğruluk kaynağı.
 *
 * Hem uygulama (React Router, LanguageContext, Header) hem de build sonrası
 * çalışan `scripts/prerender.mjs` bu dosyayı okur. Bu yüzden burada JSX,
 * `import.meta` veya Vite'a özgü hiçbir şey KULLANILMAZ — düz ESM kalmalı ki
 * Node doğrudan import edebilsin.
 */

export const LANGUAGES = ["tr", "en"];
export const DEFAULT_LANG = "tr";

// Varsayılan dil kökte durur; ek dil kendi ön ekini alır.
// Yeni bir dil eklemek = buraya bir satır + content.json'a çeviriler.
const PREFIX = { tr: "", en: "/en" };

/**
 * Route segment'lerinin dil karşılıkları.
 *
 * Uygulama İÇİNDE her şey kanonik (soldaki) adla konuşur — `<Routes>` tek bir
 * `/case/:slug` tanımı görür. URL'e çıkarken segment o dilin karşılığına
 * çevrilir: TR'de `/vaka/difod`, EN'de `/en/case/difod`. Aksi halde İngiliz
 * bir stüdyoya gönderilen adres `/en/vaka/difod` olurdu.
 */
const SEGMENTS = {
  case: { tr: "vaka", en: "case" },
};

export const isValidLang = (value) => LANGUAGES.includes(value);

/** Bir dilin ana sayfa yolu. `tr` → `/`, `en` → `/en` */
export function homePath(lang) {
  return PREFIX[lang] || "/";
}

/** Dile özgü segment → kanonik ad. `vaka` (tr) → `case` */
function toCanonical(segment, lang) {
  for (const [canonical, forms] of Object.entries(SEGMENTS)) {
    if (forms[lang] === segment) return canonical;
  }
  return segment;
}

/** Kanonik ad → dile özgü segment. `case` + `tr` → `vaka` */
function toLocalized(segment, lang) {
  return SEGMENTS[segment]?.[lang] ?? segment;
}

/**
 * Bir path'i `{ lang, rest }` olarak ayrıştırır. `rest` her zaman KANONİK'tir.
 * `/en/case/difod` → `{ lang: "en", rest: "/case/difod" }`
 * `/vaka/difod`    → `{ lang: "tr", rest: "/case/difod" }`
 */
export function parsePath(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";

  let lang = DEFAULT_LANG;
  let rest = path;

  for (const candidate of LANGUAGES) {
    const prefix = PREFIX[candidate];
    if (!prefix) continue;
    if (path === prefix) {
      return { lang: candidate, rest: "/" };
    }
    if (path.startsWith(`${prefix}/`)) {
      lang = candidate;
      rest = path.slice(prefix.length);
      break;
    }
  }

  if (rest === "/") return { lang, rest };

  const [, head, ...tail] = rest.split("/");
  return { lang, rest: ["", toCanonical(head, lang), ...tail].join("/") };
}

/**
 * Kanonik bir route'u o dilin adresine çevirir.
 * `localePath("/case/difod", "en")` → `/en/case/difod`
 * `localePath("/case/difod", "tr")` → `/vaka/difod`
 *
 * Uygulama içi TÜM linkler bundan geçmeli, yoksa İngilizce sayfadaki bir
 * bağlantı ziyaretçiyi sessizce Türkçe'ye düşürür.
 */
export function localePath(rest, lang) {
  if (!rest || rest === "/") return homePath(lang);

  const prefix = PREFIX[lang] ?? "";
  const normalized = rest.startsWith("/") ? rest : `/${rest}`;
  const [, head, ...tail] = normalized.split("/");

  return `${prefix}${["", toLocalized(head, lang), ...tail].join("/")}`;
}

/**
 * Aynı sayfanın başka dildeki karşılığı. Dil değiştirici bunu kullanır —
 * ziyaretçi 404'teyken de, vaka sayfasındayken de doğru hedefe gider.
 */
export function swapLang(pathname, nextLang) {
  return localePath(parsePath(pathname).rest, nextLang);
}

/**
 * Dilden bağımsız route kimliği. Odak/scroll yönetimi buna bakar: TR→EN
 * geçişi URL'i değiştirir ama SAYFA aynıdır, o yüzden ziyaretçiyi okuduğu
 * yerden koparıp sayfa başına fırlatmak istemiyoruz.
 */
export function routeKey(pathname) {
  return parsePath(pathname).rest;
}

/**
 * Prerender çıktısının dist içindeki yolu.
 * `/` + `tr` → `index.html`, `/case/difod` + `en` → `en/case/difod/index.html`
 */
export function outputPath(rest, lang) {
  const path = localePath(rest, lang);
  return path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
}
