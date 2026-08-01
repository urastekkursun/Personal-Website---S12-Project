import { useLanguage } from "../context/LanguageContext";
import Header from "./Header";

export default function NotFound() {
  const { t } = useLanguage();
  const e = t.error;

  return (
    <div className="fallback fallback--page">
      <Header />
      <div className="fallback__inner">
        <p className="fallback__code" aria-hidden="true">404</p>
        <h1 className="fallback__title">{e.notFoundTitle}</h1>
        <p className="fallback__message">{e.notFoundMessage}</p>
        <a className="fallback__button" href={import.meta.env.BASE_URL}>
          {e.goHome}
        </a>
      </div>
    </div>
  );
}
