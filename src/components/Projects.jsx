import { useLanguage } from "../context/LanguageContext";
import ProjectCard from "./ProjectCard";
import { USABLE_PROJECT_INDEXES, projectImage, projectTone } from "../data/projects";
import { caseForProject } from "../data/caseList";

/**
 * Eskiden burada 3 projenin 2'lik penceresini gösteren bir karusel vardı.
 * Kaldırıldı: ziyaretçinin işlerin üçte birini görmek için ok tuşuna basması
 * gerekiyordu ve "1, 2 / 3" sayacı ile ekrandaki kart sayısı mobilde
 * birbirini tutmuyordu. Artık düz responsive grid — 3 / 2 / 1 sütun.
 */
export default function Projects() {
  const { t } = useLanguage();

  // Doğrulamayı geçemeyen kayıtlar listeye hiç girmez; sebebi geliştirmede
  // konsola yazılır (bkz. src/data/projects.js). Süzgeç DİZİNE bakıyor —
  // id'ye bakmak kopya id'li kaydı ayırt edemezdi.
  const items = (t.projects.items ?? []).filter((_, index) =>
    USABLE_PROJECT_INDEXES.has(index)
  );

  if (items.length === 0) return null;

  return (
    <section className="projects" aria-labelledby="projects-title">
      <h2 className="section-title" id="projects-title">{t.projects.title}</h2>

      <ul className="projects__grid">
        {items.map((project) => (
          <li key={project.id}>
            <ProjectCard
              project={project}
              tone={projectTone(project.tone)}
              image={projectImage(project.image)}
              caseSlug={caseForProject(project.id)?.slug}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
