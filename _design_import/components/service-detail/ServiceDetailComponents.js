import { supabase } from "../../lib/supabase.js";

export async function fetchPricingPlans(slug, defaultPlans) {
    try {
        const { data, error } = await supabase
            .from("service_pricing")
            .select("*")
            .eq("service_slug", slug)
            .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
            return data.map(p => ({
                tier: p.tier,
                name: p.name,
                price: p.price,
                priceLabel: p.price_label,
                features: p.features,
                cta: p.cta_text,
                ctaLink: p.cta_link,
                featured: p.is_featured
            }));
        }
    } catch (e) {
        console.error("Failed to fetch pricing:", e);
    }
    return defaultPlans;
}

export const getServiceHero = (title, accent, description) => `
<section class="relative pt-32 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
        <div class="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-8 backdrop-blur-sm mx-auto">
            <span class="w-1.5 h-1.5 rounded-full bg-electricBlue animate-pulse"></span>
            <span class="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600">Engineering Excellence Since 2018</span>
        </div>
        <h1 class="text-6xl md:text-8xl font-display font-black text-deepSlate leading-[0.95] tracking-tighter mb-8">
            ${title} <br/>
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light pr-4">${accent}</span>
        </h1>
        <p class="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">
            ${description}
        </p>
    </div>
</section>
`;

export const getPricingGrid = (type, plans) => `
<section class="py-20 relative">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="grid md:grid-cols-3 gap-8 items-stretch">
            ${plans.map((plan, index) => `
                <div class="glass-panel p-10 rounded-[3rem] bg-white border border-slate-100 flex flex-col h-full relative ${plan.featured ? 'ring-2 ring-electricBlue shadow-2xl scale-105 z-20' : 'z-10'}">
                    ${plan.featured ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-electricBlue text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">Top Choice!</div>' : ''}
                    <div class="mb-8">
                        <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 block">${plan.tier}</span>
                        <h3 class="text-3xl font-display font-black text-deepSlate">${plan.name}</h3>
                    </div>
                    <div class="mb-10">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">${plan.priceLabel || 'Starting From'}</span>
                        <div class="text-4xl font-display font-black text-deepSlate">${plan.price}</div>
                    </div>
                    <ul class="space-y-4 mb-12 flex-grow">
                        ${plan.features.map(feature => `
                            <li class="flex items-center gap-3 text-sm text-slate-500 font-light">
                                <span class="material-symbols-outlined text-electricBlue text-lg">check_circle</span>
                                ${feature}
                            </li>
                        `).join('')}
                    </ul>
                    <a href="${plan.ctaLink || '/contact.html'}" class="w-full py-5 rounded-full font-display font-bold text-xs uppercase tracking-[0.2em] text-center transition-all ${plan.featured ? 'bg-deepSlate text-white hover:bg-black shadow-xl' : 'bg-slate-50 text-deepSlate border border-slate-100 hover:bg-white hover:border-electricBlue'}">
                        ${plan.cta}
                    </a>
                </div>
            `).join('')}
        </div>
    </div>
</section>
`;

export const getWhyChoose = (title, items) => `
<section class="py-24 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="text-center mb-16">
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">Differentiation</span>
            <h2 class="text-4xl font-display font-black text-deepSlate">${title}</h2>
            <div class="w-20 h-1 bg-electricBlue mx-auto mt-6 rounded-full"></div>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${items.map(item => `
                <div class="glass-panel p-8 rounded-[2rem] bg-white border border-slate-50 hover:shadow-xl transition-all group">
                    <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-electricBlue mb-6 group-hover:bg-electricBlue group-hover:text-white transition-all">
                        <span class="material-symbols-outlined">${item.icon}</span>
                    </div>
                    <h4 class="text-lg font-bold text-deepSlate mb-3">${item.title}</h4>
                    <p class="text-xs text-slate-500 font-light leading-relaxed">${item.description}</p>
                </div>
            `).join('')}
        </div>
    </div>
</section>
`;

export const getLifecycle = (steps) => `
<section class="py-24 relative overflow-hidden bg-slate-50/30">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="text-center mb-20">
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">Methodology</span>
            <h2 class="text-4xl font-display font-black text-deepSlate italic">Development Lifecycle</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 items-start relative">
            ${steps.map((step, index) => `
                <div class="text-center group">
                    <div class="relative inline-block mb-6">
                        <div class="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-electricBlue group-hover:border-electricBlue transition-all shadow-sm">
                            <span class="material-symbols-outlined text-2xl">${step.icon}</span>
                        </div>
                        <div class="absolute -top-1 -right-1 w-6 h-6 bg-deepSlate text-white text-[10px] font-black rounded-full flex items-center justify-center">${index + 1}</div>
                    </div>
                    <h4 class="text-sm font-bold text-deepSlate mb-2 tracking-tight">${step.title}</h4>
                    <p class="text-[10px] text-slate-400 font-medium leading-relaxed">${step.description}</p>
                </div>
            `).join('')}
        </div>
    </div>
</section>
`;

export const getReadyCTA = (title, accent, description) => `
<section class="relative py-40 overflow-hidden">
    <div class="max-w-5xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
        <div class="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white w-full shadow-2xl shadow-blue-900/5 border border-white">
            <div class="relative z-10 w-full max-w-4xl mx-auto">
                <h2 class="text-5xl md:text-7xl font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                    ${title} <br/>
                    <span class="text-brand-gradient italic font-light">${accent}</span>
                </h2>
                <p class="text-slate-500 text-lg font-light mb-12 max-w-xl mx-auto">
                    ${description}
                </p>
                <div class="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <a href="/contact.html" class="px-12 py-5 bg-deepSlate text-white font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all shadow-lg shadow-black/10">
                        Book a Strategy Call
                    </a>
                    <a href="/contact.html" class="px-12 py-5 bg-white border-2 border-slate-100 text-deepSlate font-bold text-xs uppercase tracking-[0.2em] hover:border-electricBlue hover:text-electricBlue transition-all rounded-full">
                        Get a Free Technical Audit
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>
`;
