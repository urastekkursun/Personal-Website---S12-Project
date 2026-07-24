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
<section className="projects">
  <h2 className="section-title">{t.projects.title}</h2>

  <div className="projects__carousel">
    <button
      type="button"
      className="carousel-arrow carousel-arrow--prev"
      onClick={goPrev}
    >
      <FaChevronLeft />
    </button>

    <div className="projects__grid">
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
    >
      <FaChevronRight />
    </button>
  </div>
</section>
  );
}
