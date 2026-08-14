import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { caseIndexBySlug } from "../data/caseList";
import { projectImage, projectTone } from "../data/projects";
import usePageMeta from "../hooks/usePageMeta";
import Header from "./Header";
import Footer from "./Footer";
import SkipLink from "./SkipLink";
import NotFound from "./NotFound";

export default function CaseStudy() {
  const { slug } = useParams();
  const { t, path } = useLanguage();

  // Yayınlanmamış (taslak) ya da hiç olmayan slug aynı kapıya çıkar: 404.
  // Yarım bir vaka sayfası göstermektense sayfa hiç olmasın.
  const index = caseIndexBySlug(slug);
  const c = t.cases;
  const item = index === null ? null : c.items[index];

  // Hook'lar koşulsuz çağrılmalı: erken `return` bunun ÜSTÜNDE olsaydı
  // geçerli slug'dan geçersize geçişte hook sayısı değişirdi.
  usePageMeta(
    item ? `${item.title} — ${t.meta.author}` : "",
    item?.metaDescription
  );

  if (!item) return <NotFound />;
  const image = projectImage(item.image);
  const tone = projectTone(item.tone);

  const sections = [
    ["problem", c.sections.problem, item.problem],
    ["approach", c.sections.approach, item.approach],
    ["result", c.sections.result, item.result],
  ];

  return (
    <>
      <SkipLink />
      <div className="page">
        <main id="main-content" tabIndex={-1}>
          <article className={`case case--${tone}`}>
            <section className="case__intro">
              <Header />

              <div className="case__intro-body">
                <Link className="case__back" to={path("/")}>
                  <span aria-hidden="true">←</span> {c.backLabel}
                </Link>

                <p className="case__eyebrow">{c.eyebrow}</p>
                <h1 className="case__title">{item.title}</h1>
                <p className="case__summary">{item.summary}</p>

                {/* Ajansın en çok merak ettiği bilgi bu; sayfanın en görünür
                    öğelerinden biri olacak şekilde konumlandırıldı. */}
                <p className="case__duration">
                  <span className="case__duration-label">{c.sections.duration}</span>
                  <strong className="case__duration-value">{item.duration}</strong>
                </p>

                <h2 className="visually-hidden">{c.stackLabel}</h2>
                <ul className="case__stack" aria-label={c.stackLabel}>
                  {item.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>

                <div className="case__links">
                  {item.live && (
                    <a
                      className="case__link case__link--primary"
                      href={item.live}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.liveLabel}
                      <span className="visually-hidden"> {c.newTab}</span>
                    </a>
                  )}
                  {item.repo && (
                    <a
                      className="case__link"
                      href={item.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.repoLabel}
                      <span className="visually-hidden"> {c.newTab}</span>
                    </a>
                  )}
                </div>
              </div>
            </section>

            {image && (
              <figure className="case__shot">
                <img
                  src={image}
                  alt={`${item.title} ${t.projects.screenshotAlt}`}
                  width="500"
                  height="287"
                  decoding="async"
                />
              </figure>
            )}

            <div className="case__body">
              {sections.map(([key, heading, paragraphs]) => (
                <section className="case__section" key={key} aria-labelledby={`case-${key}`}>
                  <h2 className="case__section-title" id={`case-${key}`}>
                    {heading}
                  </h2>
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <p className="case__footer-nav">
              <Link className="case__back" to={path("/")}>
                <span aria-hidden="true">←</span> {c.backLabel}
              </Link>
            </p>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
