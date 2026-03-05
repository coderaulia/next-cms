export const BlogGrid = `
<section class="py-20 relative">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div class="flex gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                <button class="px-6 py-2 bg-deepSlate text-white font-bold text-[10px] uppercase tracking-widest rounded-full whitespace-nowrap">All Insights</button>
                <button class="px-6 py-2 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-full border border-slate-100 whitespace-nowrap hover:bg-white hover:text-deepSlate transition-all">Engineering</button>
                <button class="px-6 py-2 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-full border border-slate-100 whitespace-nowrap hover:bg-white hover:text-deepSlate transition-all">Case Studies</button>
                <button class="px-6 py-2 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-full border border-slate-100 whitespace-nowrap hover:bg-white hover:text-deepSlate transition-all">Growth</button>
            </div>
            <div class="relative w-full md:w-64">
                <input type="text" placeholder="Search insights..." class="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none text-xs font-medium">
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>
            </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Article 1 -->
            <div class="glass-panel p-4 rounded-[2.5rem] bg-white group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                <div class="bg-blue-100/30 aspect-video rounded-[2rem] mb-8 overflow-hidden relative">
                    <span class="absolute top-4 left-4 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 text-electricBlue font-bold text-[8px] uppercase tracking-widest rounded-full z-10">E-Commerce</span>
                    <div class="absolute inset-0 flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-700">
                        <span class="material-symbols-outlined text-6xl text-electricBlue">shopping_bag</span>
                    </div>
                </div>
                <div class="px-6 pb-6 space-y-4 flex-grow flex flex-col">
                    <div class="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>May 12, 2024</span>
                        <span>•</span>
                        <span>8 min read</span>
                    </div>
                    <h3 class="text-xl font-display font-black text-deepSlate group-hover:text-electricBlue transition-colors leading-tight">Optimizing WooCommerce for High-Traffic Events</h3>
                    <p class="text-slate-500 text-sm font-light leading-relaxed mb-6 flex-grow">Strategic caching and database tuning techniques to ensure your shop stays resilient during seasonal spikes.</p>
                    <a href="#" class="text-[10px] font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-4 border-t border-slate-50">Read More <span class="material-symbols-outlined text-xs">arrow_outward</span></a>
                </div>
            </div>

            <!-- Article 2 -->
            <div class="glass-panel p-4 rounded-[2.5rem] bg-white group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
                <div class="bg-indigo-100/30 aspect-video rounded-[2rem] mb-8 overflow-hidden relative">
                    <span class="absolute top-4 left-4 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 text-royalPurple font-bold text-[8px] uppercase tracking-widest rounded-full z-10">Python</span>
                    <div class="absolute inset-0 flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-700">
                        <span class="material-symbols-outlined text-6xl text-royalPurple">code</span>
                    </div>
                </div>
                <div class="px-6 pb-6 space-y-4 flex-grow flex flex-col">
                    <div class="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>April 28, 2024</span>
                        <span>•</span>
                        <span>12 min read</span>
                    </div>
                    <h3 class="text-xl font-display font-black text-deepSlate group-hover:text-royalPurple transition-colors leading-tight">Serverless Python: When to Scale Up vs. Out</h3>
                    <p class="text-slate-500 text-sm font-light leading-relaxed mb-6 flex-grow">A deep dive into architectural patterns for backend scalability using modern cloud infrastructure.</p>
                    <a href="#" class="text-[10px] font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-4 border-t border-slate-50">Read More <span class="material-symbols-outlined text-xs">arrow_outward</span></a>
                </div>
            </div>

            <!-- Article 3 -->
            <div class="glass-panel p-4 rounded-[2.5rem] bg-white group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:shadow-cyan-500/5 transition-all">
                <div class="bg-cyan-100/30 aspect-video rounded-[2rem] mb-8 overflow-hidden relative">
                    <span class="absolute top-4 left-4 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 text-vibrantCyan font-bold text-[8px] uppercase tracking-widest rounded-full z-10">UX Strategy</span>
                    <div class="absolute inset-0 flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-700">
                        <span class="material-symbols-outlined text-6xl text-vibrantCyan">psychology</span>
                    </div>
                </div>
                <div class="px-6 pb-6 space-y-4 flex-grow flex flex-col">
                    <div class="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>April 15, 2024</span>
                        <span>•</span>
                        <span>6 min read</span>
                    </div>
                    <h3 class="text-xl font-display font-black text-deepSlate group-hover:text-vibrantCyan transition-colors leading-tight">Psychology of Conversion: Beyond A/B Testing</h3>
                    <p class="text-slate-500 text-sm font-light leading-relaxed mb-6 flex-grow">Why technical speed is only half the battle. Understanding user mental models to drive engagement.</p>
                    <a href="#" class="text-[10px] font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-4 border-t border-slate-50">Read More <span class="material-symbols-outlined text-xs">arrow_outward</span></a>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-20 flex justify-center items-center gap-4">
            <button class="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-deepSlate hover:text-white transition-all"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
            <button class="w-10 h-10 rounded-full bg-deepSlate text-white font-bold text-[10px] flex items-center justify-center">1</button>
            <button class="w-10 h-10 rounded-full bg-slate-50 text-slate-400 font-bold text-[10px] flex items-center justify-center hover:bg-white hover:text-deepSlate border border-transparent hover:border-slate-100 transition-all">2</button>
            <button class="w-10 h-10 rounded-full bg-slate-50 text-slate-400 font-bold text-[10px] flex items-center justify-center hover:bg-white hover:text-deepSlate border border-transparent hover:border-slate-100 transition-all">3</button>
            <button class="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-deepSlate hover:text-white transition-all"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
        </div>
    </div>
</section>
`;
