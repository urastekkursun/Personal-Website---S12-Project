/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/prefer-tag-over-role --
   WAI-ARIA Carousel deseni gereği kapsayıcı `role="group"` +
   `aria-roledescription="carousel"` taşımalı ve ok tuşları bu kapsayıcıda
   dinlenmeli. `prefer-tag-over-role` bunun yerine fieldset/details/hgroup
   öneriyor — karusel için yanlış. İkisi de bu dosyada yanlış pozitif. */
import { useLanguage } from "../context/LanguageContext";
import { useCallback, useState } from "react";
import ProjectCard from "./ProjectCard";
import otocorephoto from "../assets/otocore.webp";
import hkmmedical from "../assets/hkmmedical.webp";
import difod from "../assets/difod.webp";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TONES = ["blue", "green", "red"];
const IMAGES = [
  otocorephoto,
  hkmmedical,
  difod
];

// Aynı anda kaç kart gösterilecek. Proje sayısı bundan azsa pencere daralır —
// aksi halde 1 projede aynı kart iki kez render edilip React'ta duplicate key
// hatasına yol açıyordu.
const VISIBLE_COUNT = 2;

export default function Projects() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = t.projects.items;
  const total = items.length;
  const windowSize = Math.min(VISIBLE_COUNT, total);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % total);
  }, [total]);

  // Sol/sağ ok tuşlarıyla gezinme. Odak bir bağlantı ya da form öğesindeyse
  // karışmasın diye o durumlar dışarıda bırakılıyor.
  const handleKeyDown = useCallback(
    (event) => {
      if (event.target.closest("a, input, textarea, select")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext]
  );

  const visible = Array.from({ length: windowSize }, (_, offset) => {
    const index = (currentIndex + offset) % total;
    return { project: items[index], index };
  });

  // "Proje 1, 2 / 3" — sarma durumunda "3, 1 / 3" olur, bu yüzden aralık
  // (1-2) yerine tek tek listeleniyor.
  const positions = visible.map((v) => v.index + 1).join(", ");
  const names = visible.map((v) => v.project.name).join(", ");

  return (
    <section className="projects" aria-labelledby="projects-title">
      <h2 className="section-title" id="projects-title">{t.projects.title}</h2>

      {/* aria-roledescription ekran okuyucuya bunun bir karusel olduğunu
          söyler; ok tuşları bu kapsayıcıda dinleniyor. */}
      <div
        className="projects__carousel"
        role="group"
        aria-roledescription={t.projects.carouselRole}
        aria-label={t.projects.title}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="carousel-arrow carousel-arrow--prev"
          onClick={goPrev}
          aria-label={t.projects.prevLabel}
          aria-controls="projects-grid"
        >
          <FaChevronLeft aria-hidden="true" focusable="false" />
        </button>

        {/* Buraya aria-live KOYULMUYOR: iki proje kartının tüm içeriği her ok
            basışında baştan okunurdu. Değişikliği aşağıdaki kısa canlı bölge
            duyuruyor — tek canlı bölge, çift duyuru yok. */}
        <div className="projects__grid" id="projects-grid">
          {visible.map(({ project, index }) => (
            <ProjectCard
              key={project.id}
              project={project}
              tone={TONES[index % TONES.length]}
              image={IMAGES[index % IMAGES.length]}
              slideLabel={`${project.name} — ${index + 1} / ${total}`}
              slideRole={t.projects.slideRole}
            />
          ))}
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
        {`${t.projects.counterBefore} ${positions} / ${total}: ${names}`}
      </output>
    </section>
  );
}
