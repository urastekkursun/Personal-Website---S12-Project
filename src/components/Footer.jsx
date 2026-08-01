import { useLanguage } from "../context/LanguageContext";
import { env } from "../utils/env";

export default function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  // `external: false` olanlar aynı sekmede açılır — `mailto:` linkini yeni
  // sekmede açmak boş bir tab bırakıyordu.
  // Blog linki `VITE_BLOG_URL` tanımlıysa gösterilir; eskiden `href="#"` olan
  // ölü bir placeholder'dı.
  const links = [
    { label: f.github, href: "https://github.com/urastekkursun", className: "footer__link--github", external: true },
    env.blogUrl
      ? { label: f.blog, href: env.blogUrl, className: "footer__link--blog", external: true }
      : null,
    { label: f.linkedin, href: "https://www.linkedin.com/in/urastekkursun/", className: "footer__link--linkedin", external: true },
    { label: f.email, href: `mailto:${t.hero.email}`, className: "footer__link--email", external: false },
  ].filter(Boolean);

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
              <a
                href={link.href}
                className={link.className}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
                {link.external && <span className="visually-hidden"> {f.newTab}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
