import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer site-chrome-root">
      <div className="site-footer-inner">
        <p className="site-footer-copy">© BoSore {year}</p>
        <nav className="site-footer-nav" aria-label="Дополнительные ссылки">
          <Link href="/policy" className="site-footer-link">
            Политика
          </Link>
          <Link href="/contacts" className="site-footer-link">
            Контакты
          </Link>
        </nav>
      </div>
    </footer>
  );
}
