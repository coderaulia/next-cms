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
		"Mobile Business App",
		"Native Power, Cross-Platform Speed",
		"Reach your customers where they spend most of their time. We deliver high-fidelity, native-performing iOS and Android applications built from a single high-performance codebase.",
	);

	const defaultPlans = [
		{
			tier: "MVP Tier",
			name: "App Launchpad",
			price: "IDR 15.0M",
			features: [
				"React Native Framework",
				"Cross-Platform (iOS & Android)",
				"Core Business Features",
				"Standard Store Deployment",
			],
			cta: "Select Kickstart",
			ctaLink: "/contact.html",
			featured: false,
		},
		{
			tier: "Engagement Tier",
			name: "Advanced Native",
			price: "IDR 35.0M",
			features: [
				"Custom UI/UX Transitions",
				"Push Notification Architecture",
				"Offline-First Data Sync",
				"Biometric Authentication",
				"Priority Store Approval Support",
			],
			cta: "Build Premium App",
			featured: true,
		},
		{
			tier: "Ecosystem Tier",
			name: "Enterprise Native",
			price: "CUSTOM PRICING",
			priceLabel: "Infrastructure Focus",
			features: [
				"Complex Backend Integration",
				"High-Security Payment SDKs",
				"Custom Analytics Dashboard",
				"Multi-Region Cloud Hosting",
			],
			cta: "Consult Architect",
			ctaLink: "/contact.html",
			featured: false,
		},
	];

	const dbPlans = await fetchPricingPlans("mobile-business-app", defaultPlans);
	const pricing = getPricingGrid("Mobile", dbPlans);

	const whyChoose = getWhyChoose("Why Go Mobile with Us?", [
		{
			icon: "speed",
			title: "Single Base, Dual Power",
			description:
				"Maximum reach with React Native, delivering both iOS and Android apps simultaneously.",
		},
		{
			icon: "vibration",
			title: "High-Fidelity UX",
			description:
				"60FPS animations and native-feel navigation that users love and trust.",
		},
		{
			icon: "cloud_done",
			title: "Cloud-Synced",
			description:
				"Real-time data synchronization between web and mobile platforms for a seamless experience.",
		},
		{
			icon: "verified",
			title: "App Store Guaranteed",
			description:
				"We handle the entire rejection-proof submission process for Apple and Google stores.",
		},
	]);

	const lifecycle = getLifecycle([
		{
			icon: "draw",
			title: "UX Wireframing",
			description: "User Journey & Interaction",
		},
		{
			icon: "phone_android",
			title: "Native Dev",
			description: "Cross-Platform Programming",
		},
		{
			icon: "api",
			title: "Backend Bridge",
			description: "Infrastructure & API Sync",
		},
		{
			icon: "touch_app",
			title: "Alpha/Beta Test",
			description: "User Feedback & Debugging",
		},
		{
			icon: "publish",
			title: "Store Launch",
			description: "Deployment to App Stores",
		},
	]);

	const cta = getReadyCTA(
		"Ready to put your brand",
		"in their pocket?",
		"Don't settle for a mobile website when you need a high-performance application. Let's discuss your mobile strategy and start building today.",
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

	await applyComponentContentOverrides("mobile-business-app");

	// Initialize page animations and scroll reveals
	fadeInPage();
	initScrollReveals();
}

main();
