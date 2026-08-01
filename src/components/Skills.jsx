import { useLanguage } from "../context/LanguageContext";
import {
  SiJavascript,
  SiReact,
  SiRedux,
  SiNodedotjs,
  SiFigma,
  SiTypescript,
} from "react-icons/si";
import { VscCode } from "react-icons/vsc";

const ICON_MAP = {
  js: SiJavascript,
  react: SiReact,
  redux: SiRedux,
  node: SiNodedotjs,
  vscode: VscCode,
  figma: SiFigma,
  ts: SiTypescript,
};

export default function Skills() {
  const { t } = useLanguage();

  return (
    <section className="skills" aria-labelledby="skills-title">
      <span className="deco deco--ring-gray" aria-hidden="true" />
      <span className="deco deco--ring-pink" aria-hidden="true" />
      <span className="deco deco--pill-gray" aria-hidden="true" />
      <h2 className="section-title" id="skills-title">{t.skills.title}</h2>
      <ul className="skills__list">
        {t.skills.items.map((skill) => {
          const Icon = ICON_MAP[skill.id];
          return (
            <li key={skill.id} className="skill-card">
              <div className={`skill-card__icon icon--${skill.id}`}>
                {/* İkonun yanında zaten görünür bir isim var; ekran okuyucuya
                    aynı bilgiyi iki kez okutmamak için ikon gizleniyor. */}
                {/* Renk CSS'ten (`.icon--*`) geliyor: JS ikonu sarı zemin
                    üzerinde beyaz olduğunda neredeyse görünmezdi. */}
                {Icon ? <Icon size={48} color="currentColor" aria-hidden="true" focusable="false" /> : null}
              </div>
              <span className="skill-card__name">{skill.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
