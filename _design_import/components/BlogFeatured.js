export const getBlogFeatured = (settings = {}) => {
    const authorName = settings.author_name || "Aris Truno";
    const authorTitle = settings.author_title || "Lead Architect";
    const authorAvatar = settings.author_avatar || "";

    return `
<section class="py-12 relative">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="glass-panel p-4 rounded-[3rem] bg-white overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-700">
            <div class="grid lg:grid-cols-2 gap-8 items-center">
                <div class="bg-deepSlate aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden relative">
                    <div class="absolute inset-0 bg-gradient-to-br from-electricBlue/20 to-transparent z-10"></div>
                    <div class="absolute inset-0 flex items-center justify-center p-12">
                        <code class="text-electricBlue/60 text-xs font-mono leading-loose">
                            &lt;article&gt;<br/>
                            &nbsp;&nbsp;&lt;h1&gt;Scalable Architecture&lt;/h1&gt;<br/>
                            &nbsp;&nbsp;&lt;p&gt;Performance by design...&lt;/p&gt;<br/>
                            &lt;/article&gt;
                        </code>
                    </div>
                    <div class="absolute bottom-8 left-8 z-20">
                        <span class="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-full group-hover:bg-white group-hover:text-deepSlate transition-colors">Featured Article</span>
                    </div>
                </div>
                <div class="p-8 lg:p-12 space-y-8">
                    <div class="space-y-4">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-electricBlue">Engineering</span>
                        <h2 class="text-4xl md:text-5xl font-display font-black text-deepSlate leading-tight group-hover:text-electricBlue transition-colors">
                            Why Svelte is the Future of High-Performance Web Presence
                        </h2>
                        <p class="text-slate-500 font-light leading-relaxed text-lg">
                            Exploring how compiled frameworks are redefining performance benchmarks and SEO efficacy for modern business infrastructure.
                        </p>
                    </div>
                    <div class="flex items-center justify-between pt-8 border-t border-slate-50">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                                ${authorAvatar ? `<img src="${authorAvatar}" class="w-full h-full object-cover">` : `<span class="material-symbols-outlined">person</span>`}
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-deepSlate">${authorName}</h4>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${authorTitle}</p>
                            </div>
                        </div>
                        <a href="#" class="text-xs font-bold uppercase tracking-widest text-electricBlue flex items-center gap-2 group/link">
                            Read Article
                            <span class="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`;
};
