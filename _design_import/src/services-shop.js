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
		"Secure Online Shops",
		"Your 24/7 Global Sales Machine",
		"We build robust, automated systems designed for high conversion and effortless scalability. Secure, fast, and engineered to grow your brand across borders.",
	);

	const defaultPlans = [
		{
			tier: "Beginner Started",
			name: "The Startup Shop",
			price: "IDR 6.5M",
			features: [
				"WooCommerce Advanced Setup",
				"Up to 50 Product Listings",
				"WhatsApp Order Integration",
				"Standard Performance Optimization",
			],
			cta: "Select Plan",
			ctaLink: "/contact.html",
			featured: false,
		},
		{
			tier: "Modern Architecture",
			name: "The Growth Merchant",
			price: "IDR 18.5M",
			features: [
				"Svelte/Headless E-commerce",
				"Automated Payments (QRIS/VA)",
				"Omnichannel Dropship/Stock Sync",
				"Enterprise-Grade Security Layer",
				"Advanced Conversion Analytics",
			],
			cta: "Scale My Store",
			ctaLink: "/contact.html",
			featured: true,
		},
		{
			tier: "Bespoke Ecosystem",
			name: "The Enterprise Retailer",
			price: "CUSTOM PRICING",
			priceLabel: "Architecture Focus",
			features: [
				"Custom React/Svelte Frontends",
				"Native Mobile Apps (iOS/Android)",
				"Advanced Loyalty & Remarketing Systems",
				"Custom B2B Portals & Integration",
			],
			cta: "Consult Enterprise",
			ctaLink: "/contact.html",
			featured: false,
		},
	];

	const dbPlans = await fetchPricingPlans("secure-online-shops", defaultPlans);
	const pricing = getPricingGrid("ECom", dbPlans);

	const whyChoose = getWhyChoose("Built for Reliability & Speed", [
		{
			icon: "verified_user",
			title: "8+ Years Reliability",
			description:
				"Proven track record of maintaining high-uptime sales platforms for diverse industries.",
		},
		{
			icon: "storefront",
			title: "Ecosystem Experts",
			description:
				"Seamless integration with Midtrans, Xendit, and local Indonesian logistics providers.",
		},
		{
			icon: "payments",
			title: "Best Price Guarantee",
			description:
				"Maximum performance per cost ratio for high-performance e-commerce solutions.",
		},
		{
			icon: "support_agent",
			title: "The 24-Hour SLA",
			description:
				"Critical support when you need it most. We guarantee rapid response for store-stopping issues.",
		},
	]);

	const lifecycle = getLifecycle([
		{
			icon: "strategy",
			title: "Strategy & Audit",
			description: "Inventory & Goal Mapping",
		},
		{
			icon: "storage",
			title: "Infrastructure",
			description: "Server & Stack Selection",
		},
		{
			icon: "brush",
			title: "UX & Design",
			description: "High-Conversion Interface",
		},
		{
			icon: "sync",
			title: "Integration",
			description: "Payments & Logistics Sync",
		},
		{
			icon: "rocket",
			title: "Launch & Support",
			description: "Go-Live & Maintenance",
		},
	]);

	const cta = getReadyCTA(
		"Ready to dominate the",
		"digital market?",
		"Let's build a shop that sells while you sleep. Our automated ecommerce engines take care of the technical complexity so you can focus on scaling your vision.",
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

	await applyComponentContentOverrides("secure-online-shops");

	// Initialize page animations and scroll reveals
	fadeInPage();
	initScrollReveals();
}

main();
