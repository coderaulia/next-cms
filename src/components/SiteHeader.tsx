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
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="brand">
          {siteName}
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
