import Link from 'next/link';

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  siteName: string;
  navItems: NavItem[];
};

export function SiteHeader({ siteName, navItems }: SiteHeaderProps) {
  const primaryLinks = navItems
    .filter((item) => item.href !== '/' && item.href !== '/contact')
    .slice(0, 3);

  return (
    <header className="site-header v2-shell-header">
      <div className="container v2-topbar">
        <Link href="/" className="v2-brand">
          <span className="v2-brand-mark">V</span>
          <span>{siteName}</span>
        </Link>
        <nav aria-label="Primary navigation" className="v2-nav-wrap">
          <ul className="nav-list v2-nav-list">
            {primaryLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="v2-btn v2-btn-primary v2-top-cta">
            Consultation
          </Link>
        </nav>
      </div>
    </header>
  );
}
