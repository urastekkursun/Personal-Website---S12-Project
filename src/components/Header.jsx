import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t, otherLang, switchPath } = useLanguage();
  const isDark = theme === "dark";

  return (
    <header className="site-header">
      <div className="avatar-placeholder" aria-hidden="true"></div>
      <nav className="header-controls" aria-label={t.nav.ariaLabel}>
        <div className="theme-toggle-group">
          <button
            type="button"
            className={`theme-toggle ${isDark ? "is-dark" : ""}`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? t.nav.lightMode : t.nav.darkMode}
          >
            <span className="theme-toggle__knob" aria-hidden="true">
            <span className="theme-toggle__dot" />
            </span>
          </button>
          <span className="header-label" aria-hidden="true">
            {isDark ? t.nav.lightMode : t.nav.darkMode}
          </span>
        </div>
        <span className="header-divider" aria-hidden="true">|</span>
        {/* Butonun değil BAĞLANTInın olması kasıtlı: dil değişimi artık gerçek
            bir adrese gidiyor. Böylece orta tık / yeni sekmede aç çalışıyor ve
            arama motoru crawler'ı iki dil arasındaki ilişkiyi görebiliyor. */}
        <Link
          className="lang-switch"
          to={switchPath}
          hrefLang={otherLang}
          rel="alternate"
          aria-label={t.nav.langSwitchLabel}
        >
          <span className="lang-switch__target">{t.nav.langTarget}</span>{" "}
          <span className="lang-switch__action">{t.nav.langAction}</span>
        </Link>
      </nav>
    </header>
  );
}
