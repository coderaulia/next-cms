import "./styles/main.css";
import { supabase } from "./lib/supabase.js";
import { Navbar } from "./components/Navbar.js";
import { Footer } from "./components/Footer.js";
import { HomeCTA } from "./components/HomeCTA.js";
import { fadeInPage, initScrollReveals } from "./lib/pageTransitions.js";
import { applyGlobalSettings, clearSettingsCache, getSettings } from "./lib/settings.js";
import { sanitizeHtml } from "./lib/sanitize.js";

// XSS protection helper
const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const app = document.getElementById("app");

async function renderPost() {
    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get("slug");

    // Fallback: Try to extract slug from path (e.g., /blog/post-slug)
    if (!slug) {
        const pathSegments = window.location.pathname.split("/");
        // If path is /blog/some-slug or /post.html/some-slug
        if (pathSegments.length >= 2) {
            slug = pathSegments[pathSegments.length - 1].replace(".html", "");
            if (slug === "post" || slug === "blog" || !slug) slug = null;
        }
    }

    if (!slug) {
        window.location.href = "/blog.html";
        return;
    }
    await applyGlobalSettings();
    const settings = await getSettings();

    // Author defaults from global settings (overridden per-post later)
    let authorName = escapeHtml(settings.author_name || "Aris Truno");
    let authorTitle = escapeHtml(settings.author_title || "Lead Architect");
    let authorBio = escapeHtml(settings.author_bio || "Lead Architect at Vanaila Digital. Aris specializes in performance-first infrastructure.");
    let authorAvatar = escapeHtml(settings.author_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Aris");
    const authorLinkedIn = escapeHtml(settings.author_linkedin || "#");
    const authorGitHub = escapeHtml(settings.author_github || "#");
    const authorTwitter = escapeHtml(settings.author_twitter || "#");

    const navbarHtml = await Navbar();
    const footerHtml = await Footer();

    // Initial Layout with Skeleton
    app.innerHTML = `
        ${navbarHtml}
        <main class="bg-slate-50/30">
            <!-- Hero Section -->
            <section class="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-deepSlate">
                <div id="hero-image-container" class="absolute inset-0 opacity-40"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-deepSlate/20 to-deepSlate/60"></div>
                
                <div class="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-end pb-24">
                    <div id="hero-card" class="glass-panel p-8 md:p-12 max-w-3xl rounded-[2.5rem] bg-white/90 backdrop-blur-2xl shadow-2xl translate-y-20 opacity-0 border border-white/40">
                        <div id="post-meta-skeleton" class="animate-pulse space-y-4">
                            <div class="h-4 bg-slate-200 rounded w-24"></div>
                            <div class="h-12 bg-slate-200 rounded w-full"></div>
                            <div class="flex items-center gap-4 pt-4">
                                <div class="w-12 h-12 rounded-full bg-slate-200"></div>
                                <div class="h-4 bg-slate-200 rounded w-32"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Content Section -->
            <section class="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
                <div class="flex flex-col lg:flex-row gap-16">
                    <!-- Sidebar (Sticky TOC) -->
                    <aside class="hidden lg:block w-64 shrink-0">
                        <div class="sticky top-32 space-y-12">
                            <div>
                                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Table of Contents</h4>
                                <nav class="space-y-4" id="toc-nav">
                                    <!-- Dynamic TOC injected here -->
                                </nav>
                            </div>
                            <div>
                                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Share Article</h4>
                                <div class="flex gap-4">
                                    <button id="share-btn" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-electricBlue hover:text-electricBlue transition-all" title="Share Article">
                                        <span class="material-symbols-outlined text-sm">share</span>
                                    </button>
                                    <button id="copy-link-btn" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-electricBlue hover:text-electricBlue transition-all" title="Copy Link">
                                        <span class="material-symbols-outlined text-sm">link</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <!-- Article Body -->
                    <div class="flex-grow max-w-3xl">
                        <div id="post-body" class="scroll-reveal prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-black prose-p:font-light prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-electricBlue prose-blockquote:bg-blue-50/50 prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-img:rounded-[2rem] prose-img:shadow-2xl">
                             <!-- Loading state -->
                             <div class="animate-pulse space-y-8">
                                <div class="h-4 bg-slate-100 rounded w-full"></div>
                                <div class="h-4 bg-slate-100 rounded w-full"></div>
                                <div class="h-64 bg-slate-100 rounded-[2rem] w-full"></div>
                                <div class="h-4 bg-slate-100 rounded w-2/3"></div>
                             </div>
                        </div>

                        <!-- Author Bio -->
                        <div id="author-bio" class="mt-24 p-10 md:p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-center md:items-start scroll-reveal">
                            <div class="w-24 h-24 rounded-[2rem] bg-amber-100 shrink-0 overflow-hidden">
                                <img src="${authorAvatar}" alt="Author" class="w-full h-full object-cover">
                            </div>
                            <div class="text-center md:text-left space-y-4">
                                <h4 class="text-xl font-display font-black text-deepSlate">${authorName}</h4>
                                <p class="text-slate-500 font-light leading-relaxed">${authorBio}</p>
                                <div class="flex justify-center md:justify-start gap-6 pt-2">
                                    ${settings.author_linkedin ? `<a href="${authorLinkedIn}" class="text-[10px] font-bold uppercase tracking-widest text-electricBlue hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}
                                    ${settings.author_github ? `<a href="${authorGitHub}" class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-deepSlate" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
                                    ${settings.author_twitter ? `<a href="${authorTwitter}" class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-deepSlate" target="_blank" rel="noopener noreferrer">Twitter</a>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Related Posts -->
            <section class="bg-white border-t border-slate-100 py-32">
                <div class="max-w-7xl mx-auto px-6 lg:px-12">
                    <div class="flex justify-between items-end mb-16">
                        <div>
                            <h4 class="text-xs font-bold uppercase tracking-widest text-electricBlue mb-4">Read Next</h4>
                            <h2 class="text-4xl font-display font-black text-deepSlate">Related <span class="text-electricBlue italic">Insights</span></h2>
                        </div>
                        <a href="/blog.html" class="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-deepSlate transition-colors">
                            View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                    <div id="related-posts-grid" class="grid md:grid-cols-3 gap-8">
                        <!-- Loading skeletons -->
                        ${[1, 2, 3]
            .map(
                () => `
                            <div class="animate-pulse space-y-4">
                                <div class="aspect-video bg-slate-100 rounded-3xl"></div>
                                <div class="h-4 bg-slate-100 rounded w-1/4"></div>
                                <div class="h-6 bg-slate-100 rounded w-full"></div>
                            </div>
                        `,
            )
            .join("")}
                    </div>
                </div>
            </section>

            ${HomeCTA}
        </main>
        ${footerHtml}
    `;

    try {
        // Fetch Post
        const { data: post, error } = await supabase
            .from("posts")
            .select("*, categories(name)")
            .eq("slug", slug)
            .eq("status", "published")
            .single();

        if (error) {
            console.error("Supabase Error (Post):", error.message, error.details);
            throw new Error(`Data fetch failed: ${error.message}`);
        }

        if (!post) {
            // Check if it exists but is not published
            const { data: exists } = await supabase
                .from("posts")
                .select("id, status")
                .eq("slug", slug)
                .single();

            if (exists) {
                throw new Error(
                    `Post exists but status is "${exists.status}". It must be "published" to view.`,
                );
            } else {
                throw new Error(`Post with slug "${slug}" not found in database.`);
            }
        }

        // Set SEO title FIRST (before applyGlobalSettings which may overwrite it)
        // Use post-specific SEO if available, otherwise use post title
        const seoTitle = post.meta_title || post.title || "Vanaila Digital";
        document.title = seoTitle;

        // Create or update meta description
        const description = post.meta_description || post.excerpt || "";
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement("meta");
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = description;
        }

        // Override author info from post's own author column (if set)
        if (post.author && post.author !== "Administrator") {
            authorName = escapeHtml(post.author);
            // Generate a unique avatar based on post author name
            authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author)}`;
        }

        // Fetch Related Posts
        const { data: related } = await supabase
            .from("posts")
            .select("*, categories(name)")
            .neq("id", post.id)
            .eq("category_id", post.category_id)
            .limit(3);

        const date = new Date(
            post.created_at || post.published_at,
        ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        // Background Image (sanitize URL)
        if (post.featured_image) {
            document.getElementById("hero-image-container").innerHTML = `
                <img src="${escapeHtml(post.featured_image)}" class="w-full h-full object-cover" alt="${escapeHtml(post.title)}">
            `;
        }

        // Hero Card Content
        document.getElementById("hero-card").innerHTML = `
            <div class="flex items-center gap-3 px-4 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/20 text-electricBlue text-[10px] font-bold uppercase tracking-widest mb-8 w-fit">
                ${escapeHtml(post.categories?.name || "Insight")} • ${date}
            </div>
            <h1 class="text-3xl md:text-5xl font-display font-black text-deepSlate leading-tight mb-8 tracking-tighter">
                ${escapeHtml(post.title)}
            </h1>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                    <img src="${authorAvatar}" class="w-full h-full object-cover">
                </div>
                <div>
                    <h4 class="text-sm font-bold text-deepSlate">${authorName}</h4>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${authorTitle}</p>
                </div>
            </div>
        `;

        // Animate hero card in
        const heroCard = document.getElementById("hero-card");
        heroCard.style.opacity = "0";
        heroCard.style.transform = "translateY(20px)";
        heroCard.style.transition = "all 0.8s ease-out";
        void heroCard.offsetHeight; // Force reflow
        heroCard.style.opacity = "1";
        heroCard.style.transform = "translateY(0)";

        // Body Content
        const postBodyEl = document.getElementById("post-body");
        postBodyEl.innerHTML = sanitizeHtml(post.content || "");

        // Generate Dynamic Table of Contents
        const headings = postBodyEl.querySelectorAll("h2, h3");
        const tocNav = document.getElementById("toc-nav");
        if (headings.length > 0) {
            tocNav.innerHTML = ""; // clear loading or empty state
            headings.forEach((heading, idx) => {
                // Determine ID or create one based on text
                if (!heading.id) {
                    heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    // Fallback to ensuring uniqueness
                    if (!heading.id) heading.id = "heading-" + idx;
                }

                const isH3 = heading.tagName.toLowerCase() === "h3";
                tocNav.innerHTML += `
                    <a href="#${heading.id}" class="${isH3 ? 'pl-4 ' : ''}block text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-electricBlue transition-colors line-clamp-2 leading-relaxed">${heading.textContent}</a>
                `;
            });
        } else {
            tocNav.innerHTML = '<span class="text-xs text-slate-400">No headings available</span>';
        }

        // Share Buttons Logic
        const pageUrl = window.location.href;
        document.getElementById("share-btn").addEventListener("click", () => {
            if (navigator.share) {
                navigator.share({
                    title: post.title,
                    text: 'Check out this article from Vanaila Digital',
                    url: pageUrl
                }).catch(console.error);
            } else {
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`, "_blank");
            }
        });

        document.getElementById("copy-link-btn").addEventListener("click", (e) => {
            navigator.clipboard.writeText(pageUrl);
            const icon = e.currentTarget.querySelector('span');
            icon.textContent = "check";
            icon.classList.add("text-emerald-500");
            setTimeout(() => {
                icon.textContent = "link";
                icon.classList.remove("text-emerald-500");
            }, 2000);
        });

        // Related Posts
        if (related && related.length > 0) {
            document.getElementById("related-posts-grid").innerHTML = related
                .map(
                    (p) => `
                <a href="/post.html?slug=${encodeURIComponent(p.slug)}" class="group space-y-6 block">
                    <div class="aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                        ${p.featured_image ? `<img src="${escapeHtml(p.featured_image)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="${escapeHtml(p.title)}">` : ""}
                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div class="space-y-3">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-electricBlue">${p.categories?.name || "Insight"}</span>
                        <h3 class="text-xl font-display font-black text-deepSlate group-hover:text-electricBlue transition-colors leading-tight">${p.title}</h3>
                        <p class="text-xs font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-2">Read Article <span class="material-symbols-outlined text-sm">arrow_outward</span></p>
                    </div>
                </a >
                    `,
                )
                .join("");
        } else {
            document.getElementById("related-posts-grid").innerHTML =
                `<p class="text-slate-400">No related insights found.</p>`;
        }

        // Initialize page animations and scroll reveals
        fadeInPage();
        initScrollReveals();

        // Apply global settings (favicon, etc) after content is loaded
        try {
            await applyGlobalSettings();
        } catch (e) {
            console.warn("Failed to apply global settings:", e);
        }
    } catch (err) {
        console.error(err);
        app.innerHTML = `
            ${navbarHtml}
                <main class="pt-40 pb-32 text-center">
                    <h1 class="text-4xl font-display font-black text-deepSlate mb-6">Insight Not Found</h1>
                    <p class="text-slate-500 mb-10">The technical deep-dive you are looking for has migrated or does not exist.</p>
                    <a href="/blog.html" class="px-10 py-4 bg-electricBlue text-white font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-deepSlate transition-all">Back to Ecosystem</a>
                </main>
            ${footerHtml}
                `;
    }
}

renderPost();
