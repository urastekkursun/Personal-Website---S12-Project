import { useLanguage } from "../context/LanguageContext";

export default function Skills() {
  const { t } = useLanguage();

  return (
    <section className="skills">
      <h2 className="section-title">{t.skills.title}</h2>
      <ul className="skills__list">
        {t.skills.items.map((skill) => (
          <li key={skill.id} className="skill-card">
            <div className={`skill-card__icon icon--${skill.id}`} aria-hidden="true">
              {skill.name.slice(0, 2)}
            </div>
            <span className="skill-card__name">{skill.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
