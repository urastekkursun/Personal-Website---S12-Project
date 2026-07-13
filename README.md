# FSWeb Frontend Challenge — Kişisel Web Sitesi

Workintech FSWeb Frontend Sprint Challenge kapsamında geliştirilmiş kişisel portfolyo sitesi.

## Live Demo

- **Canlı site:** https://fsweb-portfolio.vercel.app _(Vercel deploy sonrası güncelle)_
- **GitHub:** https://github.com/USERNAME/fsweb-portfolio _(repo oluşturulduktan sonra güncelle)_

## Kullanılan Teknolojiler

- React + Vite
- Context API (`ThemeContext`, `LanguageContext`) — global state yönetimi
- Axios — reqres.in'e dil değişimi bildirimi (POST)
- react-toastify — API isteği sırasında loading / success / error geri bildirimi
- Custom `useLocalStorage` hook — tema ve dil tercihini kalıcı hale getirmek için
- CSS Custom Properties — dark/light tema geçişi

## Klasör Yapısı

```
src/
  components/   -> Header, Hero, Skills, Profile, Projects, ProjectCard, Footer
  context/      -> ThemeContext.jsx, LanguageContext.jsx
  hooks/        -> useLocalStorage.js
  data/         -> content.json  (TR/EN statik içerik, { tr, en } alanları)
  utils/        -> localize.js
```

## Nasıl Çalıştırılır

```bash
npm install
npm run dev
```

## Deploy (GitHub + Vercel)

1. GitHub'da public repo oluştur ve kodu push et.
2. [vercel.com](https://vercel.com) → **Add New Project** → GitHub repo'yu import et.
3. Framework Preset: **Vite** (otomatik algılanır).
4. Deploy tamamlanınca README'deki Live Demo linkini güncelle.

Alternatif (CLI):

```bash
npm install -g vercel
vercel
```

## Notlar

- `src/data/content.json` içindeki proje/deneyim bilgilerini kendi bilgilerinle güncelle.
- Hero fotoğrafını (`Hero.jsx` içindeki `img src`) kendi fotoğrafınla değiştir.
- i18n için harici bir kütüphane (i18next vb.) **kullanılmadı** — talimat gereği dil yönetimi Context API üzerinden yapılıyor.
