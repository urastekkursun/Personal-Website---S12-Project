import { createContext, useContext, useEffect, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const ThemeContext = createContext(null);

const THEMES = new Set(["light", "dark"]);
const isValidTheme = (value) => THEMES.has(value);

const DARK_QUERY = "(prefers-color-scheme: dark)";

// İlk ziyarette işletim sisteminin tercihini kullan. Kullanıcı toggle'a
// bastığı an tercihi localStorage'a yazılır ve bundan sonra o kazanır.
function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", getSystemTheme, isValidTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Mobil tarayıcıların adres çubuğu rengi tema ile birlikte değişsin.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#14151a" : "#ffffff");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
}, [setTheme]);

const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

return (
  <ThemeContext.Provider value={value}>
    {children}
  </ThemeContext.Provider>
);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme, ThemeProvider içinde kullanılmalı");
  }
  return context;
}
