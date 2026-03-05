export async function renderNavbar() {
    const { getSettings } = await import('../lib/settings.js');
    const settings = await getSettings();
    const siteTitle = settings.site_title || 'vanaila';

    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath === '';

    const navLinks = [
        { href: '/index.html', label: 'Home', isHome: true },
        { href: '/about.html', label: 'About' },
        { href: '/services.html', label: 'Services' },
        { href: '/solutions.html', label: 'Solutions' },
        { href: '/blog.html', label: 'Blog' },
        { href: '/partners.html', label: 'Partnership', isPartnership: true }
    ];

    const linksHtml = navLinks.map(link => {
        const isActive = (link.isHome && isHome) || (currentPath.includes(link.href) && !link.isHome);

        if (link.isPartnership) {
            return `
                <a class="px-6 py-2.5 bg-white border border-slate-200 text-deepSlate text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all md:ml-4" href="${link.href}">${link.label}</a>
            `;
        }

        return `
            <a class="text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-electricBlue' : 'text-slate-600'} hover:text-electricBlue transition-colors" href="${link.href}">${link.label}</a>
        `;
    }).join('');

    // Mobile menu links (vertical layout)
    const mobileLinksHtml = navLinks.map(link => {
        const isActive = (link.isHome && isHome) || (currentPath.includes(link.href) && !link.isHome);
        return `
            <a class="block px-4 py-3 text-sm font-bold uppercase tracking-widest ${isActive ? 'text-electricBlue bg-blue-50' : 'text-slate-700'} hover:text-electricBlue hover:bg-blue-50 rounded-xl transition-all" href="${link.href}">${link.label}</a>
        `;
    }).join('');

    // After DOM renders, attach mobile toggle
    setTimeout(() => {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const closeBtn = document.getElementById('mobile-menu-close');
        const mobileMenu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');

        if (toggleBtn && mobileMenu) {
            const openMenu = () => {
                mobileMenu.classList.remove('translate-x-full');
                mobileMenu.classList.add('translate-x-0');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                overlay.classList.add('opacity-100');
                document.body.style.overflow = 'hidden';
            };
            const closeMenu = () => {
                mobileMenu.classList.add('translate-x-full');
                mobileMenu.classList.remove('translate-x-0');
                overlay.classList.add('opacity-0', 'pointer-events-none');
                overlay.classList.remove('opacity-100');
                document.body.style.overflow = '';
            };
            toggleBtn.addEventListener('click', openMenu);
            closeBtn?.addEventListener('click', closeMenu);
            overlay?.addEventListener('click', closeMenu);
        }
    }, 100);

    return `
<nav class="fixed w-full z-[100] top-0 bg-white/80 backdrop-blur-md border-b border-white/40">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="flex justify-between items-center h-20 md:h-24">
            <a href="/index.html" class="flex items-center gap-3 md:gap-4 group cursor-pointer no-underline">
                <div class="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-lg md:text-xl rotate-3 shadow-lg group-hover:rotate-12 transition-transform duration-500">V</div>
                <span class="font-display text-lg md:text-xl font-black tracking-tighter text-deepSlate">${siteTitle}<span class="text-electricBlue">.</span></span>
            </a>
            <div class="hidden md:flex space-x-8 items-center">
                ${linksHtml}
                
                <div class="flex items-center gap-4 ml-4">
                    <a class="px-6 py-2.5 bg-vanailaNavy text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-blue-900/20 hover:bg-deepSlate transition-all border border-slate-700 no-underline" href="/contact.html">
                        Book Consultation
                    </a>
                </div>
            </div>
            <button id="mobile-menu-toggle" class="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Open menu">
                <span class="material-symbols-outlined text-2xl text-deepSlate">menu</span>
            </button>
        </div>
    </div>
</nav>

<!-- Mobile Menu Overlay -->
<div id="mobile-menu-overlay" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] opacity-0 pointer-events-none transition-opacity duration-300"></div>

<!-- Mobile Menu Panel -->
<div id="mobile-menu" class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-[300] transform translate-x-full transition-transform duration-300 ease-out">
    <div class="flex items-center justify-between p-6 border-b border-slate-100">
        <span class="font-display text-lg font-black tracking-tighter text-deepSlate">${siteTitle}<span class="text-electricBlue">.</span></span>
        <button id="mobile-menu-close" class="p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Close menu">
            <span class="material-symbols-outlined text-2xl text-slate-500">close</span>
        </button>
    </div>
    <div class="p-4 space-y-1">
        ${mobileLinksHtml}
    </div>
    <div class="p-4 border-t border-slate-100 mt-4">
        <a class="block w-full text-center px-6 py-3 bg-vanailaNavy text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-deepSlate transition-all no-underline" href="/contact.html">
            Book Consultation
        </a>
    </div>
</div>
`;
}

export const Navbar = renderNavbar;
