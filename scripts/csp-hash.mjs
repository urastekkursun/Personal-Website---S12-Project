#!/usr/bin/env node
/**
 * Üretilen TÜM HTML dosyalarındaki INLINE <script> bloklarının (JSON-LD dahil)
 * sha256 hash'ini hesaplar ve `vercel.json` + `netlify.toml` içindeki CSP
 * `script-src` direktifini senkronize eder.
 *
 * Neden gerekli:
 *   CSP `script-src 'self'` inline script'leri de kapsar — `application/ld+json`
 *   çalıştırılabilir olmasa bile tarayıcı bloklar ve yapılandırılmış veri
 *   arama motorlarına ulaşmaz. Tek çözüm hash (veya nonce) vermek, ama hash
 *   elle tutulduğunda index.html'deki tek bir karakter bile hash'i geçersiz
 *   kılıyor ve bu sessizce bozuluyor.
 *
 * Neden TÜM dosyalar:
 *   `scripts/prerender.mjs` dil başına ayrı HTML üretiyor (dist/index.html ve
 *   dist/en/index.html) ve JSON-LD içerikleri farklı — dolayısıyla hash'leri
 *   de farklı. Yalnızca dist/index.html taransaydı EN sayfasının yapılandırılmış
 *   verisi canlıda sessizce bloklanırdı.
 *
 * Kullanım:
 *   npm run csp:sync    -> config dosyalarını günceller
 *   npm run csp:check   -> senkron değilse hata verir (CI için)
 *
 * Bilinen sınırlama: `assertParseSane` açılış/kapanış sayısını doğrular. Sayılar
 * eşit ama eşleşme kayıksa (ör. iç içe geçmiş bozuk etiketler) teorik olarak
 * hâlâ yanlış hash üretilebilir.
 *
 * Not: Vercel/Netlify bu config dosyalarını build'den ÖNCE ve repo'dan okur;
 * bu yüzden script build sırasında değil, geliştirme/CI aşamasında çalışır ve
 * sonucu commit'lenir. `csp:check` de tam olarak bunun unutulmasını engeller.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_FILES = ["vercel.json", "netlify.toml"];

// `script-src 'self'` ve ardından gelen mevcut hash'ler
const SCRIPT_SRC_RE = /script-src 'self'((?: '(?:sha256|sha384|sha512)-[A-Za-z0-9+/=]+')*)/;
// src'si OLMAYAN (yani inline) script blokları
const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
// Sağlamlık kontrolü için: tüm açılış etiketleri, src'li olanlar, kapanışlar
const OPEN_TAG_RE = /<script\b[^>]*>/g;
const OPEN_TAG_WITH_SRC_RE = /<script\b[^>]*\bsrc=[^>]*>/g;
const CLOSE_TAG_RE = /<\/script\s*>/g;

const count = (html, re) => (html.match(re) || []).length;

/**
 * HTML'i ayrıştırırken sessizce yanlış sonuç üretmemek için tutarlılık kontrolü.
 *
 * Somut risk: `</script>` kapanışı bozulursa (ör. `</scrpt>`) regex bir sonraki
 * kapanışa kadar YANLIŞ bir aralığı eşleştirir, geçerli görünen ama tamamen
 * hatalı bir hash üretir. `csp:sync` bunu config'e yazar, `csp:check` yeşil
 * kalır ve tarayıcı gerçek script'i bloklar — yani hata tam da engellemeye
 * çalıştığımız şekilde sessizce geçer.
 */
function assertParseSane(html, inlineCount) {
  const open = count(html, OPEN_TAG_RE);
  const withSrc = count(html, OPEN_TAG_WITH_SRC_RE);
  const close = count(html, CLOSE_TAG_RE);
  const expectedInline = open - withSrc;
  const problems = [];

  if (open !== close) {
    problems.push(`${open} adet <script> açılışına karşılık ${close} adet </script> kapanışı var`);
  }
  if (inlineCount !== expectedInline) {
    problems.push(
      `${expectedInline} adet inline script bekleniyordu, ${inlineCount} tanesi ayrıştırılabildi`
    );
  }
  return problems;
}

/** dist altındaki tüm index.html'leri toplar (dil başına bir tane). */
function walkHtml(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(path, found);
    } else if (entry.name.endsWith(".html")) {
      found.push(path);
    }
  }
  return found;
}

/**
 * Servis edilen dosyalar dist altındakiler olduğu için önce onları tercih et.
 * Vite inline script'leri aynen kopyalıyor ama bunu varsaymak yerine gerçek
 * çıktıyı okumak daha güvenli.
 */
function readHtmlFiles() {
  const dist = resolve(root, "dist");
  if (existsSync(dist)) {
    const files = walkHtml(dist);
    if (files.length) return files;
  }
  console.warn("! dist bulunamadı, kaynak index.html kullanılıyor. Önce `npm run build` önerilir.");
  return [resolve(root, "index.html")];
}

const files = readHtmlFiles();
const hashes = new Set();
const parseProblems = [];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const fileHashes = [];

  for (const [, body] of html.matchAll(INLINE_SCRIPT_RE)) {
    // CSP hash'i script elementinin metin içeriği üzerinden, hiçbir kırpma
    // yapılmadan hesaplanır.
    fileHashes.push("sha256-" + createHash("sha256").update(body, "utf8").digest("base64"));
  }

  const problems = assertParseSane(html, fileHashes.length);
  if (problems.length) {
    parseProblems.push({ file: relative(root, file), problems });
    continue;
  }

  console.log(`${relative(root, file)} — ${fileHashes.length} inline script`);
  fileHashes.forEach((h) => {
    console.log(`  ${h}`);
    hashes.add(h);
  });
}

// Ayrıştırma güvenilir değilse HİÇBİR ŞEY yazma — yanlış hash yazmak,
// hash'i hiç güncellememekten daha tehlikeli çünkü sonraki check'ler yeşil kalır.
if (parseProblems.length) {
  console.error("\n✖ HTML güvenilir şekilde ayrıştırılamadı:");
  for (const { file, problems } of parseProblems) {
    console.error(`  ${file}`);
    problems.forEach((p) => console.error(`    - ${p}`));
  }
  console.error("  Config dosyalarına DOKUNULMADI. <script> etiketlerini kontrol et.");
  process.exit(1);
}

// Sıralama determinizm için: dosya okuma sırası değişse de direktif aynı kalsın,
// yoksa `csp:check` sebepsiz yere kırmızıya döner.
const directive =
  "script-src 'self'" +
  [...hashes]
    .toSorted()
    .map((h) => ` '${h}'`)
    .join("");

const mode = process.argv.includes("--check") ? "check" : "write";
const changed = [];
const missing = [];

for (const file of CONFIG_FILES) {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    missing.push(file);
    continue;
  }
  const before = readFileSync(path, "utf8");
  if (!SCRIPT_SRC_RE.test(before)) {
    missing.push(`${file} (CSP içinde \`script-src 'self'\` bulunamadı)`);
    continue;
  }
  // Değiştirme metni `$` içerebileceği için fonksiyon biçimi kullanılıyor.
  const after = before.replace(SCRIPT_SRC_RE, () => directive);
  if (after !== before) {
    changed.push(file);
    if (mode === "write") writeFileSync(path, after);
  }
}

if (missing.length) {
  console.error("\n✖ Şu dosyalar işlenemedi:");
  missing.forEach((m) => console.error(`  - ${m}`));
  process.exit(1);
}

if (mode === "check") {
  if (changed.length) {
    console.error(`\n✖ CSP hash'i güncel değil: ${changed.join(", ")}`);
    console.error("  Düzeltmek için: npm run csp:sync");
    process.exit(1);
  }
  console.log("\n✓ CSP hash'leri güncel.");
} else {
  console.log(
    changed.length
      ? `\n✓ Güncellendi: ${changed.join(", ")}`
      : "\n✓ Zaten güncel, değişiklik yok."
  );
}
