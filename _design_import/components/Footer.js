export async function renderFooter() {
    const { getSettings } = await import("../lib/settings.js");
    const settings = await getSettings();

    const whatsapp = settings.whatsapp_link || "https://wa.me/6285174413323";
    const instagram =
        settings.instagram_url || "https://instagram.com/vanaila.id";
    const website = settings.main_website_url || "https://vanaila.com";
    const email = settings.contact_email || "care@vanaila.com";

    return `
<footer class="bg-white pt-32 pb-12 relative overflow-hidden border-t border-slate-100">
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-2/3 shard-gradient-soft blur-[120px] opacity-20 pointer-events-none"></div>
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="grid md:grid-cols-4 gap-12 md:gap-24 mb-24">
            <div class="col-span-1 md:col-span-2">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-2xl rotate-3 shadow-lg">V</div>
                    <span class="font-display text-3xl font-black tracking-tighter text-deepSlate">${settings.site_title || "vanaila"}<span class="text-electricBlue">.</span></span>
                </div>
                <p class="text-slate-500 font-light text-lg max-w-md mb-8 leading-relaxed">
                    ${settings.site_description || "Engineering-focused digital agency delivering high-performance infrastructure."}
                </p>
                <div class="flex space-x-6">
                    <a class="text-slate-300 hover:text-emerald-400 transition-colors transform hover:scale-110 duration-300" href="${whatsapp}" target="_blank" rel="noopener noreferrer">
                        <span class="material-symbols-outlined text-3xl">chat</span>
                    </a>
                    <a class="text-slate-300 hover:text-pink-400 transition-colors transform hover:scale-110 duration-300" href="${instagram}" target="_blank" rel="noopener noreferrer">
                        <span class="material-symbols-outlined text-3xl">photo_camera</span>
                    </a>
                    <a class="text-slate-300 hover:text-electricBlue transition-colors transform hover:scale-110 duration-300" href="${website}" target="_blank" rel="noopener noreferrer">
                        <span class="material-symbols-outlined text-3xl">public</span>
                    </a>
                    <a class="text-slate-300 hover:text-electricBlue transition-colors transform hover:scale-110 duration-300" href="mailto:${email}">
                        <span class="material-symbols-outlined text-3xl">alternate_email</span>
                    </a>
                </div>
            </div>
            <div>
                <h5 class="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-electricBlue"></span> Navigator
                </h5>
                <ul class="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
                    <li><a class="hover:text-electricBlue transition-colors" href="/index.html">Home</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/about.html">About Us</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/partners.html">Partnership</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/services.html">Services</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/solutions.html">Solutions</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/blog.html">Blog</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/contact.html">Contact</a></li>
                </ul>
            </div>
            <div>
                <h5 class="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-electricBlue"></span> Services
                </h5>
                <ul class="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
                    <li><a class="hover:text-electricBlue transition-colors" href="/website-development.html">Website Development</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/secure-online-shops.html">Secure Online Shops</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/mobile-business-app.html">Mobile Business App</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/official-business-email.html">Official Business Email</a></li>
                    <li><a class="hover:text-electricBlue transition-colors" href="/custom-business-tools.html">Custom Business Tools</a></li>
                </ul>
            </div>

        </div>
        <div class="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <p>© 2026 ${settings.site_title || "Vanaila Digital"}.</p>
            <div class="flex gap-8">
                <span class="text-vanailaNavy/80">Glassmorphism Edition</span>
                <span class="text-slate-500/60">Premium Engineering</span>
            </div>
        </div>
    </div>
</footer>
`;
}

// Keep backward compatibility for static parts
export const Footer = renderFooter;
