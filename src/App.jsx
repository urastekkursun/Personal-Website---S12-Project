import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./components/NotFound";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Profile from "./components/Profile";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import SkipLink from "./components/SkipLink";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Router yok; barındırma tarafındaki SPA rewrite'ı her path'i index.html'e
// düşürüyor. Kök dışındaki bir adres açıldığında sessizce ana sayfayı
// göstermek yerine açık bir 404 deneyimi veriyoruz.
function isHomePath() {
  if (typeof window === "undefined") return true;
  const base = import.meta.env.BASE_URL || "/";
  const path = window.location.pathname;
  return path === base || path === `${base}index.html` || path === "/";
}

function Page() {
  const { status } = useLanguage();
  const isSwitching = status === "loading";

  return (
    <>
      <SkipLink />
      {/* Dil isteği sürerken içerik hafifçe nabız atar (skeleton hissi) */}
      <div className="page" aria-busy={isSwitching}>
        <main id="main-content">
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

function App() {
  const notFound = !isHomePath();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          {notFound ? <NotFound /> : <Page />}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
