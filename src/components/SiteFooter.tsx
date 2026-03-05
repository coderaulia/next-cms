import Link from 'next/link';

type SiteFooterProps = {
  siteName: string;
};

export function SiteFooter({ siteName }: SiteFooterProps) {
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  return (
    <footer className="bg-white pt-32 pb-12 relative overflow-hidden border-t border-slate-100">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-2/3 shard-gradient-soft blur-[120px] opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 md:gap-24 mb-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-2xl rotate-3 shadow-lg">
                V
              </div>
              <span className="font-display text-3xl font-black tracking-tighter text-deepSlate">
                {brandName}
                <span className="text-electricBlue">.</span>
              </span>
            </div>
            <p className="text-slate-500 font-light text-lg max-w-md mb-8 leading-relaxed">
              Engineering-focused digital agency delivering high-performance infrastructure.
            </p>
            <div className="flex space-x-6">
              <Link className="text-slate-300 hover:text-emerald-400 transition-colors transform hover:scale-110 duration-300" href="/contact">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </Link>
              <Link className="text-slate-300 hover:text-pink-400 transition-colors transform hover:scale-110 duration-300" href="/contact">
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
              </Link>
              <Link className="text-slate-300 hover:text-electricBlue transition-colors transform hover:scale-110 duration-300" href="/contact">
                <span className="material-symbols-outlined text-3xl">public</span>
              </Link>
              <Link className="text-slate-300 hover:text-electricBlue transition-colors transform hover:scale-110 duration-300" href="/contact">
                <span className="material-symbols-outlined text-3xl">alternate_email</span>
              </Link>
            </div>
          </div>

          <div>
            <h5 className="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" /> Navigator
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
              <li><Link className="hover:text-electricBlue transition-colors" href="/">Home</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/about">About Us</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/service">Services</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/blog">Insights</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/partnership">Partnership</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" /> Services
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
              <li><Link className="hover:text-electricBlue transition-colors" href="/website-development">Website Development</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/secure-online-shops">Secure Online Shops</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/mobile-business-app">Mobile Business App</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/official-business-email">Official Business Email</Link></li>
              <li><Link className="hover:text-electricBlue transition-colors" href="/custom-business-tools">Custom Business Tools</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          <p>© 2026 {brandName}.</p>
          <div className="flex gap-8">
            <span className="text-vanailaNavy/80">Glassmorphism Edition</span>
            <span className="text-slate-500/60">Premium Engineering</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
