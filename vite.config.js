import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { parsePath, outputPath } from './src/routes.js'

/**
 * `vite preview`'ı üretimdeki rewrite sözleşmesiyle aynı hale getirir.
 *
 * Neden gerekli: preview'ın kendi SPA fallback'i her bilinmeyen path'i
 * dist/index.html'e (yani TÜRKÇE ana sayfa kabuğuna) düşürüyor. Bu yüzden
 * `/en` lokalde Türkçe açılıyordu ve vaka sayfaları ana sayfanın meta'sını
 * alıyordu — yani prerender'ın doğru çalışıp çalışmadığını deploy etmeden
 * GÖREMİYORDUK.
 *
 * Kural, vercel.json/netlify.toml'daki sıralamanın davranışsal karşılığı:
 *   1. İstenen adres için prerender edilmiş bir HTML varsa onu ver.
 *   2. Yoksa o adresin DİLİNE ait kabuğa düş (uygulama içi 404 devreye girer).
 */
function previewStaticRoutes() {
  return {
    name: 'preview-static-routes',
    configurePreviewServer(server) {
      const dist = resolve(import.meta.dirname, 'dist')

      server.middlewares.use((req, _res, next) => {
        const [path] = req.url.split('?')

        // Gerçek dosyalar (/assets/..., /favicon.svg, /cv.pdf) dokunulmadan geçer.
        if (/\.[a-z0-9]+$/i.test(path)) return next()

        const clean = path.replace(/\/+$/, '') || '/'
        const candidate = resolve(dist, `.${clean}`, 'index.html')

        // `..` içeren bir path dist dışına çıkmasın.
        if (candidate.startsWith(dist) && existsSync(candidate)) {
          req.url = clean === '/' ? '/index.html' : `${clean}/index.html`
          return next()
        }

        req.url = `/${outputPath('/', parsePath(clean).lang)}`
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), previewStaticRoutes()],
})
