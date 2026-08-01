import { Component } from "react";
import { logError } from "../utils/env";

// Bu bileşen bilerek LanguageProvider'ın DIŞINDA duruyor: provider'ların
// kendisi patlarsa da bir şey gösterebilmesi gerekiyor. Bu yüzden context'e
// bağlı değil, metinleri kendi içinde taşıyor.
const TEXT = {
  tr: {
    title: "Bir şeyler ters gitti",
    message: "Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyebilirsin.",
    retry: "Tekrar dene",
    reload: "Sayfayı yenile",
    details: "Teknik detay",
  },
  en: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Try reloading the page.",
    retry: "Try again",
    reload: "Reload page",
    details: "Technical details",
  },
};

function readLang() {
  if (typeof window === "undefined") return "tr";
  try {
    const stored = JSON.parse(window.localStorage.getItem("lang"));
    return stored === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Production'da konsola stack basılmaz; burası gerçek bir hata izleme
    // servisine (Sentry vb.) bağlanacak nokta.
    logError("ErrorBoundary bir hata yakaladı:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const t = TEXT[readLang()];

    return (
      <div className="fallback" role="alert">
        <div className="fallback__inner">
          <h1 className="fallback__title">{t.title}</h1>
          <p className="fallback__message">{t.message}</p>
          <div className="fallback__actions">
            <button type="button" className="fallback__button" onClick={this.handleRetry}>
              {t.retry}
            </button>
            <button
              type="button"
              className="fallback__button fallback__button--ghost"
              onClick={this.handleReload}
            >
              {t.reload}
            </button>
          </div>
          {import.meta.env.DEV && (
            <details className="fallback__details">
              <summary>{t.details}</summary>
              <pre>{String(error?.stack || error)}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
