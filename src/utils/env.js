// Tüm `import.meta.env` okumaları tek yerden geçsin: böylece eksik/bozuk bir
// değişken uygulamanın ortasında değil, burada yakalanır.

const isDev = import.meta.env.DEV;

function readString(key, fallback) {
  const raw = import.meta.env[key];
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  if (isDev) {
    console.warn(`[env] ${key} tanımlı değil, varsayılan kullanılıyor: ${fallback}`);
  }
  return fallback;
}

function readNumber(key, fallback) {
  const parsed = Number(readString(key, String(fallback)));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  isDev,
  apiBaseUrl: readString("VITE_API_BASE_URL", "https://reqres.in/api"),
  apiLanguageEndpoint: readString("VITE_API_LANGUAGE_ENDPOINT", "/workintech"),
  apiKey: readString("VITE_API_KEY", ""),
  apiTimeoutMs: readNumber("VITE_API_TIMEOUT_MS", 8000),
  siteUrl: readString("VITE_SITE_URL", "https://fsweb-portfolio.vercel.app"),
  // Boş bırakılırsa footer'daki blog linki hiç render edilmez.
  blogUrl: import.meta.env.VITE_BLOG_URL?.trim() || "",
};

// Production build'de konsolu kirletmemek (ve stack trace sızdırmamak) için
// tüm hata loglarını bu fonksiyondan geçir.
export function logError(...args) {
  if (isDev) {
    console.error(...args);
  }
}
