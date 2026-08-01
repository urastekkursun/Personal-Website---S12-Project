import { useLanguage } from "../context/LanguageContext";
import Header from "./Header";
import urasPhoto from "../assets/uras-hero.jpg";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <span className="deco deco--circle-gray" aria-hidden="true" />
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

          <div className="hero__socials">
            <a
              href="https://www.linkedin.com/in/urastekkursun/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.hero.linkedinLabel}
            >
                <FaLinkedinIn size={30} aria-hidden="true" focusable="false" />
            </a>
            <a
              href="https://github.com/urastekkursun"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.hero.githubLabel}
            >
                <FaGithub size={30} aria-hidden="true" focusable="false" />
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
            src={urasPhoto}
            alt={t.hero.photoAlt}
            width="344"
            height="344"
            fetchPriority="high"
          />
        </figure>
      </div>
    </section>
  );
}
