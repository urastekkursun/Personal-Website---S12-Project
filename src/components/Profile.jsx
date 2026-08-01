import { useLanguage } from "../context/LanguageContext";

export default function Profile() {
  const { t } = useLanguage();
  const p = t.profile;

  const basicInfoRows = [
    { label: p.birthDateLabel, value: p.birthDate },
    { label: p.cityLabel, value: p.city },
    { label: p.eduLabel, value: p.edu },
    { label: p.roleLabel, value: p.role },
  ];

  return (
    <section className="profile" aria-labelledby="profile-title">
      <h2 className="section-title" id="profile-title">{p.title}</h2>
      <div className="profile__grid">
        <article className="profile__card">
          <h3 className="profile__card-title">{p.basicInfo}</h3>
          <dl className="profile__info-list">
            {basicInfoRows.map((row) => (
              <div className="profile__info-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <div className="profile__about">
          <h3 className="profile__about-title">
            <span className="highlight-mark highlight-mark--blue">
              {p.aboutTitle}
            </span>
          </h3>
          <p>{p.aboutP1}</p>
          <p>{p.aboutP2}</p>
        </div>
      </div>
    </section>
  );
}
