export const ContactForm = `
<section class="py-20 relative">
    <div class="max-w-4xl mx-auto px-6 relative z-10">
        <div class="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/60 shadow-2xl shadow-blue-900/5">
            <div class="flex items-center justify-between mb-12">
                <h2 class="text-3xl font-display font-black text-deepSlate italic">Strategic Brief</h2>
                <span class="material-symbols-outlined text-slate-200 text-4xl">description</span>
            </div>
            <p class="text-slate-500 mb-12 font-light">Tell us about your mission. We'll analyze your needs and respond within 24 business hours.</p>
            
            <form id="contact-form" class="space-y-8">
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Name / Company</label>
                        <input type="text" id="contact-name" placeholder="John Doe or Acme Inc." required class="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate">
                    </div>
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Business Email</label>
                        <input type="email" id="contact-email" placeholder="hello@yourbrand.com" required class="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate">
                    </div>
                </div>

                <div class="space-y-3">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">I am interested in</label>
                    <select id="contact-service" class="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate appearance-none">
                        <option value="">Select a service category</option>
                        <option value="Website Development">Website Development</option>
                        <option value="Custom Web-App">Custom Web-App</option>
                        <option value="Mobile App Dev">Mobile App Dev</option>
                        <option value="Business Infrastructure">Business Infrastructure</option>
                        <option value="Secure Online Shop">Secure Online Shop</option>
                        <option value="Official Business Email">Official Business Email</option>
                    </select>
                </div>

                <div class="space-y-3">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Project Overview</label>
                    <textarea rows="4" id="contact-message" placeholder="Tell us about your project goals, timeline, and current pain points..." required class="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate resize-none"></textarea>
                </div>

                <!-- Cloudflare Turnstile CAPTCHA -->
                <div class="flex justify-center pt-2">
                    <div class="cf-turnstile" data-sitekey="0x4AAAAAACg5iYZrFZ9cIWvz" data-theme="light"></div>
                </div>

                <div class="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div class="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span class="material-symbols-outlined text-electricBlue text-sm">verified_user</span>
                        Response in 24 Business Hours
                    </div>
                    <button type="submit" id="contact-submit-btn" class="w-full md:w-auto px-12 py-5 bg-deepSlate text-white font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-black hover:shadow-2xl transition-all duration-300">
                        Submit Project Brief
                    </button>
                </div>

                <!-- Success/Error Messages -->
                <div id="contact-success" class="hidden text-center p-6 bg-green-50 border border-green-200 rounded-2xl">
                    <span class="material-symbols-outlined text-green-500 text-3xl mb-2 block">check_circle</span>
                    <p class="text-green-700 font-semibold">Message sent successfully!</p>
                    <p class="text-green-600 text-sm mt-1">We'll get back to you within 24 business hours.</p>
                </div>
                <div id="contact-error" class="hidden text-center p-6 bg-red-50 border border-red-200 rounded-2xl">
                    <span class="material-symbols-outlined text-red-500 text-3xl mb-2 block">error</span>
                    <p class="text-red-700 font-semibold">Something went wrong.</p>
                    <p class="text-red-600 text-sm mt-1">Please try again or email us directly at care@vanaila.com</p>
                </div>
            </form>
        </div>
    </div>
</section>
`;
