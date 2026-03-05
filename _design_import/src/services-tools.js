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
		"Custom Business Tools",
		"Automate Your Unique Workflows",
		"Stop wasting hours on manual data entry and inefficient processes. We build bespoke internal tools and automation systems that act as the technical backbone of your operations.",
	);

	const defaultPlans = [
		{
			tier: "Automation Tier",
			name: "Process Boost",
			price: "IDR 5.5M",
			features: [
				"Specific Workflow Automation",
				"Internal Dashboard (Basic)",
				"API Integration (1-2 Systems)",
				"Standard Maintenance Support",
			],
			cta: "Select Package",
			ctaLink: "/contact.html",
			featured: false,
		},
		{
			tier: "Infrastructure Tier",
			name: "Operational Core",
			price: "IDR 12.5M",
			features: [
				"Comprehensive HR/Ops Portal",
				"Role-Based Access Control",
				"Complex Database Architecture",
				"Custom Reporting & Analytics",
				"Unlimited User Licenses",
			],
			cta: "Build My System",
			ctaLink: "/contact.html",
			featured: true,
		},
		{
			tier: "Ecosystem Tier",
			name: "Enterprise Hub",
			price: "CUSTOM PRICING",
			priceLabel: "Architecture Focus",
			features: [
				"Legacy System Modernization",
				"High-Security Data Pipelines",
				"Custom AI/ML Integration",
				"24/7 Priority Infrastructure Support",
			],
			cta: "Architect Our Solution",
			ctaLink: "/contact.html",
			featured: false,
		},
	];

	const dbPlans = await fetchPricingPlans("custom-business-tools", defaultPlans);
	const pricing = getPricingGrid("Tools", dbPlans);

	const whyChoose = getWhyChoose("Engineered for Efficiency", [
		{
			icon: "bolt",
			title: "Rapid ROI",
			description:
				"Our tools typically pay for themselves within months by recouping hundreds of wasted work hours.",
		},
		{
			icon: "security",
			title: "Bank-Grade Security",
			description:
				"Internal data is your most valuable asset. We build with strict encryption and audit protocols.",
		},
		{
			icon: "settings_suggest",
			title: "Custom Tailored",
			description:
				"No generic templates. Every line of code is written to mirror your specific business logic.",
		},
		{
			icon: "sync_alt",
			title: "Ecosystem Integration",
			description:
				"We ensure your new tools sync perfectly with Slack, GWS, and your existing CRM.",
		},
	]);

	const lifecycle = getLifecycle([
		{
			icon: "troubleshoot",
			title: "Workflow Audit",
			description: "Identifying Manual Bottlenecks",
		},
		{
			icon: "schema",
			title: "Database Design",
			description: "Architecture for Data Integrity",
		},
		{
			icon: "terminal",
			title: "Core Engineering",
			description: "Bespoke Logic & Backend",
		},
		{
			icon: "bug_report",
			title: "Stress Testing",
			description: "QA in Real-World Scenarios",
		},
		{
			icon: "dns",
			title: "Deployment",
			description: "Secure Migration & Training",
		},
	]);

	const cta = getReadyCTA(
		"Ready to automate your",
		"operational friction?",
		"Turn technical complexity into a competitive advantage. Our engineers are ready to build the tools that will power your company's next phase of growth.",
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

	await applyComponentContentOverrides("custom-business-tools");

	// Initialize page animations and scroll reveals
	fadeInPage();
	initScrollReveals();
}

main();
