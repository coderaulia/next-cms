import "./styles/main.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AboutHero } from "./components/AboutHero";
import { Story } from "./components/Story";
import { Vision } from "./components/Vision";
import { Values } from "./components/Values";
import { Quote } from "./components/Quote";
import { ContactCTA } from "./components/ContactCTA";

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
        ${AboutHero}
        ${Story}
        ${Vision}
        ${Values}
        ${Quote}
        ${ContactCTA}
    </main>
    ${footerHtml}
`;

    await applyComponentContentOverrides("about");

    // Initialize page animations and scroll reveals
    fadeInPage();
    initScrollReveals();
}

main();


