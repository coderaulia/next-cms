import "./styles/main.css";
import { supabase } from "./lib/supabase.js";
import { Navbar } from "./components/Navbar.js";
import { Footer } from "./components/Footer.js";
import { BlogHero } from "./components/BlogHero.js";
import { HomeCTA } from "./components/HomeCTA.js";
import { fadeInPage, initScrollReveals } from "./lib/pageTransitions.js";
import { revealPanels } from "./lib/animations.js";
import { applyGlobalSettings, getSettings } from "./lib/settings.js";

// XSS protection
const escapeHtml = (str) => {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

const app = document.getElementById("app");



async function main() {

    await applyGlobalSettings();

    initBlog();

}



async function initBlog() {

    // Await async components
    const navbarHtml = await Navbar();
    const footerHtml = await Footer();

    // Initial Shell

    app.innerHTML = `

        ${navbarHtml}

        <main>

            ${BlogHero}

            <section class="py-12" id="blog-content">

                <div class="max-w-7xl mx-auto px-6 lg:px-12">

                    <!-- Dynamic Content Goes Here -->

                    <div class="flex justify-center py-20">

                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>

                    </div>

                </div>

            </section>

            ${HomeCTA}

        </main>

        ${footerHtml}

    `;



    try {

        // Fetch Posts and Categories

        const [postsRes, catsRes] = await Promise.all([

            supabase

                .from("posts")

                .select("*, categories(name)")

                .eq("status", "published")

                .order("created_at", { ascending: false }),

            supabase.from("categories").select("*"),

        ]);



        if (postsRes.error) throw postsRes.error;

        const posts = postsRes.data;
        const categories = catsRes.data || [];
        const settings = await getSettings();

        renderBlogContent(posts, categories, settings);

        // Initialize page animations and scroll reveals

        fadeInPage();

        initScrollReveals();

    } catch (err) {

        console.error("Failed to load blog:", err);

        app.querySelector("#blog-content").innerHTML =

            `<div class="text-center text-slate-500">Error loading insights. Please try again later.</div>`;

    }

}



function renderBlogContent(posts, categories, settings) {

    const featuredPost = posts[0];

    const gridPosts = posts.slice(1);

    const authorName = escapeHtml(settings?.author_name || "Aris Truno");
    const authorTitle = escapeHtml(settings?.author_title || "Lead Architect");
    const authorAvatar = escapeHtml(settings?.author_avatar || "");

    const blogContentEl = document.getElementById("blog-content");



    blogContentEl.innerHTML = `

        <div class="max-w-7xl mx-auto px-6 lg:px-12 space-y-20">

            <!-- Featured -->

            ${featuredPost

            ? `

            <div class="scroll-reveal">

                <div class="glass-panel p-4 rounded-[3rem] bg-white overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-700" onclick="window.location.href='/post.html?slug=${featuredPost.slug}'">

                    <div class="grid lg:grid-cols-2 gap-8 items-center">

                        <div class="bg-deepSlate aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden relative">

                            ${featuredPost.featured_image ? `<img src="${featuredPost.featured_image}" class="absolute inset-0 w-full h-full object-cover">` : ""}

                            <div class="absolute inset-0 bg-gradient-to-br from-electricBlue/20 to-transparent z-10"></div>

                            <div class="absolute bottom-8 left-8 z-20">

                                <span class="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-full group-hover:bg-white group-hover:text-deepSlate transition-colors">Featured Article</span>

                            </div>

                        </div>

                        <div class="p-8 lg:p-12 space-y-8">

                            <div class="space-y-4">

                                <span class="text-[10px] font-bold uppercase tracking-widest text-electricBlue">${featuredPost.categories?.name || "Engineering"}</span>

                                <h2 class="text-4xl md:text-5xl font-display font-black text-deepSlate leading-tight group-hover:text-electricBlue transition-colors">

                                    ${featuredPost.title}

                                </h2>

                                <p class="text-slate-500 font-light leading-relaxed text-lg">

                                    ${featuredPost.excerpt || ""}

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

                                <span class="text-xs font-bold uppercase tracking-widest text-electricBlue flex items-center gap-2 group/link">

                                    Read Article

                                    <span class="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            `

            : ""

        }



            <!-- Filter & Search -->

            <div class="flex flex-col md:flex-row justify-between items-center gap-8 scroll-reveal">

                <div class="flex gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar" id="category-filters">

                    <button class="cat-filter px-6 py-2 bg-deepSlate text-white font-bold text-[10px] uppercase tracking-widest rounded-full whitespace-nowrap active" data-cat="all">All Insights</button>

                    ${categories

            .map(

                (cat) => `

                        <button class="cat-filter px-6 py-2 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-full border border-slate-100 whitespace-nowrap hover:bg-white hover:text-deepSlate transition-all" data-cat="${cat.id}">${cat.name}</button>

                    `,

            )

            .join("")}

                </div>

                <div class="relative w-full md:w-64">

                    <input type="text" id="blog-search" placeholder="Search insights..." class="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none text-xs font-medium">

                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>

                </div>

            </div>



            <!-- Grid -->

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="posts-grid">

                ${gridPosts.map((post) => renderPostCard(post)).join("")}

            </div>

        </div>

    `;



    // Event Listeners for Filters

    setupBlogInteractions(posts);

}



function renderPostCard(post) {

    return `

        <div class="glass-panel p-4 rounded-[2.5rem] bg-white group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5 transition-all panel-reveal" onclick="window.location.href='/post.html?slug=${post.slug}'">

            <div class="bg-blue-100/30 aspect-video rounded-[2rem] mb-8 overflow-hidden relative">

                ${post.featured_image

            ? `<img src="${post.featured_image}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">`

            : `

                    <div class="absolute inset-0 flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-700">

                        <span class="material-symbols-outlined text-6xl text-electricBlue">description</span>

                    </div>

                `

        }

                <span class="absolute top-4 left-4 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 text-electricBlue font-bold text-[8px] uppercase tracking-widest rounded-full z-10">${post.categories?.name || "Insight"}</span>

            </div>

            <div class="px-6 pb-6 space-y-4 flex-grow flex flex-col">

                <div class="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">

                    <span>${new Date(post.published_at || post.created_at).toLocaleDateString()}</span>

                </div>

                <h3 class="text-xl font-display font-black text-deepSlate group-hover:text-electricBlue transition-colors leading-tight">${post.title}</h3>

                <p class="text-slate-500 text-sm font-light leading-relaxed mb-6 flex-grow">${post.excerpt || ""}</p>

                <div class="text-[10px] font-bold uppercase tracking-widest text-deepSlate flex items-center gap-2 pt-4 border-t border-slate-50">Read More <span class="material-symbols-outlined text-xs">arrow_outward</span></div>

            </div>

        </div>

    `;

}



function setupBlogInteractions(allPosts) {

    const searchInput = document.getElementById("blog-search");

    const filters = document.querySelectorAll(".cat-filter");

    const grid = document.getElementById("posts-grid");



    const filterPosts = () => {

        const query = searchInput.value.toLowerCase();

        const activeCat =

            document.querySelector(".cat-filter.active").dataset.cat;



        const filtered = allPosts.slice(1).filter((post) => {

            const matchesSearch =

                post.title.toLowerCase().includes(query) ||

                (post.excerpt && post.excerpt.toLowerCase().includes(query));

            const matchesCat =

                activeCat === "all" || post.category_id == activeCat;

            return matchesSearch && matchesCat;

        });



        grid.innerHTML = filtered.map((post) => renderPostCard(post)).join("");

        revealPanels("#posts-grid .panel-reveal");

    };



    searchInput?.addEventListener("input", filterPosts);

    filters.forEach((btn) => {

        btn.addEventListener("click", () => {

            filters.forEach((f) => {

                f.classList.remove("bg-deepSlate", "text-white", "active");

                f.classList.add("bg-slate-50", "text-slate-400");

            });

            btn.classList.add("bg-deepSlate", "text-white", "active");

            btn.classList.remove("bg-slate-50", "text-slate-400");

            filterPosts();

        });

    });

}



main();


