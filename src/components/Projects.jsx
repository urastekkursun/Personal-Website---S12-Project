import { useLanguage } from "../context/LanguageContext";
import ProjectCard from "./ProjectCard";
import otocorephoto from "../assets/otocore.jpg";

const TONES = ["blue", "green"];
const IMAGES = [
  otocorephoto,
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
];

export default function Projects() {
  const { t } = useLanguage();

  return (
    <section className="projects">
      <h2 className="section-title">{t.projects.title}</h2>
      <div className="projects__grid">
        {t.projects.items.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            tone={TONES[index % TONES.length]}
            image={IMAGES[index % IMAGES.length]}
          />
        ))}
      </div>
    </section>
  );
}
