import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import usePageMeta from "./hooks/usePageMeta";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import CaseStudy from "./components/CaseStudy";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Profile from "./components/Profile";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import SkipLink from "./components/SkipLink";
import { parsePath } from "./routes";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/**
 * Route değişiminde odağı içeriğe alıp sayfayı başa sarar.
 *
 * `rest` (dilsiz route) üzerinden karşılaştırıyor: TR→EN geçişi URL'i
 * değiştirir ama SAYFA aynıdır — profil bölümünü okurken dili değiştiren
 * ziyaretçiyi sayfa başına fırlatmak istemiyoruz.
 */
function RouteTransition({ routeKey }) {
  const previous = useRef(routeKey);

  useEffect(() => {
    if (previous.current === routeKey) return;
    previous.current = routeKey;

    document.getElementById("main-content")?.focus();
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [routeKey]);

  return null;
}

function Home() {
  const { t } = useLanguage();
  usePageMeta(t.meta.title, t.meta.description, t.meta.ogDescription);

  return (
    <>
      <SkipLink />
      <div className="page">
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <Skills />
          <Profile />
          <Projects />
        </main>
        <Footer />
      </div>
    </>
  );
}

/**
 * Dil boyutu route ağacının ÜSTÜNDE çözülüyor, içinde değil.
 *
 * Neden: `/` ve `/en` ayrı `<Route>` dalları olsaydı dil değiştirmek tüm
 * ağacı unmount/mount ederdi. DOM bir an çöktüğü için tarayıcı scroll
 * konumunu sıfırlıyordu — ziyaretçi projeleri okurken dili değiştirdiğinde
 * sayfa başına fırlıyordu. Burada dil ön eki path'ten ayrılıp `<Routes>`'a
 * yalnızca dilsiz kısım veriliyor: `/` ve `/en` AYNI eşleşmeyi ürettiği için
 * React bileşenleri korur, sadece içerik güncellenir.
 *
 * Yan fayda: route'lar dilden bağımsız tanımlanıyor — Grup 2'de eklenecek
 * vaka sayfaları iki dile birden otomatik açılacak.
 */
function LocalizedRoutes() {
  const location = useLocation();
  const { lang, rest } = parsePath(location.pathname);

  return (
    <LanguageProvider lang={lang}>
      <RouteTransition routeKey={rest} />
      {/* Route'lar KANONİK adla tanımlı. URL'deki dile özgü segment
          (`/vaka/...` ↔ `/en/case/...`) parsePath tarafından buraya
          gelmeden önce çevriliyor — bkz. src/routes.js */}
      <Routes location={{ ...location, pathname: rest }}>
        <Route path="/" element={<Home />} />
        <Route path="/case/:slug" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <LocalizedRoutes />
        </BrowserRouter>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
