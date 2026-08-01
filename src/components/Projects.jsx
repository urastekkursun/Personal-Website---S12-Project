import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import ProjectCard from "./ProjectCard";
import otocorephoto from "../assets/otocore.jpg";
import hkmmedical from "../assets/hkmmedical.jpg";
import difod from "../assets/difod.jpg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TONES = ["blue", "green", "red"];
const IMAGES = [
  otocorephoto,
  hkmmedical,
  difod
];

export default function Projects() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
const items = t.projects.items;
const total = items.length;

const goPrev = () => {
  setCurrentIndex((i) => (i - 1 + total) % total);
};

const goNext = () => {
  setCurrentIndex((i) => (i + 1) % total);
};

const visibleProjects = [
  items[currentIndex % total],
  items[(currentIndex + 1) % total],
];
  return (
<section className="projects" aria-labelledby="projects-title">
  <h2 className="section-title" id="projects-title">{t.projects.title}</h2>

  <div className="projects__carousel">
    <button
      type="button"
      className="carousel-arrow carousel-arrow--prev"
      onClick={goPrev}
      aria-label={t.projects.prevLabel}
      aria-controls="projects-grid"
    >
      <FaChevronLeft aria-hidden="true" focusable="false" />
    </button>

    <div
      className="projects__grid"
      id="projects-grid"
      aria-live="polite"
      aria-atomic="false"
    >
      {visibleProjects.map((project) => {
        const originalIndex = items.findIndex((p) => p.id === project.id);
        return (
          <ProjectCard
            key={project.id}
            project={project}
            tone={TONES[originalIndex % TONES.length]}
            image={IMAGES[originalIndex % IMAGES.length]}
          />
        );
      })}
    </div>

    <button
      type="button"
      className="carousel-arrow carousel-arrow--next"
      onClick={goNext}
      aria-label={t.projects.nextLabel}
      aria-controls="projects-grid"
    >
      <FaChevronRight aria-hidden="true" focusable="false" />
    </button>
  </div>

  <output className="projects__counter" aria-live="polite">
    {t.projects.counterBefore} {currentIndex + 1}
    {" / "}
    {total}
  </output>
</section>
  );
}
