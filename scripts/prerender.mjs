#!/usr/bin/env node
/**
 * Her SAYFA ve her DİL için statik HTML üretir.
 *
 *   dist/index.html                 -> TR ana sayfa
 *   dist/en/index.html              -> EN ana sayfa
 *   dist/vaka/<slug>/index.html     -> TR vaka çalışması
 *   dist/en/case/<slug>/index.html  -> EN vaka çalışması
 *
 * NEDEN GEREKLİ:
 *   WhatsApp, LinkedIn, Slack ve X'in link önizleme crawler'ları JavaScript
 *   ÇALIŞTIRMAZ. React içinden `document.title`/meta güncellemek (react-helmet
 *   dahil) bu botlar için hiçbir şey ifade etmez — gönderdiğin `/en` linki
 *   Türkçe önizlemeyle görünür. Dili URL'e taşımak tek başına yetmiyor;
 *   o URL'in ARDINDA gerçek, statik bir HTML olması gerekiyor.
 *
 *   Vaka sayfaları da "tek başına paylaşılabilir" olmalı: birine sadece
 *   DİFOD vakasının linkini gönderdiğinde önizlemede o vakanın başlığı ve
 *   açıklaması çıkmalı, ana sayfanınki değil.
 *
 *   Bütün çıktılar aynı JS bundle'ını boot eder; fark yalnızca <head> içinde.
 *
 * Tek doğruluk kaynağı: src/data/content.json.
 *
 * Kullanım: `npm run build` bunu otomatik çağırır (bkz. package.json).
 * Sonrasında CSP hash'leri değişir -> `npm run csp:sync`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, DEFAULT_LANG, localePath, outputPath } from "../src/routes.js";
import { collectCases } from "../src/data/cases.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const MARKER_RE = /<!--PRERENDER:META-->[\s\S]*?<!--\/PRERENDER:META-->/;
const HTML_LANG_RE = /<html\s+lang="[^"]*"/;

const content = JSON.parse(readFileSync(resolve(root, "src/data/content.json"), "utf8"));
const meta = content.meta;

/** Aktif dilin karşılığını seçer; `{tr, en}` değilse değeri aynen döndürür. */
const pick = (value, lang) =>
  value !== null && typeof value === "object" ? value[lang] : value;

/**
 * HTML attribute değeri kaçışı. `&` mutlaka İLK sırada olmalı, yoksa
 * kendi ürettiğimiz entity'leri tekrar kaçırırız.
 */
const attr = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/** JSON-LD gövdesi: `</script>` dizisi içerikte geçerse etiketi erken kapatır. */
const jsonLd = (data) => JSON.stringify(data).replaceAll("<", "\\u003c");

const siteUrl = meta.siteUrl.replace(/\/+$/, "");
const absolute = (path) => `${siteUrl}${path}`;

/* ------------------------------------------------------------------ */
/* Üretilecek sayfaların listesi                                       */
/* ------------------------------------------------------------------ */

const problems = [];
const { publishedIndexes, drafts } = collectCases(content.cases?.items, (message) =>
  problems.push(message)
);

/**
 * Ana sayfa + yayınlanmış her vaka. Taslak vakalar (içinde `__DOLDUR__`
 * geçenler) BİLEREK dışarıda: uygulama onları 404'e düşürüyor, prerender da
 * üretmemeli — yoksa arama motoruna yarım içerikli bir sayfa indekslettirmiş
 * oluruz.
 */
const pages = [
  {
    route: "/",
    type: "website",
    title: (lang) => pick(meta.title, lang),
    description: (lang) => pick(meta.description, lang),
    ogDescription: (lang) => pick(meta.ogDescription, lang),
  },
  ...[...publishedIndexes].map((index) => {
    const item = content.cases.items[index];
    return {
      route: `/case/${item.slug}`,
      type: "article",
      title: (lang) => `${pick(item.title, lang)} — ${meta.author}`,
      description: (lang) => pick(item.metaDescription, lang),
      ogDescription: (lang) => pick(item.metaDescription, lang),
    };
  }),
];

/* ------------------------------------------------------------------ */
/* Meta bloğu                                                          */
/* ------------------------------------------------------------------ */

function buildMeta(page, lang) {
  const title = page.title(lang);
  const description = page.description(lang);
  const ogDescription = page.ogDescription(lang);
  const imageAlt = pick(meta.ogImageAlt, lang);
  // Vaka ekran görüntüleri 500x287 WebP — OG önizlemesi için hem çok küçük
  // hem LinkedIn/WhatsApp tarafında güvenilmez bir format. Sayfa başına
  // görsel istenirse 1200x630 jpg/png üretilmeli.
  const image = absolute(meta.ogImage);
  const url = absolute(localePath(page.route, lang));
  const alternates = LANGUAGES.filter((l) => l !== lang).map((l) => pick(meta.locale, l));

  const lines = [
    "<!--PRERENDER:META-->",
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    `<meta name="author" content="${attr(meta.author)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    // hreflang seti her dilde AYNI ve karşılıklı olmalı; x-default varsayılan
    // dile işaret eder. Vaka sayfasında da o vakanın diğer dildeki adresini
    // gösterir — ana sayfayı değil.
    ...LANGUAGES.map(
      (l) =>
        `<link rel="alternate" hreflang="${l}" href="${attr(absolute(localePath(page.route, l)))}" />`
    ),
    `<link rel="alternate" hreflang="x-default" href="${attr(absolute(localePath(page.route, DEFAULT_LANG)))}" />`,
    `<meta property="og:type" content="${page.type}" />`,
    `<meta property="og:site_name" content="${attr(meta.author)}" />`,
    `<meta property="og:locale" content="${attr(pick(meta.locale, lang))}" />`,
    ...alternates.map((l) => `<meta property="og:locale:alternate" content="${attr(l)}" />`),
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(ogDescription)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${attr(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(ogDescription)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
    `<meta name="twitter:image:alt" content="${attr(imageAlt)}" />`,
    `<script type="application/ld+json">`,
    jsonLd(
      page.route === "/"
        ? {
            "@context": "https://schema.org",
            "@type": "Person",
            name: meta.author,
            url,
            image,
            jobTitle: pick(meta.jobTitle, lang),
            email: `mailto:${pick(content.hero.email, lang)}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: pick(content.profile.city, lang),
              addressCountry: "TR",
            },
            sameAs: [
              "https://github.com/urastekkursun",
              "https://www.linkedin.com/in/urastekkursun/",
            ],
          }
        : {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: ogDescription,
            url,
            image,
            inLanguage: lang,
            author: { "@type": "Person", name: meta.author, url: absolute("/") },
          }
    ),
    `</script>`,
    "<!--/PRERENDER:META-->",
  ];

  // Kaynak index.html ile birebir aynı girinti — böylece TR ana sayfa çıktısı
  // ile şablon arasında gereksiz fark oluşmaz.
  return lines
    .map((line) => (line.startsWith("{") ? line : `    ${line}`))
    .join("\n")
    .replace(/^ {4}/, "");
}

/* ------------------------------------------------------------------ */
/* Ön kontroller                                                       */
/* ------------------------------------------------------------------ */

const templatePath = resolve(dist, "index.html");
if (!existsSync(templatePath)) {
  console.error("✖ dist/index.html yok. Önce `vite build` çalışmalı.");
  process.exit(1);
}

const template = readFileSync(templatePath, "utf8");

if (!MARKER_RE.test(template)) {
  console.error("✖ dist/index.html içinde <!--PRERENDER:META--> bloğu bulunamadı.");
  console.error("  index.html'deki işaretçiler silinmiş olabilir.");
  process.exit(1);
}
if (!HTML_LANG_RE.test(template)) {
  console.error('✖ dist/index.html içinde <html lang="..."> bulunamadı.');
  process.exit(1);
}

// Bildirilmiş ama var olmayan bir CV, ajansın tıkladığında 404 alması demek.
// Kırık link, hiç link olmamasından kötü — build'i burada durduruyoruz.
const cvFile = typeof content.cv?.file === "string" ? content.cv.file.trim() : "";
if (cvFile && !existsSync(resolve(dist, cvFile.replace(/^\/+/, "")))) {
  console.error(`✖ CV dosyası bulunamadı: public/${cvFile.replace(/^\/+/, "")}`);
  console.error("  Dosyayı public/ altına koy ya da content.json'daki `cv.file` alanını boşalt.");
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Üretim                                                              */
/* ------------------------------------------------------------------ */

if (problems.length) {
  console.log("Vaka verisi notları:");
  problems.forEach((p) => console.log(`  ${p.replaceAll("\n", "\n  ")}`));
  console.log("");
}

let written = 0;
for (const page of pages) {
  for (const lang of LANGUAGES) {
    const html = template
      .replace(HTML_LANG_RE, `<html lang="${lang}"`)
      .replace(MARKER_RE, () => buildMeta(page, lang));

    const target = resolve(dist, outputPath(page.route, lang));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
    console.log(`✓ ${outputPath(page.route, lang).padEnd(34)} ${absolute(localePath(page.route, lang))}`);
    written += 1;
  }
}

console.log(
  `\n${written} statik HTML üretildi (${pages.length} sayfa × ${LANGUAGES.length} dil).` +
    (drafts.length ? ` Taslak vakalar atlandı: ${drafts.join(", ")}.` : "") +
    "\nCSP hash'lerini senkronlamak için: npm run csp:sync"
);
