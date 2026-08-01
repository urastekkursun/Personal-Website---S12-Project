# Kişisel Web Sitesi — Uras Tekkursun

Workintech FSWeb Frontend Sprint Challenge kapsamında başlayan, sonrasında
canlıya alınabilir bir kişisel portfolyo sitesine dönüştürülen React + Vite
projesi.

## Live Demo

- **Canlı site:** https://fsweb-portfolio.vercel.app _(TODO: gerçek domain ile değiştir — bkz. [IMPROVEMENTS.md](IMPROVEMENTS.md))_
- **GitHub:** https://github.com/urastekkursun/Personal-Website---S12-Project

## Kullanılan Teknolojiler

- React 19 + Vite
- Context API (`ThemeContext`, `LanguageContext`) — global state yönetimi
- Axios — dil değişimi bildirimi (POST), timeout'lu
- react-toastify — istek sonucunda success / error geri bildirimi
- Custom `useLocalStorage` hook — tema ve dil tercihini kalıcı hale getirmek için
- CSS Custom Properties — dark/light tema geçişi
- oxlint — linting

## Klasör Yapısı

```
src/
  components/   -> Header, Hero, Skills, Profile, Projects, ProjectCard,
                   Footer, ErrorBoundary, NotFound, SkipLink
  context/      -> ThemeContext.jsx, LanguageContext.jsx
  hooks/        -> useLocalStorage.js
  data/         -> content.json  (TR/EN statik içerik, { tr, en } alanları)
  utils/        -> localize.js, env.js, apiClient.js
```

## Nasıl Çalıştırılır

```bash
npm install
cp .env.example .env   # değerleri kendine göre düzenle
npm run dev
```

Diğer komutlar:

```bash
npm run lint       # oxlint
npm run build      # production build
npm run preview    # build çıktısını yerelde servis et
npm run csp:sync   # index.html'i değiştirdiysen CSP hash'ini güncelle
npm run csp:check  # CSP hash'i senkron mu? (CI bunu çalıştırır)
```

> `index.html` içindeki inline JSON-LD bloğunu düzenlersen
> `npm run build && npm run csp:sync` çalıştır — aksi halde tarayıcı bloğu
> CSP nedeniyle bloklar. CI bunu unutursan yakalar.

## Ortam Değişkenleri

Tüm değişkenler `.env.example` içinde açıklamalarıyla listeli. `.env` dosyası
git'e **girmez**; deploy ortamında (Vercel/Netlify panelinde) ayrıca tanımlanmalı.

> ⚠️ `VITE_` ön ekli değişkenler build çıktısına gömülür ve tarayıcıdan
> okunabilir. Buraya gerçek gizli anahtar konmamalı.

## Deploy

Repoda hem `vercel.json` hem `netlify.toml` hazır — ikisi de SPA rewrite'ı,
güvenlik header'larını (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` …) ve statik asset cache'ini tanımlar.

### Vercel

1. GitHub'da repo'yu push et.
2. [vercel.com](https://vercel.com) → **Add New Project** → repo'yu import et.
3. Framework Preset: **Vite** (otomatik algılanır).
4. Settings → Environment Variables → `.env.example`'daki değişkenleri gir.
5. Deploy sonrası README'deki Live Demo linkini ve `index.html`'deki
   `canonical` / `og:url` değerlerini güncelle.

### Netlify

`netlify.toml` build komutunu ve publish dizinini zaten tanımlıyor; repo'yu
bağlaman yeterli. Env değişkenlerini Site settings → Environment variables
altından gir.

Deploy sonrası header'ları https://securityheaders.com üzerinden doğrula.

## CI

`.github/workflows/ci.yml` her push ve PR'da Node 20 ve 22 üzerinde
`npm ci` → `npm run lint` → `npm run build` çalıştırır, ayrı bir job'da
`npm audit --audit-level=high` ile bağımlılık açıklarını kontrol eder.
Dependabot haftalık olarak npm ve GitHub Actions güncellemelerini açar.

## Notlar

- Yapılan iyileştirmelerin tam dökümü ve kalan TODO'lar için:
  **[IMPROVEMENTS.md](IMPROVEMENTS.md)**
- i18n için harici bir kütüphane (i18next vb.) **kullanılmadı** — talimat gereği
  dil yönetimi Context API üzerinden yapılıyor.
