# Claude Code Promptu — Personal-Website (S12 Project) İyileştirme

Aşağıdaki metni olduğu gibi VS Code içinde Claude Code'a (terminal veya extension) yapıştır.

---

## PROMPT

Bu repo bir React + Vite kişisel portfolyo sitesi (`fsweb-portfolio`). Bir bootcamp ödevi olarak başladı, şimdi gerçek, canlıya alınabilir bir kişisel proje haline getirmek istiyorum. Kodun tamamını incele ve aşağıdaki adımları sırayla uygula. Her adımda önce mevcut kodu analiz et, sonra değişikliği yap, sonra ne değiştirdiğini kısaca özetle.

### 0. Analiz (önce bunu yap, hiçbir şeyi değiştirme)
- `src/` altındaki tüm dosyaları oku: `components/`, `context/`, `hooks/`, `data/`, `utils/`.
- `package.json`, `vite.config.js`, `index.html` dosyalarını incele.
- Şunları listele: (a) kullanılan tüm dış API/URL çağrıları ve hardcoded değerler, (b) `localStorage`/`sessionStorage` kullanılan her yer, (c) `target="_blank"` kullanılan tüm linkler, (d) `dangerouslySetInnerHTML` veya doğrudan DOM manipülasyonu yapılan yerler, (e) eksik `alt`, `aria-*`, semantic HTML kullanımı, (f) SEO/meta etiketi durumu (`index.html`).
- Bu analizi bana Markdown bir tablo halinde özetle, sonra devam et.

### 1. Güvenlik
- Tüm hardcoded API URL'lerini ve varsa anahtar/token benzeri değerleri `.env` dosyasına taşı (`VITE_` prefix'i ile), `.env.example` oluştur, `.gitignore`'a `.env` ekle (zaten yoksa).
- `useLocalStorage` hook'unu güçlendir: `JSON.parse`/`JSON.stringify` çağrılarını try/catch içine al, bozuk veri durumunda varsayılan değere düşecek şekilde düzelt, SSR/olmayan `window` durumuna karşı guard ekle.
- Tüm `target="_blank"` içeren `<a>` etiketlerine `rel="noopener noreferrer"` ekle.
- Axios istekleri için: timeout değeri ekle, hata durumunda kullanıcıya `react-toastify` ile anlamlı hata mesajı göster (zaten kullanılıyor, kontrol et), başarısız isteklerde konsola stack trace basmayı production'da kapat.
- `index.html`'e temel güvenlik header önerilerini not olarak ekle (Vercel/Netlify `_headers` veya `vercel.json` üzerinden `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) ve varsa örnek bir `vercel.json`/`netlify.toml` dosyası oluştur.
- `npm audit` çalıştır, kritik/yüksek seviyeli açıkları raporla ve mümkünse düzelt.
- README'deki tüm placeholder değerleri (`USERNAME/fsweb-portfolio`, "Vercel deploy sonrası güncelle" vb.) gerçek repo bilgileriyle güncellemem gerektiğini bana bir TODO listesi olarak sun (bunları otomatik dolduramazsın, benim vereceğim bilgiyle doldurulacak).

### 2. Kod kalitesi / mimari
- Bir `ErrorBoundary` bileşeni ekle ve uygulamanın kök seviyesine sar.
- Basit bir 404/NotFound deneyimi ekle (SPA olduğu için route yoksa bile en azından beklenmeyen state için fallback UI).
- `oxlint` kurallarını kontrol et, mevcut lint hatalarını düzelt.
- Bir GitHub Actions workflow'u ekle (`.github/workflows/ci.yml`): push/PR'da `npm ci`, `npm run lint`, `npm run build` çalıştırsın.
- Mümkünse Dependabot config'i ekle (`.github/dependabot.yml`) — npm için haftalık kontrol.

### 3. Tasarım / UX
- `index.html`'e eksik SEO/meta etiketlerini ekle: `<title>`, `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`), Twitter Card, favicon, `<html lang>` (TR/EN context'ine göre dinamik ayarlanabilir).
- Renk kontrastlarını (dark/light tema) WCAG AA seviyesine göre kontrol et, gerekiyorsa CSS custom property değerlerini güncelle.
- Görsellerde eksik `alt` metinlerini tamamla, dekoratif görsellerde `alt=""` kullan.
- Klavye ile gezinme ve `:focus-visible` stilleri ekle/kontrol et.
- Responsive kontrolü yap: en az 3 breakpoint (mobil/tablet/masaüstü) için `Header`, `Hero`, `Projects`, `Skills` bileşenlerinin düzgün kırıldığını doğrula, gerekirse CSS düzelt.
- Sayfa/bileşen geçişlerine hafif CSS transition'lar (tema değişimi, kart hover'ları) ekle — abartısız, performansı etkilemeyecek şekilde.
- Basit bir loading/skeleton state'i ekle (özellikle axios isteği sırasında zaten toast var, ama görsel bir skeleton/pulse efekti de ekle).

### 4. Teslim
- Yaptığın tüm değişiklikleri mantıklı, küçük commit'lere böl (örn: `security: env variables`, `a11y: alt texts and contrast`, `feat: error boundary`, `ci: github actions`).
- En sonda bana: (a) hangi dosyaları değiştirdiğini, (b) hâlâ manuel olarak benim yapmam gereken şeyleri (örn. gerçek domain, gerçek API anahtarı, sosyal medya linkleri), (c) sıradaki önerilen adımları (örn. test yazımı, i18next'e geçiş, TypeScript'e taşıma) özetleyen bir `IMPROVEMENTS.md` dosyası oluştur.

Her adımdan sonra durup bana kısa bir özet ver, ben onaylamadan sıradaki büyük adıma geçme.
