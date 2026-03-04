import Link from 'next/link';

type SiteFooterProps = {
  siteName: string;
};

export function SiteFooter({ siteName }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">{siteName}</p>
          <p>Marketing-focused CMS starter for landing pages and editorial workflows.</p>
        </div>
        <div className="footer-links">
          <Link href="/admin">Admin</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
