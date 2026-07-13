import { useLanguage } from "../context/LanguageContext";
import Header from "./Header";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <span className="deco deco--circle-gray" aria-hidden="true" />
      <span className="deco deco--ring-gray" aria-hidden="true" />
      <span className="deco deco--pill-pink" aria-hidden="true" />

      <Header />
      <div className="hero__content">
        <div className="hero__text">
          <p className="hero__greeting">{t.hero.greeting} 👋</p>
          <h1 className="hero__heading">
            <span className="highlight-mark highlight-mark--pink">
              {t.hero.introBefore} {t.hero.name}.
            </span>{" "}
            {t.hero.introAfter}
          </h1>

          <div className="hero__socials" aria-label="Sosyal medya bağlantıları">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              in
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              ⌘
            </a>
          </div>

          <p className="hero__status">
            {t.hero.currentlyBefore}{" "}
            <span className="highlight-word">{t.hero.currentlyHighlight}</span>{" "}
            {t.hero.currentlyAfter}
          </p>
          <p className="hero__invite">
            {t.hero.inviteText}{" "}
            <a href={`mailto:${t.hero.email}`}>{t.hero.email}</a>
          </p>
        </div>

        <figure className="hero__photo">
          <img
            src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&q=80"
            alt={t.hero.name}
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
