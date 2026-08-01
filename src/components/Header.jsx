import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, status } = useLanguage();
  const isDark = theme === "dark";
  const isSwitching = status === "loading";

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
        <button
          type="button"
          className="lang-switch"
          onClick={toggleLanguage}
          disabled={isSwitching}
          aria-busy={isSwitching}
        >
            <span className="lang-switch__target">{t.nav.langTarget}</span>{" "}
            <span className="lang-switch__action">{t.nav.langAction}</span>
            {isSwitching && <span className="lang-switch__spinner" aria-hidden="true" />}
        </button>
        {/* Dil değişimi ekran okuyucuya da duyurulsun */}
        <output className="visually-hidden" aria-live="polite">
          {isSwitching ? t.nav.switching : ""}
        </output>
      </nav>
    </header>
  );
}
