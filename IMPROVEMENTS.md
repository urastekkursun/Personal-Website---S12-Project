# İyileştirme Raporu

`claude-code-prompt.md` içindeki 0–4 adımlarının uygulanması sonucu oluşan
değişikliklerin özeti.

**Doğrulama durumu:** `npm run lint` → 0 hata/uyarı · `npm run build` → başarılı ·
`npm audit` → 0 açık · tarayıcıda 375/768/1440 px'te yatay taşma yok · konsol
hatası yok.

---

## 1. Değiştirilen / eklenen dosyalar

### Yeni dosyalar

| Dosya | Ne işe yarıyor |
|---|---|
| `.env` | Yerel ortam değişkenleri (git'e **girmez**) |
| `.env.example` | Şablon — hangi değişkenlerin gerektiğini gösterir |
| `vercel.json` | Vercel için güvenlik header'ları + SPA rewrite + cache |
| `netlify.toml` | Netlify için aynı header seti |
| `.oxlintrc.json` | Lint kuralları (react, unicorn, jsx-a11y, oxc plugin'leri) |
| `.github/workflows/ci.yml` | Push/PR'da lint + build (Node 20 & 22) + `npm audit` |
| `.github/dependabot.yml` | Haftalık npm + GitHub Actions bağımlılık kontrolü |
| `public/og-image.jpg` | 1200×630 sosyal medya paylaşım görseli |
| `src/utils/env.js` | Tüm `import.meta.env` okumaları + prod'da susan `logError` |
| `src/utils/apiClient.js` | Timeout'lu `fetch` istemcisi (§5.2'de axios'tan geçildi) |
| `src/components/ErrorBoundary.jsx` | Uygulama çökerse kurtarma ekranı |
| `src/components/NotFound.jsx` | 404 deneyimi |
| `src/components/SkipLink.jsx` | Klavye kullanıcısı için "İçeriğe geç" bağlantısı |
| `scripts/csp-hash.mjs` | CSP script hash'ini otomatik üretir/doğrular (§3c) |
| `IMPROVEMENTS.md` | Bu dosya |

### Değiştirilen dosyalar

| Dosya | Değişiklik |
|---|---|
| `.gitignore` | `!.env.example` istisnası, editör/AI ajan artıkları, `claude-code-prompt.md` |
| `package.json` | `csp:sync` ve `csp:check` script'leri |
| `index.html` | SEO/OG/Twitter/JSON-LD meta'ları, `theme-color`, güvenlik header notu |
| `src/App.jsx` | ErrorBoundary sarmalama, 404 yönlendirme, `<main>`/`<footer>` landmark ayrımı, dil değişiminde `aria-busy` |
| `src/index.css` | WCAG AA kontrast düzeltmeleri, `:focus-visible`, `.visually-hidden`, `.skip-link`, `prefers-reduced-motion`, transition token'ları |
| `src/App.css` | Çift tanımlı `.theme-toggle__knob` bloğu silindi, hover/geçiş efektleri, skeleton animasyonu, fallback ekranı stilleri, tablet breakpoint'i, mobil taşma düzeltmeleri |
| `src/hooks/useLocalStorage.js` | `window` guard'ı, bozuk JSON temizliği, değer doğrulaması, sekmeler arası senkronizasyon |
| `src/context/LanguageContext.jsx` | Env'den API, timeout farkındalıklı hata mesajı, prod'da stack trace basmıyor, dil doğrulaması |
| `src/context/ThemeContext.jsx` | Tema doğrulaması, `theme-color` meta senkronizasyonu |
| `src/components/Header.jsx` | Toggle'a `role="switch"` + `aria-checked` + erişilebilir ad, yükleniyor göstergesi, canlı bölge |
| `src/components/Hero.jsx` | `rel="noopener noreferrer"`, sosyal linklere `aria-label`, açıklayıcı `alt`, LCP için `fetchPriority` |
| `src/components/Projects.jsx` | Ok butonlarına `aria-label`, canlı bölge, proje sayacı |
| `src/components/ProjectCard.jsx` | `rel="noopener noreferrer"`, görsel skeleton state'i, `aria-labelledby`, açıklayıcı `alt` |
| `src/components/Skills.jsx` | İkon rengi CSS'e devredildi (JS ikonu sarı üzerinde görünmezdi), `aria-hidden` |
| `src/components/Profile.jsx` | `aria-labelledby` |
| `src/components/Footer.jsx` | `mailto:` artık yeni sekmede açılmıyor, ölü `href="#"` blog linki env'e bağlandı |
| `src/data/content.json` | Erişilebilirlik ve hata ekranı metinleri (TR/EN) |
| `src/assets/*.webp` | Görseller küçültüldü, sonra WebP'ye çevrildi (§5.3) |
| `src/assets/fonts/` | Self-host edilen Inter + Playfair woff2 dosyaları (§5.1) |
| `package-lock.json` | `npm audit fix` — postcss güvenlik yaması |

---

## 2. Adım adım ne yapıldı

### Adım 1 — Güvenlik

- **Hardcoded değerler env'e taşındı.** `https://reqres.in/api` ve
  `x-api-key: reqres-free-v1` artık `VITE_API_BASE_URL` / `VITE_API_KEY`
  üzerinden geliyor. `.env.example` şablon olarak eklendi, `.gitignore`
  düzeltildi (`.env` dışlanıyor, `.env.example` dışlanmıyor).
  > Not: `VITE_` ön ekli her değişken build çıktısına **gömülür** ve tarayıcıdan
  > okunabilir. Buraya gerçek bir gizli anahtar koymamalısın — bu yüzden
  > `.env.example` içine bu uyarı yazıldı.

- **`useLocalStorage` sertleştirildi:** `window` yokluğuna karşı guard, bozuk
  JSON'da kaydı silip varsayılana düşme, değer doğrulama fonksiyonu
  (`theme` yalnızca `light|dark`, `lang` yalnızca `tr|en`), sekmeler arası
  `storage` senkronizasyonu. Test edildi: `theme` alanına `{bozuk-json`,
  `lang` alanına `"klingon"` yazıldığında uygulama çökmüyor, varsayılana düşüyor
  ve bozuk kaydı temizliyor.

- **5 adet `target="_blank"` linkinin hepsine `rel="noopener noreferrer"`**
  eklendi (Hero ×2, ProjectCard ×2, Footer). Ayrıca footer'daki `mailto:`
  linkinden `target="_blank"` kaldırıldı (boş sekme bırakıyordu).

- **Axios:** 8 sn timeout eklendi, timeout ile diğer hatalar için ayrı toast
  mesajları yazıldı, `console.error` yerine yalnızca development'ta yazan
  `logError` kullanılıyor — production'da stack trace konsola basılmıyor.

- **Güvenlik header'ları:** `vercel.json` ve `netlify.toml` oluşturuldu.
  `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`,
  `Cross-Origin-Opener-Policy`. `index.html` başına bunu açıklayan bir yorum
  bloğu eklendi (bu header'lar `<meta>` ile güvenilir şekilde uygulanamaz).

- **`npm audit`:** 1 adet **high** açık (postcss path traversal,
  GHSA-r28c-9q8g-f849) `npm audit fix` ile kapatıldı → **0 açık**.

### Adım 2 — Kod kalitesi / mimari

- **`ErrorBoundary`** eklendi ve uygulamanın en dışına (provider'ların da
  dışına) sarıldı — böylece Context'lerin kendisi patlasa bile ekranda bir şey
  görünür. Development'ta stack trace'i açılır panelde gösterir, production'da
  göstermez.
- **404/NotFound** eklendi. Router yok; barındırma tarafındaki SPA rewrite'ı
  her path'i `index.html`'e düşürdüğü için `App.jsx` kök dışındaki adreslerde
  açık bir 404 ekranı gösteriyor.
- **`.oxlintrc.json`** yazıldı (önceden config yoktu, kurallar varsayılan
  gevşeklikteydi). Çıkan uyarıların hepsi düzeltildi:
  `role="status"` → `<output>`, `Array.includes` → `Set.has`,
  `axios.create` → named import. Şu an **0 hata / 0 uyarı**.
- **CI** (`.github/workflows/ci.yml`): push ve PR'da `npm ci` → `npm run lint`
  → `npm run build`, Node 20 ve 22 matrisiyle; ayrı bir job'da
  `npm audit --audit-level=high`.
- **Dependabot**: npm ve GitHub Actions için haftalık; minor/patch tek PR'da
  gruplanıyor.

### Adım 3 — Tasarım / UX

- **SEO:** `meta description`, Open Graph (7 etiket), Twitter Card, `canonical`,
  `robots`, `theme-color`, `color-scheme` ve `Person` tipinde JSON-LD eklendi.
  `og:image` için `public/og-image.jpg` (1200×630) üretildi. `<html lang>`
  zaten dinamik güncelleniyordu, korundu.

- **Kontrast (WCAG AA):** Renkler hesaplanarak ölçüldü, **4 kombinasyon AA
  altındaydı**:

  | Kullanım | Önce | Sonra |
  |---|---|---|
  | `--color-text-muted` (beyaz üzerinde) | #777777 — 4.48:1 ❌ | #6b6b6b — 5.33:1 ✅ |
  | `--color-text-muted` (bölüm zemininde) | #777777 — 4.07:1 ❌ | #6b6b6b — 4.85:1 ✅ |
  | Accent **metin** (beyaz üzerinde) | #e92577 — 4.20:1 ❌ | #c81862 — 5.58:1 ✅ |
  | Accent **metin** (bölüm zemininde) | #e92577 — 3.82:1 ❌ | #c81862 — 5.07:1 ✅ |

  Yeni bir `--color-accent-text` token'ı eklendi: `--color-accent` artık
  yalnızca **dekoratif** yüzeyler (bar, pill, toggle) için, metin için
  `--color-accent-text` kullanılıyor. Dark temadaki tüm kombinasyonlar zaten
  AA'yı geçiyordu; dark için de `--color-accent-text: #ff5c9d` tanımlandı.

- **Erişilebilirlik:**
  - Tema toggle'ına `role="switch"` + `aria-checked` + erişilebilir ad
    (önceden ekran okuyucu için tamamen isimsizdi).
  - Carousel oklarına `aria-label` + görünür proje sayacı.
  - Hero görselinin `alt`'ı `"Uras"` yerine açıklayıcı metne çevrildi; proje
    görselleri `"<proje adı> projesinin ekran görüntüsü"` aldı.
  - Tüm dekoratif `.deco` süsleri ve react-icons ikonları `aria-hidden`.
  - `<footer>` `<main>`'in dışına çıkarıldı (landmark hatasıydı).
  - Skills ikon rengi CSS'e devredildi — **JS ikonu sarı zemin üzerinde beyaz
    çiziliyordu ve neredeyse görünmüyordu.**
  - `İçeriğe geç` (skip link) eklendi.

- **Klavye:** `:focus-visible` ile 3px'lik odak halkası tanımlandı (önceden
  hiçbir odak stili yoktu). Fare tıklamasında halka çıkmıyor. Carousel klavyeyle
  gezilebiliyor (test edildi: Enter ile sayaç 1/3 → 2/3).

- **Responsive — 3 breakpoint doğrulandı** (375 / 768 / 1440 px), gerçek
  tarayıcıda ölçüldü. İki gerçek hata bulundu ve düzeltildi:
  1. **Mobil yatay taşma:** `column-reverse` + `align-items: center`
     birleşince `.hero__text` 666px'lik `max-width`'ine kadar açılıp viewport'u
     taşırıyordu.
  2. **Tablette carousel oku ekran dışında:** 768px'te iki proje kartı yan yana
     sığmadığı için sağdaki ok viewport'un 58px dışına taşıyordu — proje grid'i
     ≤960px'te tek sütuna indirildi.

     Ayrıca tablet aralığı için hiç kural yoktu (960 ve 640 vardı, arası boştu);
     bölüm başlığı boyutları, profil grid'indeki 200px sabit boşluk ve
     header/skill kartı ölçüleri bu aralık için ayarlandı.

- **Geçişler:** Kart hover'ı (yukarı kayma + gölge), sosyal ikon hover'ı,
  carousel ok hover'ı, footer link hover'ı, tema geçişi — hepsi 150/250 ms'lik
  ortak token'larla. `prefers-reduced-motion: reduce` tanımlıysa tüm
  animasyonlar kapanıyor.

- **Skeleton / loading:** Proje kart görselleri yüklenene kadar shimmer
  animasyonlu skeleton gösteriyor (önbellekten gelen görseller için `complete`
  kontrolü ve `onError` fallback'i de var). Dil değişimi sürerken içerik
  hafifçe nabız atıyor ve butonda dönen bir gösterge çıkıyor.

### Ek olarak yapılan (promptta yoktu ama gerçek bir sorundu)

- **Proje görselleri 9.2 MB → 196 KB.** `difod.jpg` 3.9 MB / 3812 px,
  `otocore.jpg` 4.7 MB / 2816 px idi — 500 px genişliğindeki kartlarda
  gösteriliyorlardı. 1000 px genişliğe (retina için 2×) yeniden boyutlandırıldı.
  **Orijinaller git geçmişinde duruyor**, geri alınabilir.
- `src/App.css` içinde iki kez tanımlanmış `.theme-toggle__knob` bloğunun ilki
  (ölü kod) silindi.

---

## 3. Senin manuel yapman gerekenler — checklist

Her maddede **nerede**, **ne yapılacak** ve **nasıl doğrulanacak** yazıyor.
Doğrulama komutları proje kökünden çalıştırılır; hepsi bir şey bulmazsa madde
tamamlanmış demektir.

### 🔴 Öncelikli — canlıya almadan önce

- [ ] **P1. Gerçek domain'i yaz.**
  - **Nerede:** `index.html` (`canonical`, `og:url`, `og:image`,
    `twitter:image`, JSON-LD `url` + `image`) · `README.md` (Live Demo satırı)
  - **Not:** Domain bir env değişkeni **değil** — `index.html` statik olduğu
    için `VITE_SITE_URL` hiçbir yerde okunamıyordu ve ölü kod olarak
    kaldırıldı (bkz. §3d). Değerleri doğrudan `index.html`'e yaz.
  - **Doğrula:** aşağıdaki komut **hiçbir şey döndürmemeli**
    ```bash
    grep -rn "fsweb-portfolio.vercel.app" index.html README.md
    ```
  - **Sonrasında:** JSON-LD değiştiği için `npm run build && npm run csp:sync`

- [ ] **P2. OtoCore'un placeholder app linkini düzelt.**
  - **Nerede:** `src/data/content.json` → `items[0].app` şu an
    `"https://vercel.com/"` (gerçek uygulama değil)
  - **Ne yap:** doğru URL'i yaz, yoksa alanı ve karttaki "Uygulamaya Git"
    linkini kaldır
  - **Doğrula:** çıktı boş olmalı
    ```bash
    grep -n '"app": "https://vercel.com/"' src/data/content.json
    ```

- [ ] **P3. Deploy ortamında env değişkenlerini tanımla.**
  - **Nerede:** Vercel → Settings → Environment Variables · Netlify → Site
    settings → Environment variables
  - **Ne yap:** `.env.example`'daki tüm anahtarları gir (`.env` repoya
    girmediği için build'de tanımsız kalırlar; varsayılana düşerler ama açıkça
    tanımlamak doğrusu)
  - **Doğrula:** deploy log'unda `[env] ... tanımlı değil` uyarısı olmamalı

- [ ] **P4. Deploy sonrası güvenlik header'larını doğrula.**
  - **Doğrula:** https://securityheaders.com → domain'i gir → **A veya üzeri**
    beklenir. Tarayıcı konsolunda CSP ihlali görünmemeli.

### 🟡 İkincil — canlıya aldıktan sonra

- [ ] **S1. Blog linkine karar ver.**
  - **Durum:** Footer'daki ölü `href="#"` linki kaldırıldı; artık
    `VITE_BLOG_URL` doluysa render ediliyor, boşsa hiç görünmüyor.
  - **Ne yap:** blogun varsa `.env`'e yaz; yoksa **bir şey yapma** (bu madde
    zaten tamam sayılır).

- [ ] **S2. OG görselini tasarla.**
  - **Durum:** `public/og-image.jpg` şu an sadece portre fotoğrafının 1200×630
    tuvale ortalanmış hali — teknik olarak geçerli ama tasarım değil.
  - **Ne yap:** isim + unvan içeren bir kart tasarla, aynı ada 1200×630 olarak
    kaydet.
  - **Doğrula:** boyut korunmalı
    ```bash
    sips -g pixelWidth -g pixelHeight public/og-image.jpg
    ```

- [ ] **S3. `reqres.in` kod yolunu tamamen kaldırmayı değerlendir.**
  - **Durum:** İstek bir bootcamp gereksinimiydi, gerçek işlevi yok ve anahtar
    iptal edildiği için varsayılan olarak hiç atılmıyor (bkz. §3b).
  - **Ne yap:** ödev artık teslim edilmeyecekse `apiClient.js`,
    `changeLanguage` içindeki try/catch ve ilgili env değişkenleri silinebilir;
    `axios` bağımlılığı da kalkar.

- [ ] **S4. Testleri yaz.** Bkz. §4 madde 1 — şu an hiç test yok.
  - **Doğrula:** `npm test` komutu var olmalı ve geçmeli.

### ✅ Kapatılan maddeler

Bu maddeler önceki raporda "senin yapman gerekenler" listesindeydi, artık
tamamlandı — bilgi amaçlı bırakıldı:

- [x] ~~**JSON-LD'yi düzenlersen CSP hash'ini elle yenile.**~~
      **Otomatikleştirildi.** `npm run csp:sync` hash'i hesaplayıp `vercel.json`
      + `netlify.toml`'a yazar; `npm run csp:check` senkron değilse hata verir
      ve CI'da çalışır. Ayrıntı: §3c.
- [x] ~~**`.DS_Store` dosyalarını `git rm --cached` ile takipten çıkar.**~~
      **Gerekmiyordu — önceki raporda hatalı bilgi vardı.** Bu dosyalar diskte
      var ama git index'inde **hiç bulunmadılar** ve `.gitignore` tarafından
      zaten dışlanıyorlar. Doğrulama:
      ```bash
      git ls-files | grep DS_Store   # çıktı boş
      ```
- [x] ~~**`claude-code-prompt.md`'yi sil veya bırak.**~~
      Takipten çıkarıldı (`git rm --cached`) ve `.gitignore`'a eklendi. Dosya
      diskte duruyor, repoya girmiyor.

---

## 3b. Ek düzeltme — dil değişimindeki hata uyarısı

**Belirti:** Dil her değiştirildiğinde "Dil sunucuya bildirilemedi" hata toast'ı
ve konsolda `401` hatası çıkıyordu.

**Kök neden — kodda değil, dış serviste:** `reqres.in`'in ücretsiz demo anahtarı
`reqres-free-v1` servis tarafında iptal edilmiş. Doğrulama:

| Test | Sonuç |
|---|---|
| Tarayıcı isteği `x-api-key: reqres-free-v1` başlığını gönderiyor mu? | Evet — başlık istekte mevcut |
| reqres.in yanıtı | `401 {"error":"missing_api_key"}` |
| Aynı anahtarla reqres.in'in kendi `/api/users` endpoint'i | Yine **401** → endpoint'e özel değil, anahtar geçersiz |
| CORS preflight (`OPTIONS`) | `204`, `access-control-allow-headers` içinde `x-api-key` var → CORS sorunu değil |

Anahtar orijinal kodda da hardcoded'dı; sorun bu turdaki değişikliklerden
gelmiyor, servis politikası değişmiş.

**Uygulanan çözüm:** İstek artık **koşullu**. `VITE_API_KEY` boşsa
(`isLanguageApiEnabled === false`) ağa hiç çıkılmıyor; dil zaten tamamen
istemci tarafında değiştiği için işlem doğrudan başarılı sayılıyor ve success
toast'ı gösteriliyor. `.env` varsayılanı **boş** olarak ayarlandı.

**İsteği geri açmak istersen:** app.reqres.in/api-keys adresinden kendi
anahtarını al, `.env` içindeki `VITE_API_KEY`'e yaz — kod yolu olduğu gibi
duruyor, timeout ve hata yönetimiyle birlikte tekrar devreye girer.
(Doğrulandı: anahtar tanımlıyken istek yeniden atılıyor.)

---

## 3c. CSP hash kırılganlığının giderilmesi

**Sorun:** `index.html`'deki inline JSON-LD bloğunun sha256 hash'i CSP
`script-src` içinde elle tutuluyordu. Bloktaki **tek bir karakter** bile
(boşluk dahil) hash'i geçersiz kılıyor, tarayıcı JSON-LD'yi blokluyor ve
**bu sessizce oluyor** — build geçer, lint geçer, sayfa açılır, sadece
yapılandırılmış veri arama motorlarına ulaşmaz. Bu oturumda bir kez gerçekten
kırıldı (`index.html` düzenlendiğinde).

### Neden JSON-LD harici dosyaya taşınamıyor

İlk akla gelen çözüm — bloğu `public/structured-data.json`'a taşıyıp
`<script type="application/ld+json" src="...">` ile bağlamak — **çalışmıyor**:
HTML spesifikasyonu `src` özniteliğini yalnızca çalıştırılabilir script
tipleri için işler; `application/ld+json` için dosya hiç fetch edilmez.
JSON-LD'yi JS ile runtime'da enjekte etmek de arama motoru güvenilirliğini
düşürür. Bu yüzden **inline kalması gerekiyor** ve tek geçerli çözüm hash'in
otomatikleştirilmesi.

### Uygulanan çözüm: `scripts/csp-hash.mjs`

```bash
npm run csp:sync     # hash'i hesaplar, vercel.json + netlify.toml'a yazar
npm run csp:check    # senkron değilse hata verir (exit 1) — CI kullanıyor
```

Script:
- `dist/index.html`'i (servis edilen gerçek dosya) okur, yoksa kaynak
  `index.html`'e düşer ve bunu bildirir
- `src` özniteliği **olmayan** tüm inline `<script>` bloklarını bulur — yani
  ileride JSON-LD dışında inline script eklenirse o da otomatik kapsanır
- Her biri için sha256 üretir, `script-src 'self' 'sha256-…' …` direktifini
  iki config dosyasında da yeniden yazar
- Dosyaları metin olarak düzenler, böylece JSON/TOML biçimlendirmesi bozulmaz

`.github/workflows/ci.yml` içine **CSP hash senkron mu?** adımı eklendi:
`index.html` düzenlenip `csp:sync` çalıştırılmadıysa PR kırmızıya döner.
Adım **Build'den sonra** çalışır — böylece script kaynak `index.html`'i değil,
gerçekten servis edilen `dist/index.html`'i okur.

### Hata davranışı (test edildi)

| Senaryo | Davranış |
|---|---|
| Config'te `script-src 'self'` kalıbı bulunamıyor (format değişti) | **Gürültülü hata**, `exit 1`, hangi dosya olduğunu söyler |
| Config dosyası hiç yok | **Gürültülü hata**, `exit 1` |
| Hash güncel değil | **Gürültülü hata**, `exit 1` + `csp:sync` önerisi |
| `<script>` / `</script>` sayısı tutmuyor veya inline script ayrıştırılamıyor | **Gürültülü hata**, `exit 1`, **config'e hiçbir şey yazılmaz** |

Son satır sonradan eklendi çünkü gerçek bir açık vardı: `</script>` kapanışı
bozulduğunda (ör. `</scrpt>`) regex bir sonraki kapanışa kadar **yanlış bir
aralığı** eşleştirip geçerli görünen ama tamamen hatalı bir hash üretiyordu.
`csp:sync` bunu config'e yazıyor, sonraki `csp:check` **yeşil** kalıyor ve
tarayıcı gerçek script'i blokluyordu — yani hata tam da engellemeye çalıştığımız
şekilde sessizce geçiyordu. Artık script açılış/kapanış etiketi sayılarını
karşılaştırıp tutarsızlıkta config'e **dokunmadan** çıkıyor.

**Doğrulandı:** `index.html`'deki JSON-LD kasten değiştirildi →
`csp:check` exit **1** verip iki dosyayı da bildirdi → `csp:sync` düzeltti →
`csp:check` exit **0**. Ardından değişiklik geri alındı.

`netlify.toml` içindeki eski "elle şu komutu çalıştır" notu, script'e işaret
eden ve **elle düzenleme** uyarısı veren bir notla değiştirildi.

---

## 3d. Ölü kod taraması

CSS sınıfları, CSS değişkenleri, `content.json` metin anahtarları, `env`
alanları, kaynak dosya import'ları ve `public/` varlıkları tarandı.

### Kaldırılanlar

| Ne | Nerede | Neden ölüydü |
|---|---|---|
| `toast` bloğu (3 çeviri çifti) | `content.json` | `LanguageContext` toast metinlerini satır içi yazıyor, `t.toast.*` **hiç** okunmuyordu. Bu tur öncesinden kalma. |
| `error.title`, `error.message`, `error.retry`, `error.reload` | `content.json` | **Yapısal olarak** ulaşılamaz: `ErrorBoundary` bilerek `LanguageProvider`'ın dışında duruyor, bu yüzden context'e erişemiyor ve metinlerini kendi `TEXT` sabitinden alıyor. `NotFound` yalnızca `notFoundTitle` / `notFoundMessage` / `goHome` kullanıyor. |
| `env.siteUrl` + `VITE_SITE_URL` | `env.js`, `.env`, `.env.example`, `ci.yml` | 0 kullanım. `index.html` statik olduğu için domain'i JS env'inden okuyamıyor — değişkeni doldurmak hiçbir şeye yaramıyordu (yanıltıcı config). |
| `env.isDev` alanı | `env.js` | Dışa verilen alan hiç okunmuyordu (modül içindeki yerel `isDev` değişkeni kullanımda, o kaldı). |
| `public/icons.svg` (5 KB) | `public/` | İlk commit'ten kalma SVG sprite (bluesky vb. ikonlar). Proje `react-icons` kullanıyor; dosya hiçbir yerden referans edilmiyordu. |

### Ölü sanılıp korunanlar (yanlış pozitifler)

- `.icon--js`, `.icon--react`, … ve `.project-card--blue/green/red` — sınıf
  adları template literal ile üretiliyor (`` `icon--${skill.id}` ``), statik
  aramada görünmüyorlar.
- `.Toastify__toast`, `.Toastify__close-button` — react-toastify'a ait.
- `--color-accent-2` — `App.css`'te `.deco--ring-pink` içinde kullanımda.
- Tüm CSS custom property'leri kullanımda (0 ölü değişken).
- Hiçbir kaynak dosya yetim değil.

### Bilerek dokunulmayan

`status` state'i yalnızca `"loading"` için okunuyor; `setStatus("success")` ve
`setStatus("error")` yazılıyor ama bu değerler hiçbir yerde karşılaştırılmıyor.
Teknik olarak inert, ama context'in dışa açık durum makinesini temsil ediyor ve
maliyeti yok — kaldırmak niyeti gizler. Bırakıldı.

### Doğrulama

`build` ✅ · `lint` ✅ · `csp:check` ✅ · tarayıcıda ana sayfa, dil değişimi ve
404 ekranında `undefined` izi ve konsol hatası yok ✅

`ErrorBoundary` ayrıca **çalıştırılarak** doğrulandı: `Skills` bileşenine geçici
bir `throw` eklendi, kurtarma ekranı doğru TR metinleriyle ("Bir şeyler ters
gitti" + iki buton) render edildi, ardından değişiklik geri alındı.

### Dosya / asset / klasör taraması

Ölü kod taramasının ardından dosya düzeyinde ayrı bir tarama yapıldı: diskteki
her dosya referans açısından, her bağımlılık import açısından, git geçmişi ise
yanlışlıkla commit'lenmiş artifact açısından kontrol edildi.

**Kaldırılan:** 3 adet `.DS_Store` (kök, `src/`, `src/assets/`) — macOS
artığı, `.gitignore`'da zaten dışlanmışlardı ama diskte duruyorlardı.

**Kaldırılmayan, çünkü hepsi kullanımda:**

| Kategori | Sonuç |
|---|---|
| `src/assets/*.jpg` (4 görsel) | Hepsi birer `import` ile kullanılıyor |
| `public/favicon.svg`, `public/og-image.jpg` | İkisi de `index.html`'de referanslı |
| `dependencies` (5 paket) | Hepsi import ediliyor (`axios`, `react`, `react-dom`, `react-icons`, `react-toastify`) |
| Kaynak dosyalar (24 adet) | Yetim dosya yok |
| `.github/`, `scripts/`, `public/` | Hepsi kullanımda |

**Bilerek dokunulmayanlar:**

- **`@types/react` + `@types/react-dom`** — projede hiç TypeScript yok, ama VS
  Code'un JS dil servisi bu paketleri plain JS dosyalarında da IntelliSense
  için okuyor. Silmek editörde React API otomatik tamamlamasını bozar; kazancı
  yok, maliyeti var. Kaldı.
- **`dist/`** — build çıktısı, `.gitignore`'da, `npm run build` ile yeniden
  üretiliyor. Vite her build'de klasörü temizlediği için eski hash'li dosya
  birikmiyor.
- **`claude-code-prompt.md`** — senin brief'in. Takipten çıkarıldı, diskte
  bırakıldı; silme kararı sende.

**Git geçmişi (bilgi amaçlı, aksiyon alınmadı):** `dist/` ve `node_modules/`
hiç commit'lenmemiş ✅. Ancak `.git` klasörü **10 MB** — bunun ~8.3 MB'ı
görseller küçültülmeden önceki hallerinden geliyor (`otocore.jpg` 4.5 MB,
`difod.jpg` 3.8 MB). Bunu temizlemek geçmişi yeniden yazmayı gerektirir
(`git filter-repo` + force push); klonlanmış kopyaları bozacağı için
yapılmadı. 10 MB'lık bir repo pratikte sorun değil.

---

## 4. Sıradaki önerilen adımlar

1. **Test yazımı.** Şu an hiç test yok. `vitest` + `@testing-library/react` ile
   başlanacak en değerli yerler: `useLocalStorage` (bozuk veri senaryoları),
   `localize()` fonksiyonu, `LanguageContext`'in API hatası davranışı,
   `ErrorBoundary`. CI'a `npm test` adımı eklenir.
2. **Erişilebilirlik regresyon testi.** `vitest-axe` veya Playwright +
   `@axe-core/playwright` ile 375/768/1440'ta otomatik a11y taraması — bu
   turda bulunan hataların (isimsiz buton, düşük kontrast) tekrar sızmasını
   engeller.
3. **Lighthouse CI.** `treosh/lighthouse-ci-action` ile her PR'da performans /
   a11y / SEO skoru eşiği. Görseller küçültüldü ama JS bundle'ı hâlâ 100 KB
   gzip — `react-icons` ağaç sallamayla ne kadar iniyor bakmaya değer.
4. **i18next'e geçiş.** Mevcut `{ tr, en }` + `localize()` yaklaşımı ödev
   gereğiydi ve çalışıyor, ama çoğullaştırma, tarih/sayı biçimlendirme, lazy
   yüklenen çeviri dosyaları ve eksik anahtar tespiti yok. İçerik büyüdükçe
   `i18next` + `react-i18next` mantıklı olur.
5. **TypeScript'e taşıma.** `@types/react` zaten kurulu. Kademeli geçiş:
   önce `src/utils/` ve `src/hooks/`, sonra context'ler, en son bileşenler.
   `content.json` için üretilen tipler, çeviri anahtarı hatalarını derleme
   zamanında yakalar.
6. **`react-router` eklemek.** Şu anki 404 çözümü `window.location.pathname`
   kontrolüne dayanıyor — çalışıyor ama gerçek bir router'la proje detay
   sayfaları, blog vb. eklenebilir hale gelir.
7. **Fontları self-host etmek.** Google Fonts'a olan iki dış bağımlılık
   kalkarsa CSP'den `fonts.googleapis.com` / `fonts.gstatic.com` istisnaları
   silinebilir ve ilk yükleme hızlanır.
8. **Görselleri modern formata çevirmek.** `.jpg` yerine `.webp`/`.avif` +
   `<picture>` ile 196 KB daha da inebilir.

---

## 5. Performans sprint'i (2 Ağustos 2026)

Ölçülen sonuç — yavaş 4G (1.6 Mbps / 150 ms) + 4× CPU kısıtlama altında, iki
sürüm aynı anda, baytlar CDP `Network` olaylarıyla sayılarak:

| | Önce (`288fee2`) | Sonra | Fark |
|---|---|---|---|
| Toplam transfer | 403 kB | **265 kB** | **−138 kB (%34)** |
| LCP | 1284 ms | **1024 ms** | −260 ms (%20) |
| Üçüncü parti istek | 4 | **0** | |
| JS bundle (gzip) | 99.3 kB | **84.1 kB** | −15.2 kB |
| CLS | 0.0301 | 0.0288 | ~aynı |
| axe-core ihlali | 0 | 0 | regresyon yok |

### 6.1 Fontlar self-host edildi

Inter + Playfair Display woff2 dosyaları `src/assets/fonts/`'a alındı,
`@font-face` tanımları `index.css`'e yazıldı, `index.html`'deki Google Fonts
`<link>` ve `preconnect`'leri silindi.

İki şey ölçümle ortaya çıktı:

1. **Google değişken font (variable font) sunuyor.** 400/500/600/700 için
   indirilen 14 dosyanın checksum'ları karşılaştırıldığında yalnızca **4
   benzersiz dosya** olduğu görüldü. Bu yüzden `font-weight` tek değer değil
   **aralık** (`400 700`) olarak yazıldı; 14 dosya yerine 4 dosya duruyor.
   Doğrulandı: 400/500/600/700 farklı genişlikte render ediliyor
   (451.25 / 455.19 / 459.13 / 463.05 px) — yani gerçekten değişken font.

2. **Google'ın `latin-ext` alt kümesi aşırı büyüktü.** Inter için tek başına
   85 kB ve içinde Vietnamca'dan fonetik alfabeye kadar her şey vardı; bu
   sitenin ihtiyacı birkaç Türkçe karakter. `fontTools` ile Latin Extended-A
   aralığına alt kümelendi:

   | Dosya | Önce | Sonra |
   |---|---|---|
   | `inter-latin-ext.woff2` | 85.3 kB | **21.7 kB** (−%74) |
   | `playfair-latin-ext.woff2` | 21.0 kB | **15.2 kB** (−%27) |

   `unicode-range` de aynı aralığa daraltıldı — **bu kritik**: font dosyasında
   olmayan bir karakteri `unicode-range` iddia ederse tarayıcı dosyayı indirip
   tofu gösterir.

   Doğrulandı: sayfadaki tüm ASCII dışı karakterler (Ü ç ö ü ğ İ ı Ş ş) canvas
   ölçümüyle test edildi, hepsi Inter ile çiziliyor, fallback'e düşen yok.
   (👋 emoji sistem fontundan geliyor — beklenen davranış.)

**Kazanç:** performans + CSP'den iki dış origin istisnasının kalkması +
ziyaretçi IP'sinin Google'a gitmemesi (bkz. shores.md §1.3, GDPR).

### 6.2 axios kaldırıldı → `fetch`

`axios` bağımlılığı silindi, `apiClient.js` `fetch` + `AbortSignal.timeout()`
ile yeniden yazıldı. Ölçülen kazanç: **−15.2 kB gzip**.

**Neden tamamen silmek yerine `fetch`:** shores.md §1.1 üç seçenek sunuyordu.
A (kod yolunu tamamen sil) önerilmişti ama bootcamp ödevinin API isteği
gereksinimini geri dönüşsüz olarak yok ederdi. B seçeneği (fetch'e geçmek)
**aynı 15 kB kazancı** veriyor ve özellik yapılandırıldığında çalışmaya devam
ediyor — belirsizlik altında geri alınabilir olan tercih edildi.

Doğrulandı: `VITE_API_KEY` tanımlıyken istek gerçekten atılıyor
(`x-api-key` başlığı gidiyor, 403 dönüyor çünkü anahtar sahte), hata düzgün
yakalanıyor, dil yine değişiyor. Anahtar boşken ağa hiç çıkılmıyor.

`axios.isAxiosError(e) && e.code === "ECONNABORTED"` yerine
`e.name === "TimeoutError"` kullanılıyor; `fetch` 4xx/5xx'te reddetmediği için
`HttpError` sınıfı eklendi.

### 6.3 Görseller WebP'ye çevrildi

4 görsel `cwebp -q 80` ile dönüştürüldü, `.jpg` dosyaları silindi, import'lar
güncellendi. Disk üzerinde 324.5 kB → 127.0 kB.

`public/og-image.jpg` **bilerek JPEG bırakıldı** — LinkedIn/WhatsApp gibi
sosyal medya crawler'ları WebP'yi güvenilir işlemiyor.

İlk yüklemedeki etkisi: hero görseli 128.6 kB → 66.1 kB.

### 6.4 Sistem teması dinleniyor

İlk ziyarette `prefers-color-scheme` okunuyor. Kullanıcı toggle'a bastığı an
tercihi kaydediliyor ve bundan sonra sistem tercihini eziyor.

`useLocalStorage`'a `useState` gibi **lazy initializer** desteği eklendi —
`matchMedia` yalnızca kayıtlı değer yoksa/geçersizse okunuyor.

Doğrulandı: sistem dark → site dark ✅ · sistem light → site light ✅ ·
sistem dark + kayıtlı tercih light → site light ✅ (kullanıcı kazanıyor).

### 6.5 CSP sıkılaştırıldı

Fontlar self-host edildiği için dış origin istisnaları silindi:

```diff
- style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
- font-src 'self' https://fonts.gstatic.com;
+ style-src 'self' 'unsafe-inline';
+ font-src 'self';
+ frame-src 'none'; worker-src 'none'; media-src 'none';
```

`connect-src`'te `https://reqres.in` **kaldı**, çünkü §6.2'de özellik korundu —
anahtar tanımlanırsa istek çalışmalı.

`style-src 'unsafe-inline'` hâlâ duruyor (react-toastify runtime'da inline
stil yazıyor). shores.md §2.1'de ele alınıyor, bu sprint'in kapsamında değildi.

---
