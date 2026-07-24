import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, status } = useLanguage();
  const isDark = theme === "dark";

  return (
    <header className="site-header">
      <div className="avatar-placeholder"></div>
      <nav className="header-controls">
        <div className="theme-toggle-group">
          <button
            type="button"
            className={`theme-toggle ${isDark ? "is-dark" : ""}`}
            onClick={toggleTheme}
          >
            <span className="theme-toggle__knob">
            <span className="theme-toggle__dot" />
            </span>
          </button>
          <span className="header-label">
            {isDark ? t.nav.lightMode : t.nav.darkMode}
          </span>
        </div>
        <span className="header-divider">|</span>
        <button
          type="button"
          className="lang-switch"
          onClick={toggleLanguage}
          disabled={status === "loading"}
        >
            <span className="lang-switch__target">{t.nav.langTarget}</span>{" "}
            <span className="lang-switch__action">{t.nav.langAction}</span>
        </button>
      </nav>
    </header>
  );
}
