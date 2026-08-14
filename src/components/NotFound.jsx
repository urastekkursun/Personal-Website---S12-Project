import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { homePath } from "../routes";
import usePageMeta from "../hooks/usePageMeta";
import Header from "./Header";

export default function NotFound() {
  const { t, lang } = useLanguage();
  const e = t.error;

  // 404'te sekme başlığı da 404 demeli; aksi halde ziyaretçi sekmelerine
  // bakınca sayfanın açıldığını sanıyor.
  usePageMeta(`${e.notFoundTitle} — ${t.meta.author}`, e.notFoundMessage);

  return (
    <div className="fallback fallback--page">
      <Header />
      {/* Route değişiminde odak buraya taşınıyor (bkz. App.jsx RouteTransition) */}
      <main className="fallback__inner" id="main-content" tabIndex={-1}>
        <p className="fallback__code" aria-hidden="true">404</p>
        <h1 className="fallback__title">{e.notFoundTitle}</h1>
        <p className="fallback__message">{e.notFoundMessage}</p>
        <Link className="fallback__button" to={homePath(lang)}>
          {e.goHome}
        </Link>
      </main>
    </div>
  );
}
