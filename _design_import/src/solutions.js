import "./styles/main.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { SolutionsHero } from "./components/SolutionsHero";
import { SolutionsList } from "./components/SolutionsList";
import { WhyUs } from "./components/WhyUs";
import { SolutionsCTA } from "./components/SolutionsCTA";

import { fadeInPage, initScrollReveals } from "./lib/pageTransitions.js";
import { applyGlobalSettings } from "./lib/settings.js";
import { applyComponentContentOverrides } from "./lib/componentContentOverrides.js";

const app = document.getElementById("app");

async function main() {
    await applyGlobalSettings();

    const navbarHtml = await Navbar();
    const footerHtml = await Footer();

    app.innerHTML = `
    ${navbarHtml}
    <main>
        ${SolutionsHero}
        ${SolutionsList}
        <section class="py-20 bg-slate-50/50 scroll-reveal">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <h2 class="text-4xl font-display font-black text-deepSlate mb-12">Why Our Solutions Stand Out</h2>
                ${WhyUs}
            </div>
        </section>
        ${SolutionsCTA}
    </main>
    ${footerHtml}
`;

    await applyComponentContentOverrides("solutions");

    // Initialize page animations and scroll reveals
    fadeInPage();
    initScrollReveals();
}

main();


