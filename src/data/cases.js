/**
 * Vaka çalışması verisinin doğrulaması ve TASLAK ayıklaması.
 *
 * Düz ESM — `import.meta` veya Vite'a özgü hiçbir şey yok, çünkü bu dosyayı
 * `scripts/prerender.mjs` de Node'dan import ediyor. `content.json` da burada
 * import EDİLMEZ; veriyi çağıran taraf verir (uygulama tarafı için
 * `caseList.js`, build tarafı için prerender).
 *
 * TASLAK KAVRAMI NEDEN VAR:
 *   Vaka sayfalarının en ikna edici kısmı "9 günde teslim" gibi somut
 *   iddialar. Bunlar uydurulamaz. İçeriği henüz girilmemiş bir vaka
 *   `DRAFT_MARKER` taşır ve route'a, prerender'a, proje kartındaki linke
 *   HİÇ çıkmaz. Yarım bir vaka sayfası, hiç olmayandan daha pahalıdır.
 */

/** İçeriğin doldurulmadığını işaretleyen dizi. */
export const DRAFT_MARKER = "__DOLDUR__";

const isFilledString = (value) => typeof value === "string" && value.trim() !== "";
const isFilledLeaf = (value) =>
  value !== null &&
  typeof value === "object" &&
  isFilledString(value.tr) &&
  isFilledString(value.en);

/** `{ tr: [...], en: [...] }` biçimindeki paragraf listesi. */
const isFilledParagraphs = (value) => {
  if (value === null || typeof value !== "object") return false;
  return ["tr", "en"].every(
    (lang) =>
      Array.isArray(value[lang]) &&
      value[lang].length > 0 &&
      value[lang].every(isFilledString)
  );
};

/** Kayıttaki herhangi bir metin hâlâ doldurulmayı bekliyor mu? */
function hasDraftMarker(node) {
  if (typeof node === "string") return node.includes(DRAFT_MARKER);
  if (Array.isArray(node)) return node.some(hasDraftMarker);
  if (node !== null && typeof node === "object") return Object.values(node).some(hasDraftMarker);
  return false;
}

const TEXT_FIELDS = ["title", "summary", "duration", "metaDescription"];
const PARAGRAPH_FIELDS = ["problem", "approach", "result"];

function inspect(item, index, seenSlugs) {
  const problems = [];
  const label = isFilledString(item?.slug) ? `"${item.slug}"` : `dizin ${index}`;

  if (!isFilledString(item?.slug)) {
    problems.push("`slug` eksik veya boş");
  } else if (!/^[a-z0-9-]+$/.test(item.slug)) {
    problems.push(`\`slug: "${item.slug}"\` yalnızca küçük harf, rakam ve tire içerebilir`);
  } else if (seenSlugs.has(item.slug)) {
    problems.push(`\`slug\` tekrar ediyor: "${item.slug}" (iki vaka aynı URL'e düşer)`);
  }

  for (const field of TEXT_FIELDS) {
    if (!isFilledLeaf(item?.[field])) problems.push(`\`${field}\` için tr/en çevirisi eksik`);
  }

  for (const field of PARAGRAPH_FIELDS) {
    if (!isFilledParagraphs(item?.[field])) {
      problems.push(`\`${field}\` tr/en paragraf listesi olarak dolu değil`);
    }
  }

  if (!Array.isArray(item?.stack) || item.stack.length === 0) {
    problems.push("`stack` boş veya dizi değil");
  }
  if (!isFilledString(item?.image)) problems.push("`image` alanı eksik");
  if (!isFilledString(item?.projectId)) {
    problems.push("`projectId` eksik — kart hangi projeye bağlanacağı bilinmiyor");
  }
  // `live` ve `repo` opsiyoneldir: her işin canlı linki paylaşılabilir olmayabilir.

  return { label, problems, draft: hasDraftMarker(item) };
}

/**
 * @param {unknown} items `content.json` → `cases.items`
 * @param {(message: string) => void} [report] sorunları bildiren fonksiyon
 * @returns publishedIndexes / bySlug / byProjectId — hepsi DİZİN üzerinden.
 *   Dizin kullanılıyor çünkü kopya slug'ı slug ile ayırt etmek mümkün değil;
 *   aynı hata proje listesinde bir kez yaşandı (bkz. src/data/projects.js).
 */
export function collectCases(items, report = () => {}) {
  const publishedIndexes = new Set();
  const bySlug = new Map();
  const byProjectId = new Map();
  const drafts = [];

  if (!Array.isArray(items)) {
    if (items !== undefined) report("[cases] content.json içinde `cases.items` bir dizi değil.");
    return { publishedIndexes, bySlug, byProjectId, drafts };
  }

  const seenSlugs = new Set();

  items.forEach((item, index) => {
    const { label, problems, draft } = inspect(item, index, seenSlugs);

    if (problems.length) {
      report(`[cases] ${label} veri sorunu:\n  - ${problems.join("\n  - ")}`);
      return;
    }

    seenSlugs.add(item.slug);

    if (draft) {
      drafts.push(item.slug);
      report(
        `[cases] "${item.slug}" TASLAK: içinde hâlâ ${DRAFT_MARKER} geçiyor, ` +
          "yayına çıkarılmadı. Metinleri content.json'da doldur."
      );
      return;
    }

    publishedIndexes.add(index);
    bySlug.set(item.slug, index);
    byProjectId.set(item.projectId, { slug: item.slug, index });
  });

  return { publishedIndexes, bySlug, byProjectId, drafts };
}
