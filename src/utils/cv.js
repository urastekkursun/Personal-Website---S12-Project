/**
 * İndirilebilir CV'nin adresi.
 *
 * Dosya `public/` altında durur ve build'de olduğu gibi kopyalanır — yani
 * adresi sabit (`/uras-tekkursun-cv.pdf`), hash'lenmez. Ajans sahibi dosyayı
 * birine ilettiğinde linkin bozulmaması için bu bilinçli bir tercih.
 *
 * `content.json` → `cv.file` BOŞ ise link hiç render edilmez. Dolu ama dosya
 * yoksa `scripts/prerender.mjs` build'i durdurur — kırık bir CV linki, hiç
 * link olmamasından kötü.
 */
import content from "../data/content.json";

const file = typeof content.cv?.file === "string" ? content.cv.file.trim() : "";

export const cvUrl = file ? `/${file.replace(/^\/+/, "")}` : "";
export const hasCv = Boolean(cvUrl);
