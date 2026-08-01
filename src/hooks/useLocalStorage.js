import { useCallback, useEffect, useRef, useState } from "react";
import { logError } from "../utils/env";

// `window` yoksa (SSR, prerender, test ortamı) veya tarayıcı localStorage'ı
// bloklamışsa (Safari private mode, 3rd-party cookie kısıtı) erişim patlar.
// Bu yüzden storage'a her dokunuş guard + try/catch içinden geçiyor.
function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (error) {
    logError("localStorage erişilebilir değil:", error);
    return null;
  }
}

/**
 * @param {string} key
 * @param {*} initialValue
 * @param {(value: unknown) => boolean} [isValid]
 *   Okunan değeri doğrulayan opsiyonel fonksiyon. Bozuk/beklenmeyen tipteki
 *   veri (ör. elle kurcalanmış `theme: {}`) varsayılana düşer ve temizlenir.
 */
export default function useLocalStorage(key, initialValue, isValid) {
  const validate = useRef(isValid);
  validate.current = isValid;

  const [value, setValue] = useState(() => {
    const storage = getStorage();
    if (!storage) return initialValue;

    let stored;
    try {
      stored = storage.getItem(key);
    } catch (error) {
      logError(`localStorage okunamadı (${key}):`, error);
      return initialValue;
    }

    if (stored === null) return initialValue;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch (error) {
      // Bozuk JSON: kalıcı olarak hatalı state'e düşmemek için kaydı sil.
      logError(`localStorage değeri JSON olarak çözülemedi (${key}):`, error);
      try {
        storage.removeItem(key);
      } catch {
        // temizlik başarısız olsa da varsayılana düşmek yeterli
      }
      return initialValue;
    }

    if (typeof isValid === "function" && !isValid(parsed)) {
      logError(`localStorage değeri geçersiz (${key}):`, parsed);
      try {
        storage.removeItem(key);
      } catch {
        // yoksay
      }
      return initialValue;
    }

    return parsed;
  });

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Kota dolmuş veya yazma engellenmiş olabilir; uygulama çalışmaya devam
      // etsin, sadece tercih kalıcı olmasın.
      logError(`localStorage'a yazılamadı (${key}):`, error);
    }
  }, [key, value]);

  // Aynı siteyi başka bir sekmede açıp tema/dil değiştirince bu sekme de
  // güncellensin.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key !== key || event.newValue === null) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (typeof validate.current === "function" && !validate.current(parsed)) return;
        setValue(parsed);
      } catch (error) {
        logError(`Diğer sekmeden gelen değer çözülemedi (${key}):`, error);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  const setStoredValue = useCallback((next) => {
    setValue(next);
  }, []);

  return [value, setStoredValue];
}
