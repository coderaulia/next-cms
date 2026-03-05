import "./styles/main.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import {
	getServiceHero,
	getPricingGrid,
	getWhyChoose,
	getLifecycle,
	getReadyCTA,
	fetchPricingPlans,
} from "./components/service-detail/ServiceDetailComponents";
import { fadeInPage, initScrollReveals } from "./lib/pageTransitions.js";
import { applyGlobalSettings } from "./lib/settings.js";
import { applyComponentContentOverrides } from "./lib/componentContentOverrides.js";

const app = document.getElementById("app");

async function main() {
	await applyGlobalSettings();

	const hero = getServiceHero(
		"Website Development",
		"Engineering Your Digital Growth",
		"Transform your online presence into a performance-driven asset. With over 8 years of pedigree in technical architecture, we build infrastructure that scales with your ambition.",
	);

	const defaultPlans = [
		{
			tier: "Base Tier",
			name: "Startup",
			price: "IDR 3.5M",
			features: [
				"5 Premium Pages",
				"Mobile-First Responsive Design",
				"Core Web Vitals Optimized",
				"Standard CMS Integration",
			],
			cta: "Select Package",
			ctaLink: "/contact.html",
			featured: false,
		},
		{
			tier: "Growth Tier",
			name: "Professional",
			price: "IDR 7.5M",
			features: [
				"Up to 12 Advanced Pages",
				"Custom UX/UI Research",
				"Technical SEO Architecture",
				"Conversion Rate Optimization",
				"API & Third-party Integration",
			],
			cta: "Get Started Now",
			ctaLink: "/contact.html",
			featured: true,
		},
		{
			tier: "Scale Tier",
			name: "Enterprise",
			price: "CUSTOM PRICING",
			priceLabel: "Infrastructure Focus",
			features: [
				"Unlimited Build & Pages",
				"Custom Backend Engineering",
				"Enterprise-Grade Security",
				"Dedicated DevOps Support",
			],
			cta: "Contact Architecture Team",
			ctaLink: "/contact.html",
			featured: false,
		},
	];

	const dbPlans = await fetchPricingPlans("website-development", defaultPlans);
	const pricing = getPricingGrid("WebDev", dbPlans);

	const whyChoose = getWhyChoose("Why Choose Vanaila?", [
		{
			icon: "schedule",
			title: "24-Hour SLA",
			description:
				"Critical technical support and updates with a guaranteed 24-hour response window.",
		},
		{
			icon: "history_edu",
			title: "8+ Years Pedigree",
			description:
				"A decade of engineering experience building digital assets for global market leaders.",
		},
		{
			icon: "verified",
			title: "Best Price Guarantee",
			description:
				"Premium engineering at competitive rates. Transparent pricing without hidden fees.",
		},
		{
			icon: "hub",
			title: "Ecosystem Ready",
			description:
				"Modular builds designed to integrate seamlessly with your existing tech stack.",
		},
	]);

	const lifecycle = getLifecycle([
		{
			icon: "search",
			title: "Discovery",
			description: "Requirements & Business Audit",
		},
		{
			icon: "architecture",
			title: "Architecture",
			description: "Technical Design & Sitemap",
		},
		{
			icon: "code",
			title: "Development",
			description: "Clean Engineering & UI",
		},
		{
			icon: "fact_check",
			title: "QA & Testing",
			description: "Stress Test & UX Validation",
		},
		{
			icon: "rocket_launch",
			title: "Deployment",
			description: "Go-Live & Cloud Config",
		},
	]);

	const cta = getReadyCTA(
		"Ready to Build Your",
		"Digital Future?",
		"Whether you're a scaling startup or an established enterprise, our technical clarity will pave the way for your next digital breakthrough.",
	);

	const navbarHtml = await Navbar();
	const footerHtml = await Footer();

	app.innerHTML = `
    ${navbarHtml}
    <main>
        ${hero}
        ${pricing}
        ${whyChoose}
        ${lifecycle}
        ${cta}
    </main>
    ${footerHtml}
`;

	await applyComponentContentOverrides("website-development");

	// Initialize page animations and scroll reveals
	fadeInPage();
	initScrollReveals();
}

main();
