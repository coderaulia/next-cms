import { Navbar } from "./components/Navbar.js";
import { Footer } from "./components/Footer.js";
import { HomeCTA } from "./components/HomeCTA.js";
import { supabase } from "./lib/supabase.js";
import { fadeInPage, initScrollReveals } from "./lib/pageTransitions.js";

const app = document.getElementById("app");

const PartnerHero = `
<section class="relative pt-32 pb-20 overflow-hidden bg-vanailaNavy text-white">
    <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#3B82F6,transparent)]"></div>
    </div>
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-electricBlue text-[10px] font-bold uppercase tracking-widest mb-8 hero-badge">
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-electricBlue opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-electricBlue"></span>
            </span>
            Ecosystem Partnership
        </div>
        <h1 class="text-5xl md:text-7xl font-display font-black leading-[1.1] mb-8 tracking-tighter">
            Build the Future <br/>
            <span class="bg-gradient-to-r from-electricBlue via-vibrantCyan to-electricBlue bg-clip-text text-transparent">Scale with Vanaila.</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Join our exclusive network of elite technical agencies and referral partners. Let's deliver extraordinary digital infrastructure together.
        </p>
    </div>
</section>
`;

const PartnerProgram = `
<section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid lg:grid-cols-3 gap-12">
            <div class="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                <div class="w-14 h-14 rounded-2xl bg-electricBlue/10 flex items-center justify-center text-electricBlue mb-8 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl">handshake</span>
                </div>
                <h3 class="text-2xl font-display font-black text-deepSlate mb-4">Referral Alpha</h3>
                <p class="text-slate-500 font-light leading-relaxed">Earn industry-leading commissions by connecting your clients with our premium engineering services. No technical management required.</p>
            </div>
            <div class="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group lg:scale-105 bg-white z-10 shadow-2xl shadow-blue-900/5">
                <div class="w-14 h-14 rounded-2xl bg-royalPurple/10 flex items-center justify-center text-royalPurple mb-8 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl">hub</span>
                </div>
                <h3 class="text-2xl font-display font-black text-deepSlate mb-4">Technical Alliance</h3>
                <p class="text-slate-500 font-light leading-relaxed">Embed our lead architects into your project workflow. Perfect for agencies looking to scale their technical output with white-label support.</p>
            </div>
            <div class="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                <div class="w-14 h-14 rounded-2xl bg-vibrantCyan/10 flex items-center justify-center text-vibrantCyan mb-8 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl">rocket_launch</span>
                </div>
                <h3 class="text-2xl font-display font-black text-deepSlate mb-4">Service Expansion</h3>
                <p class="text-slate-500 font-light leading-relaxed">Offer high-end cloud infra and mobile app dev to your existing portfolio under your own brand, powered by our backend.</p>
            </div>
        </div>
    </div>
</section>
`;

const SelectionStandard = `
<section class="py-24 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="glass-panel p-12 md:p-20 rounded-[4rem] border border-white/60 shadow-2xl shadow-blue-500/5 bg-white/40 backdrop-blur-3xl">
            <div class="max-w-3xl mb-16">
                <h2 class="text-4xl md:text-5xl font-display font-black text-deepSlate leading-tight mb-6">Our Selection Standard</h2>
                <p class="text-lg text-slate-500 font-light leading-relaxed">We don't partner with everyone. We look for entities that share our obsession with engineering quality and aesthetic precision.</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div class="space-y-4">
                    <div class="text-4xl font-display font-black text-slate-100">01</div>
                    <h4 class="font-bold text-deepSlate uppercase tracking-widest text-xs">Excellence</h4>
                    <p class="text-sm text-slate-500 font-light leading-relaxed">Proven track record of high-performance delivery.</p>
                </div>
                <div class="space-y-4">
                    <div class="text-4xl font-display font-black text-slate-100">02</div>
                    <h4 class="font-bold text-deepSlate uppercase tracking-widest text-xs">Integrity</h4>
                    <p class="text-sm text-slate-500 font-light leading-relaxed">Transparent communication and milestone adherence.</p>
                </div>
                <div class="space-y-4">
                    <div class="text-4xl font-display font-black text-slate-100">03</div>
                    <h4 class="font-bold text-deepSlate uppercase tracking-widest text-xs">Innovation</h4>
                    <p class="text-sm text-slate-500 font-light leading-relaxed">Commitment to modern stacks and cloud-native logic.</p>
                </div>
                <div class="space-y-4">
                    <div class="text-4xl font-display font-black text-slate-100">04</div>
                    <h4 class="font-bold text-deepSlate uppercase tracking-widest text-xs">Growth</h4>
                    <p class="text-sm text-slate-500 font-light leading-relaxed">Long-term vision for mutual ecosystem expansion.</p>
                </div>
            </div>
        </div>
    </div>
</section>
`;

const PartnerForm = `
<section class="py-32 px-6 lg:px-12 bg-slate-50/50">
    <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="space-y-12 scroll-reveal text-left">
                <div>
                    <h2 class="text-5xl font-display font-black text-vanailaNavy leading-tight mb-6">Terms of Collaboration <br/><span class="text-electricBlue italic">(The Vanaila Protocol)</span></h2>
                    <p class="text-lg text-slate-500 font-light leading-relaxed">We operate on a framework of clarity and mutual respect. These pillars form the foundation of every partnership in our network.</p>
                </div>

                <div class="grid sm:grid-cols-2 gap-6">
                    <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <span class="material-symbols-outlined text-electricBlue">verified</span>
                        <div>
                            <h5 class="font-bold text-deepSlate text-sm">Standard NDAs</h5>
                            <p class="text-[10px] text-slate-400 tracking-wide uppercase font-bold">Total Confidentiality</p>
                        </div>
                    </div>
                    <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <span class="material-symbols-outlined text-royalPurple">branding_watermark</span>
                        <div>
                            <h5 class="font-bold text-deepSlate text-sm">White-Label</h5>
                            <p class="text-[10px] text-slate-400 tracking-wide uppercase font-bold">Seamless Integration</p>
                        </div>
                    </div>
                    <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <span class="material-symbols-outlined text-vibrantCyan">lock</span>
                        <div>
                            <h5 class="font-bold text-deepSlate text-sm">Intellectual Property</h5>
                            <p class="text-[10px] text-slate-400 tracking-wide uppercase font-bold">Clear Ownership</p>
                        </div>
                    </div>
                    <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <span class="material-symbols-outlined text-green-500">payments</span>
                        <div>
                            <h5 class="font-bold text-deepSlate text-sm">Payment Terms</h5>
                            <p class="text-[10px] text-slate-400 tracking-wide uppercase font-bold">Milestone-Based</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-2xl shadow-slate-200/50 scroll-reveal">
                <h3 class="text-3xl font-display font-black text-deepSlate mb-2">Start Your Application</h3>
                <p class="text-sm text-slate-400 mb-10">Join the queue for our next intake of partners.</p>
                
                <form id="partner-form" class="space-y-6">
                    <div class="grid sm:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Entity Name</label>
                            <input type="text" name="entity_name" required placeholder="Individual or Agency" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue focus:ring-1 focus:ring-electricBlue outline-none transition-all text-sm">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Partner Type</label>
                            <select name="partner_type" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue outline-none transition-all text-sm text-slate-500">
                                <option value="Referral Partner">Referral Partner</option>
                                <option value="Technical Partner">Technical Partner</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                            <input type="email" name="email" required placeholder="you@company.com" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue focus:ring-1 focus:ring-electricBlue outline-none transition-all text-sm">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">WhatsApp Number</label>
                            <input type="tel" name="phone" placeholder="+62 812 3456 7890" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue focus:ring-1 focus:ring-electricBlue outline-none transition-all text-sm">
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Primary Technical Stack</label>
                        <input type="text" name="tech_stack" required placeholder="e.g. Svelte, WP/PHP, Node.js, Cloud Arch" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue outline-none transition-all text-sm">
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Portfolio / GitHub Link</label>
                        <input type="url" name="portfolio_link" placeholder="https://github.com/username" class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue outline-none transition-all text-sm">
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Brief Description of Experience</label>
                        <textarea name="description" rows="4" placeholder="Recent projects, core strengths..." class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-electricBlue outline-none transition-all text-sm resize-none"></textarea>
                    </div>

                    <!-- Cloudflare Turnstile CAPTCHA -->
                    <div class="flex justify-center pt-2">
                        <div class="cf-turnstile" data-sitekey="0x4AAAAAACg5iYZrFZ9cIWvz" data-theme="light"></div>
                    </div>

                    <button type="submit" id="submit-btn" class="w-full py-5 bg-deepSlate text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-electricBlue hover:shadow-xl hover:shadow-blue-500/20 transition-all">
                        Submit for Review
                    </button>
                    <div id="form-message" class="hidden text-center text-sm font-bold pt-4"></div>
                </form>
            </div>
        </div>
    </div>
</section>
`;

const BenefitsGrid = `
<section class="py-32 bg-vanailaNavy text-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-20 space-y-4">
            <h2 class="text-4xl md:text-5xl font-display font-black tracking-tight italic">Ecosystem Perks</h2>
            <p class="text-slate-400 font-light text-lg">Beyond the collaboration, we provide resources for our partners to thrive.</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="p-8 border border-white/10 rounded-3xl hover:bg-white/5 transition-colors">
                <span class="material-symbols-outlined text-electricBlue mb-6">architecture</span>
                <h4 class="text-xl font-bold mb-4">Architecture Audits</h4>
                <p class="text-slate-400 text-sm font-light">Free consultation for your complex cloud infrastructure designs.</p>
            </div>
            <div class="p-8 border border-white/10 rounded-3xl hover:bg-white/5 transition-colors">
                <span class="material-symbols-outlined text-vibrantCyan mb-6">monitoring</span>
                <h4 class="text-xl font-bold mb-4">Priority Support</h4>
                <p class="text-slate-400 text-sm font-light">Direct line to our senior lead architects for emergency escalations.</p>
            </div>
            <div class="p-8 border border-white/10 rounded-3xl hover:bg-white/5 transition-colors">
                <span class="material-symbols-outlined text-royalPurple mb-6">local_atm</span>
                <h4 class="text-xl font-bold mb-4">Co-Marketing</h4>
                <p class="text-slate-400 text-sm font-light">Join our periodic webinars and white papers to boost your entity visibility.</p>
            </div>
        </div>
    </div>
</section>
`;

async function initPartnerPage() {
    const { applyGlobalSettings } = await import("./lib/settings.js");
    await applyGlobalSettings();

    const navbarHtml = await Navbar();
    const footerHtml = await Footer();

    app.innerHTML = `
        ${navbarHtml}
        <main>
            ${PartnerHero}
            ${PartnerProgram}
            ${SelectionStandard}
            ${PartnerForm}
            ${BenefitsGrid}
            ${HomeCTA}
        </main>
        ${footerHtml}
    `;

    fadeInPage();
    initScrollReveals();

    // Explicitly render Turnstile after DOM is ready
    if (window.turnstile) {
        const container = document.querySelector('.cf-turnstile');
        if (container) {
            container.innerHTML = '';
            window.turnstile.render(container, {
                sitekey: container.getAttribute('data-sitekey'),
                theme: 'light',
            });
        }
    } else {
        const waitForTurnstile = setInterval(() => {
            if (window.turnstile) {
                clearInterval(waitForTurnstile);
                const container = document.querySelector('.cf-turnstile');
                if (container) {
                    container.innerHTML = '';
                    window.turnstile.render(container, {
                        sitekey: container.getAttribute('data-sitekey'),
                        theme: 'light',
                    });
                }
            }
        }, 200);
        setTimeout(() => clearInterval(waitForTurnstile), 10000);
    }

    const form = document.getElementById("partner-form");
    const msg = document.getElementById("form-message");
    const btn = document.getElementById("submit-btn");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Validation
            if (!data.entity_name || !data.entity_name.trim()) {
                msg.textContent = "Please enter your entity name.";
                msg.className = "block text-red-500 pt-4 font-bold";
                form.querySelector('[name="entity_name"]').focus();
                return;
            }
            if (!data.tech_stack || !data.tech_stack.trim()) {
                msg.textContent = "Please enter your primary technical stack.";
                msg.className = "block text-red-500 pt-4 font-bold";
                form.querySelector('[name="tech_stack"]').focus();
                return;
            }

            btn.disabled = true;
            btn.textContent = "Processing...";

            // Cloudflare Turnstile verification
            const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
            if (!turnstileResponse || !turnstileResponse.value) {
                msg.innerHTML = '<span class="material-symbols-outlined text-red-500" style="font-size:16px;vertical-align:middle">security</span> Please complete the human verification.';
                msg.className = "block text-red-500 pt-4 font-bold";
                btn.disabled = false;
                btn.textContent = "Submit for Review";
                return;
            }

            try {
                const { data: responseData, error } = await supabase.functions.invoke("submit-form", {
                    body: {
                        formType: "partner",
                        turnstileToken: turnstileResponse.value,
                        formData: data,
                    },
                });

                if (error) throw error;
                if (!responseData?.success) {
                    throw new Error(responseData?.error || "Verification failed");
                }

                msg.textContent = "Application received. We will contact you soon.";
                msg.className = "block text-green-500 pt-4 font-bold";
                form.reset();
                // Reset Turnstile widget
                if (window.turnstile) {
                    window.turnstile.reset();
                }
            } catch (err) {
                console.error(err);
                msg.textContent = "Something went wrong. Please try again.";
                msg.className = "block text-red-500 pt-4 font-bold";
            } finally {
                btn.disabled = false;
                btn.textContent = "Submit for Review";
            }
        });
    }
}

initPartnerPage();
