import "./styles/main.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ServicesHero } from "./components/ServicesHero";
import { ServicesGridDetailed } from "./components/ServicesGridDetailed";
import { TrustPillars } from "./components/TrustPillars";
import { ServicesCTA } from "./components/ServicesCTA";

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
        ${ServicesHero}
        ${ServicesGridDetailed}
        ${TrustPillars}
        ${ServicesCTA}
    </main>
    ${footerHtml}
`;

    await applyComponentContentOverrides("services");

    // Initialize page animations and scroll reveals
    fadeInPage();
    initScrollReveals();
}

main();


