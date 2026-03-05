export async function renderContactMethods() {
    const { getSettings } = await import('../lib/settings.js');
    const settings = await getSettings();

    const address = settings.contact_address || 'Bogor Raya Digital Park, Block A-12 <br/>West Java, Indonesia 16143';
    const email = settings.contact_email || 'care@vanaila.com';
    const instagram = settings.instagram_url || 'https://instagram.com/vanaila.digital';
    const instagramHandle = instagram.split('/').pop().startsWith('@') ? instagram.split('/').pop() : '@' + instagram.split('/').pop();
    const whatsappNum = settings.whatsapp_number || '+62 851 234 567 89';
    const whatsappLink = settings.whatsapp_link || 'https://wa.me/6285174413323';

    return `
<section class="py-24 bg-deepSlate relative overflow-hidden">
    <div class="absolute inset-0 z-0">
        <div class="absolute top-0 right-[-10%] w-[60%] h-[120%] shard-gradient-1 rotate-12 opacity-10"></div>
        <div class="absolute bottom-0 left-[-10%] w-[60%] h-[120%] shard-gradient-2 -rotate-12 opacity-10"></div>
    </div>
    <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div class="space-y-12">
                <h2 class="text-4xl md:text-5xl font-display font-black text-white leading-tight">
                    Prefer a face-to-face <br/>
                    <span class="text-electricBlue italic font-light">discussion?</span>
                </h2>
                <p class="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                    Skip the form and jump straight into a strategy session. We'll explore your technical requirements and business goals in real-time.
                </p>
                <div class="flex flex-wrap gap-6">
                    <a href="mailto:${email}?subject=Google%20Meet%20Consultation&body=Hi%20Vanaila%20Digital,%0A%0AI'd%20like%20to%20schedule%20a%20Google%20Meet%20strategy%20session.%20Please%20let%20me%20know%20your%20available%20slots.%0A%0AThank%20you!" class="px-8 py-5 bg-white text-deepSlate font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:shadow-2xl transition-all flex items-center gap-3">
                        Book a Google Meet Session
                        <span class="material-symbols-outlined text-xl">videocam</span>
                    </a>
                </div>
            </div>

            <div class="glass-panel bg-white/5 border-white/10 p-12 rounded-[3rem] relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-8">
                    <span class="material-symbols-outlined text-6xl text-white/5 group-hover:text-electricBlue/20 transition-colors duration-500">calendar_month</span>
                </div>
                <h3 class="text-2xl font-display font-bold text-white mb-2">Instant Booking</h3>
                <p class="text-slate-400 mb-10 text-sm">Synchronize with our engineering team.</p>
                
                <ul class="space-y-6">
                    <li class="flex items-center gap-4 text-slate-300">
                        <span class="w-6 h-6 rounded-full bg-electricBlue/20 flex items-center justify-center text-electricBlue">
                            <span class="material-symbols-outlined text-sm">check</span>
                        </span>
                        <span class="text-sm font-medium">30-minute technical evaluation</span>
                    </li>
                    <li class="flex items-center gap-4 text-slate-300">
                        <span class="w-6 h-6 rounded-full bg-electricBlue/20 flex items-center justify-center text-electricBlue">
                            <span class="material-symbols-outlined text-sm">check</span>
                        </span>
                        <span class="text-sm font-medium">Direct access to lead architects</span>
                    </li>
                    <li class="flex items-center gap-4 text-slate-300">
                        <span class="w-6 h-6 rounded-full bg-electricBlue/20 flex items-center justify-center text-electricBlue">
                            <span class="material-symbols-outlined text-sm">check</span>
                        </span>
                        <span class="text-sm font-medium">No-obligation consultation</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="mt-32 pt-20 border-t border-white/5 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div class="space-y-4">
                <h4 class="text-white font-display font-black text-xl">${settings.site_title || 'PT Vanaila Digital Vision'}</h4>
                <p class="text-slate-500 text-sm font-light leading-relaxed">
                    ${address}
                </p>
                <div class="pt-4">
                    <p class="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-600 mb-2">Global Reach</p>
                    <p class="text-slate-500 text-xs leading-relaxed">Supporting partners across SEA, Europe, and North America.</p>
                </div>
            </div>

            <a href="mailto:${email}" class="glass-panel bg-white/5 border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer block">
                <span class="material-symbols-outlined text-electricBlue mb-6 group-hover:scale-110 transition-transform">alternate_email</span>
                <h5 class="text-white font-bold text-xs uppercase tracking-widest mb-1">Email Us</h5>
                <p class="text-slate-400 text-sm">${email}</p>
            </a>

            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="glass-panel bg-white/5 border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer block">
                <span class="material-symbols-outlined text-emerald-400 mb-6 group-hover:scale-110 transition-transform">chat</span>
                <h5 class="text-white font-bold text-xs uppercase tracking-widest mb-1">WhatsApp Business</h5>
                <p class="text-slate-400 text-sm">${whatsappNum}</p>
            </a>

            <a href="${instagram}" target="_blank" rel="noopener noreferrer" class="glass-panel bg-white/5 border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer block">
                <span class="material-symbols-outlined text-pink-400 mb-6 group-hover:scale-110 transition-transform">photo_camera</span>
                <h5 class="text-white font-bold text-xs uppercase tracking-widest mb-1">Instagram</h5>
                <p class="text-slate-400 text-sm">${instagramHandle}</p>
            </a>
        </div>
    </div>
</section>
`;
}

export const ContactMethods = renderContactMethods;

