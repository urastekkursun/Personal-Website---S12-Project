#!/usr/bin/env node
/**
 * index.html içindeki INLINE <script> bloklarının (JSON-LD dahil) sha256
 * hash'ini hesaplar ve `vercel.json` + `netlify.toml` içindeki CSP
 * `script-src` direktifini senkronize eder.
 *
 * Neden gerekli:
 *   CSP `script-src 'self'` inline script'leri de kapsar — `application/ld+json`
 *   çalıştırılabilir olmasa bile tarayıcı bloklar ve yapılandırılmış veri
 *   arama motorlarına ulaşmaz. Tek çözüm hash (veya nonce) vermek, ama hash
 *   elle tutulduğunda index.html'deki tek bir karakter bile hash'i geçersiz
 *   kılıyor ve bu sessizce bozuluyor.
 *
 * Kullanım:
 *   npm run csp:sync    -> config dosyalarını günceller
 *   npm run csp:check   -> senkron değilse hata verir (CI için)
 *
 * Not: Vercel/Netlify bu config dosyalarını build'den ÖNCE ve repo'dan okur;
 * bu yüzden script build sırasında değil, geliştirme/CI aşamasında çalışır ve
 * sonucu commit'lenir. `csp:check` de tam olarak bunun unutulmasını engeller.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
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

function readHtml() {
  // Servis edilen dosya dist/index.html olduğu için önce onu tercih et.
  // Vite inline script'leri aynen kopyalıyor, ama bunu varsaymak yerine
  // gerçek çıktıyı okumak daha güvenli.
  const built = resolve(root, "dist/index.html");
  const source = resolve(root, "index.html");
  if (existsSync(built)) return { path: built, label: "dist/index.html", html: readFileSync(built, "utf8") };
  return { path: source, label: "index.html (build yok — önce `npm run build` önerilir)", html: readFileSync(source, "utf8") };
}

function computeHashes(html) {
  const hashes = [];
  for (const [, body] of html.matchAll(INLINE_SCRIPT_RE)) {
    // CSP hash'i script elementinin metin içeriği üzerinden, hiçbir kırpma
    // yapılmadan hesaplanır.
    hashes.push("sha256-" + createHash("sha256").update(body, "utf8").digest("base64"));
  }
  return hashes;
}

function buildDirective(hashes) {
  return "script-src 'self'" + hashes.map((h) => ` '${h}'`).join("");
}

const mode = process.argv.includes("--check") ? "check" : "write";
const { label, html } = readHtml();
const hashes = computeHashes(html);
const directive = buildDirective(hashes);

console.log(`Kaynak: ${label}`);
console.log(`Inline script sayısı: ${hashes.length}`);
hashes.forEach((h) => console.log(`  ${h}`));

// Ayrıştırma güvenilir değilse HİÇBİR ŞEY yazma — yanlış hash yazmak,
// hash'i hiç güncellememekten daha tehlikeli çünkü sonraki check'ler yeşil kalır.
const parseProblems = assertParseSane(html, hashes.length);
if (parseProblems.length) {
  console.error("\n✖ HTML güvenilir şekilde ayrıştırılamadı:");
  parseProblems.forEach((p) => console.error(`  - ${p}`));
  console.error("  Config dosyalarına DOKUNULMADI. index.html'deki <script> etiketlerini kontrol et.");
  process.exit(1);
}

let changed = [];
let missing = [];

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
  const after = before.replace(SCRIPT_SRC_RE, directive);
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
