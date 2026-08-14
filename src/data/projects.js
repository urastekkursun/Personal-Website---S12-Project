/**
 * Proje verisinin şekil doğrulaması.
 *
 * NEDEN VAR: Görsel ve renk tonu eskiden `Projects.jsx` içinde iki ayrı
 * dizide duruyor ve `content.json`'daki sıraya `index % dizi.length` ile
 * eşleniyordu. Yani listeye 4. projeyi eklediğin an o proje SESSİZCE
 * OtoCore'un ekran görüntüsüyle render oluyordu; kimse fark etmiyordu.
 * Artık görsel ve ton projenin kendi alanı ve burada doğrulanıyor:
 * geliştirmede gürültülü hata, canlıda güvenli fallback.
 */
import content from "./content.json";
import { logError } from "../utils/env";

// Vite build sırasında çözer; sonuç hash'li asset URL'i olur.
const ASSETS = import.meta.glob("../assets/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

// "../assets/difod.webp" -> "difod"
const IMAGE_URLS = Object.fromEntries(
  Object.entries(ASSETS).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf(".")),
    url,
  ])
);

export const TONES = ["blue", "green", "red"];
const DEFAULT_TONE = "blue";

const isFilledString = (value) => typeof value === "string" && value.trim() !== "";
const isFilledLeaf = (value) =>
  value !== null &&
  typeof value === "object" &&
  isFilledString(value.tr) &&
  isFilledString(value.en);

/** Tek bir ham (henüz localize edilmemiş) proje kaydını denetler. */
function inspect(project, index, seenIds) {
  const problems = [];
  const label = isFilledString(project?.id) ? `#${project.id}` : `dizin ${index}`;

  if (!isFilledString(project?.id)) {
    problems.push("`id` eksik veya boş");
  } else if (seenIds.has(project.id)) {
    problems.push(`\`id\` tekrar ediyor: "${project.id}" (React key çakışır)`);
  }

  if (!isFilledLeaf(project?.name)) problems.push("`name` için tr/en çevirisi eksik");
  if (!isFilledLeaf(project?.description)) problems.push("`description` için tr/en çevirisi eksik");

  if (!Array.isArray(project?.tags) || project.tags.length === 0) {
    problems.push("`tags` boş veya dizi değil");
  }

  if (!isFilledString(project?.github)) problems.push("`github` linki eksik");
  if (!isFilledString(project?.app)) problems.push("`app` linki eksik");

  // Görselin YOKLUĞU kartı düşürmez (altta figure'sız render edilir), ama
  // sessiz kalmaz.
  if (!isFilledString(project?.image)) {
    problems.push("`image` alanı eksik");
  } else if (!IMAGE_URLS[project.image]) {
    problems.push(
      `\`image: "${project.image}"\` src/assets/ altında bulunamadı ` +
        `(mevcut: ${Object.keys(IMAGE_URLS).join(", ")})`
    );
  }

  if (project?.tone && !TONES.includes(project.tone)) {
    problems.push(`\`tone: "${project.tone}"\` geçersiz (${TONES.join(", ")})`);
  }

  return { label, problems };
}

/**
 * Kartı hiç render edilemez yapan alanlar. Bunlar eksikse proje listeden
 * düşer — yarım bir kart göstermek, hiç göstermemekten daha kötü.
 */
const FATAL = ["`id`", "`name`", "`description`", "`tags`"];
const isFatal = (problem) => FATAL.some((field) => problem.startsWith(field));

/**
 * Sonuç `id` değil DİZİN kümesi.
 *
 * Neden: ilk denemede id'ye göre filtreleniyordu ve tam da yakalaması gereken
 * durumu kaçırıyordu — kopya id'li ikinci kayıt, id'si "geçerli listede"
 * göründüğü için süzgeçten geçiyor, React'ta duplicate key'e ve eksik çeviri
 * yüzünden sayfayı ErrorBoundary'ye düşüren bir render hatasına yol açıyordu.
 * Dizin her kaydı tekil olarak adresler; `localize` dizi sırasını koruduğu
 * için ham veri ile çevrilmiş veri hizada kalır.
 */
function validate(items) {
  if (!Array.isArray(items)) {
    logError("[projects] content.json içinde `projects.items` bir dizi değil.");
    return new Set();
  }

  const seenIds = new Set();
  const usable = new Set();

  items.forEach((project, index) => {
    const { label, problems } = inspect(project, index, seenIds);

    if (problems.length) {
      logError(`[projects] ${label} veri sorunu:\n  - ${problems.join("\n  - ")}`);
    }

    if (problems.some(isFatal)) return;

    seenIds.add(project.id);
    usable.add(index);
  });

  return usable;
}

/** Render edilebilir proje dizinleri. Doğrulama modül yüklenirken bir kez çalışır. */
export const USABLE_PROJECT_INDEXES = validate(content.projects?.items);

/** Görsel URL'i; kayıt yoksa `null` döner ve kart görselsiz render edilir. */
export function projectImage(key) {
  return IMAGE_URLS[key] ?? null;
}

/** Geçersiz ton verisi kartı renksiz bırakmasın. */
export function projectTone(tone) {
  return TONES.includes(tone) ? tone : DEFAULT_TONE;
}
