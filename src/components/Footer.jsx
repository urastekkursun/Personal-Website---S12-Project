import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  const links = [
    { label: f.github, href: "https://github.com/urastekkursun", className: "footer__link--github" },
    { label: f.blog, href: "#", className: "footer__link--blog" },
    { label: f.linkedin, href: "https://www.linkedin.com/in/urastekkursun/", className: "footer__link--linkedin" },
    { label: f.email, href: `mailto:${t.hero.email}`, className: "footer__link--email" },
  ];

 return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <h2 className="footer__heading">
          {f.title1}{" "}
          <span className="highlight-mark highlight-mark--blue">{f.title2}</span>
        </h2>
        <ul className="footer__links">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" className={link.className}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}