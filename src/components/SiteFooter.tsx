import Link from 'next/link';

type SiteFooterProps = {
  siteName: string;
};

export function SiteFooter({ siteName }: SiteFooterProps) {
  return (
    <footer className="site-footer v2-shell-footer">
      <div className="container v2-footer-grid">
        <div>
          <p className="v2-footer-brand">
            <span className="v2-brand-mark">V</span>
            <span>{siteName}</span>
          </p>
          <p>
            Engineering-focused digital delivery for ambitious brands. From strategy to execution,
            we simplify complexity.
          </p>
        </div>
        <div>
          <p className="v2-footer-title">Quick Links</p>
          <div className="v2-footer-links">
            <Link href="/service">Services</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/blog">Case Studies</Link>
          </div>
        </div>
        <div>
          <p className="v2-footer-title">Legal</p>
          <div className="v2-footer-links">
            <Link href="/contact">Privacy Policy</Link>
            <Link href="/contact">Terms of Service</Link>
            <Link href="/contact">Cookies Policy</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </div>
      <div className="container v2-footer-meta">
        <p>© 2026 Vanaila Digital Vision.</p>
        <p>Glassmorphism Edition</p>
      </div>
    </footer>
  );
}
