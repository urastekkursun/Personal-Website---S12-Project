import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function ProjectCard({ project, tone, image, caseSlug }) {
  const { t, path } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const headingId = `project-${project.id}-title`;

  // Görsel tarayıcı önbelleğinden gelirse `onLoad` hiç tetiklenmeyebilir;
  // ref bağlanırken `complete` bayrağını da kontrol ediyoruz.
  const imageRef = useCallback((node) => {
    if (node?.complete) setImageLoaded(true);
  }, []);

  return (
    <article className={`project-card project-card--${tone}`} aria-labelledby={headingId}>
      <h3 id={headingId}>{project.name}</h3>
      <p>{project.description}</p>

      <ul className="project-card__tags">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {/* Yayınlanmış vakası olan proje detaya açılır. Taslak vaka burada da
          görünmez — link `caseSlug` verilmediği sürece hiç render edilmez. */}
      {caseSlug && (
        <Link
          className="project-card__case"
          to={path(`/case/${caseSlug}`)}
          // Kart başına aynı metin tekrar ettiği için ekran okuyucunun
          // bağlantı listesinde hangi projeye ait olduğu belirsiz kalıyordu.
          aria-label={`${project.name} — ${t.cases.cardCta}`}
        >
          {t.cases.cardCta}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}

<div className="project-card__links">
  <a
    href={project.github}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${project.name} — ${t.projects.viewGithub}`}
  >
    {t.projects.viewGithub}
  </a>
  <a
    href={project.app}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${project.name} — ${t.projects.goToApp}`}
  >
    {t.projects.goToApp}
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </a>
</div>
      {/* Görsel çözülemediyse (bkz. src/data/projects.js) figure hiç
          basılmaz — kırık görsel ikonu göstermektense boş bırakmak yeğ. */}
      {image && (
        <figure className={`project-card__image ${imageLoaded ? "is-loaded" : ""}`}>
          <img
            ref={imageRef}
            src={image}
            alt={`${project.name} ${t.projects.screenshotAlt}`}
            loading="lazy"
            decoding="async"
            width="500"
            height="287"
            onLoad={() => setImageLoaded(true)}
            // Görsel yüklenemezse skeleton sonsuza kadar dönmesin
            onError={() => setImageLoaded(true)}
          />
        </figure>
      )}
    </article>
  );
}
