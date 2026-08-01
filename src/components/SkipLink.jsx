import { useLanguage } from "../context/LanguageContext";

// Klavye kullanıcısının header kontrollerini atlayıp doğrudan içeriğe
// geçebilmesi için ilk odaklanılabilir öğe.
export default function SkipLink() {
  const { t } = useLanguage();

  return (
    <a className="skip-link" href="#main-content">
      {t.hero.skipToContent}
    </a>
  );
}
