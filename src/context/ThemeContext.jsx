import { createContext, useContext, useEffect, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
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
