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
		"Official Business Email",
		"Establish Instant Trust & Authority",
		"Ditch generic email addresses. We architect professional Google Workspace (GWS) and custom domain email infrastructure that ensures your communication is secure and professional.",
	);

	const defaultPlans = [
		{
			tier: "Starter Tier",
			name: "Pro Identity",
			price: "IDR 1.5M",
			features: [
				"GWS Setup (Up to 5 Users)",
				"DNS Configuration (DKIM/SPF)",
				"Email Migration Support",
				"Standard Spam Protection",
			],
			cta: "Get Started",
			ctaLink: "/contact.html",
			featured: false,
		},
		{
			tier: "Authority Tier",
			name: "Corporate Comm",
			price: "IDR 4.5M",
			features: [
				"Unlimited User Setup Guide",
				"Advanced Security Protocols",
				"Custom Signature Design",
				"Shared Team Calendars",
				"Priority Deliverability Monitoring",
			],
			cta: "Professionalize Now",
			ctaLink: "/contact.html",
			featured: true,
		},
		{
			tier: "Enterprise Tier",
			name: "Secure Infrastructure",
			price: "CUSTOM PRICING",
			priceLabel: "Security Focus",
			features: [
				"Full DLP Setup",
				"Archival & eDiscovery",
				"Phishing Simulation",
				"24/7 Managed Email Security",
			],
			cta: "Secure My Domain",
			ctaLink: "/contact.html",
			featured: false,
		},
	];

	const dbPlans = await fetchPricingPlans("official-business-email", defaultPlans);
	const pricing = getPricingGrid("Email", dbPlans);

	const whyChoose = getWhyChoose("Professionalism by Design", [
		{
			icon: "verified",
			title: "100% Trust Factor",
			description:
				"Communication from @yourbrand.com vs @gmail.com leads to 3x higher response rates.",
		},
		{
			icon: "security",
			title: "Inbox Defense",
			description:
				"We implement advanced DNS records like SPF/DKIM to ensure your emails never hit the spam folder.",
		},
		{
			icon: "laptop_mac",
			title: "Seamless GWS",
			description:
				"Google Workspace integration for industry-standard collaboration and security.",
		},
		{
			icon: "sync",
			title: "Device Sync",
			description:
				"Perfect synchronization across mobile, desktop, and tablets with zero lag.",
		},
	]);

	const lifecycle = getLifecycle([
		{
			icon: "domain",
			title: "Domain Audit",
			description: "DNS Health & Status Check",
		},
		{
			icon: "badge",
			title: "Identity Setup",
			description: "GWS & User Provisioning",
		},
		{
			icon: "key",
			title: "Security Protocols",
			description: "DKIM, SPF & DMARC Config",
		},
		{
			icon: "move_to_inbox",
			title: "Migration",
			description: "Transitioning Existing Data",
		},
		{
			icon: "alternate_email",
			title: "Verification",
			description: "Deliverability Testing",
		},
	]);

	const cta = getReadyCTA(
		"Ready to professionalize",
		"your communication?",
		"First impressions matter in business. Let's setup your secure, high-authority email infrastructure today and start communicating with confidence.",
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

	await applyComponentContentOverrides("official-business-email");

	// Initialize page animations and scroll reveals
	fadeInPage();
	initScrollReveals();
}

main();
