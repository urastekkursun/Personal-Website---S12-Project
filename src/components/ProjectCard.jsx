import { useLanguage } from "../context/LanguageContext";

export default function ProjectCard({ project, tone, image }) {
  const { t } = useLanguage();

  return (
    <article className={`project-card project-card--${tone}`}>
      <h3>{project.name}</h3>
      <p>{project.description}</p>

      <ul className="project-card__tags">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
<div className="project-card__links">
  <a href={project.github} target="_blank" rel="noreferrer">
    {t.projects.viewGithub}
  </a>
  <a href={project.app} target="_blank" rel="noreferrer">
    {t.projects.goToApp}
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </a>
</div>
      <figure className="project-card__image">
        <img src={image} alt={project.name} loading="lazy" />
      </figure>
    </article>
  );
}
