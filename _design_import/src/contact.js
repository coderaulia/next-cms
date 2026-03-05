import "./styles/main.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ContactHero } from "./components/ContactHero";
import { ContactForm } from "./components/ContactForm";
import { ContactMethods } from "./components/ContactMethods";
import { supabase } from "./lib/supabase.js";

import { fadeInPage, initScrollReveals } from "./lib/pageTransitions.js";
import { applyGlobalSettings } from "./lib/settings.js";

const app = document.getElementById("app");

async function main() {
	await applyGlobalSettings();

	const navbarHtml = await Navbar();
	const footerHtml = await Footer();
	const contactMethodsHTML = await ContactMethods();

	app.innerHTML = `
    ${navbarHtml}
    <main>
        <div class="scroll-reveal">${ContactHero}</div>
        <div class="panel-reveal">${ContactForm}</div>
        <div class="scroll-reveal">${contactMethodsHTML}</div>
    </main>
    ${footerHtml}
`;

	// Initialize page animations and scroll reveals
	fadeInPage();
	initScrollReveals();

	// Explicitly render Turnstile after DOM is ready
	if (window.turnstile) {
		const container = document.querySelector('.cf-turnstile');
		if (container) {
			container.innerHTML = ''; // Clear any stale state
			window.turnstile.render(container, {
				sitekey: container.getAttribute('data-sitekey'),
				theme: 'light',
			});
		}
	} else {
		// If Turnstile script hasn't loaded yet, wait for it
		const waitForTurnstile = setInterval(() => {
			if (window.turnstile) {
				clearInterval(waitForTurnstile);
				const container = document.querySelector('.cf-turnstile');
				if (container) {
					container.innerHTML = '';
					window.turnstile.render(container, {
						sitekey: container.getAttribute('data-sitekey'),
						theme: 'light',
					});
				}
			}
		}, 200);
		// Stop waiting after 10 seconds
		setTimeout(() => clearInterval(waitForTurnstile), 10000);
	}

	// ============================================================
	// CONTACT FORM SUBMISSION → Supabase
	// ============================================================
	const form = document.getElementById("contact-form");
	const submitBtn = document.getElementById("contact-submit-btn");
	const successEl = document.getElementById("contact-success");
	const errorEl = document.getElementById("contact-error");

	if (form) {
		let lastSubmitTime = 0;
		const RATE_LIMIT_MS = 30000; // 30 seconds between submissions

		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			// Rate limiting
			const now = Date.now();
			if (now - lastSubmitTime < RATE_LIMIT_MS) {
				errorEl.textContent = "Please wait before submitting again.";
				errorEl.classList.remove("hidden");
				return;
			}

			const name = document
				.getElementById("contact-name")
				.value.trim()
				.substring(0, 200);
			const email = document
				.getElementById("contact-email")
				.value.trim()
				.substring(0, 320);
			const service = document.getElementById("contact-service").value;
			const message = document
				.getElementById("contact-message")
				.value.trim()
				.substring(0, 5000);

			// Validation with specific messages
			if (!name) {
				errorEl.textContent = "Please enter your name.";
				errorEl.classList.remove("hidden");
				document.getElementById("contact-name").focus();
				return;
			}
			if (!email) {
				errorEl.textContent = "Please enter your email address.";
				errorEl.classList.remove("hidden");
				document.getElementById("contact-email").focus();
				return;
			}
			if (!message) {
				errorEl.textContent = "Please describe your project.";
				errorEl.classList.remove("hidden");
				document.getElementById("contact-message").focus();
				return;
			}

			// Email format validation
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(email)) {
				errorEl.textContent = "Please enter a valid email address.";
				errorEl.classList.remove("hidden");
				return;
			}

			// Cloudflare Turnstile verification
			const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
			if (!turnstileResponse || !turnstileResponse.value) {
				errorEl.innerHTML = '<span class="material-symbols-outlined text-red-500 text-xl" style="vertical-align:middle">security</span> Please complete the human verification.';
				errorEl.classList.remove("hidden");
				return;
			}

			// Disable button
			submitBtn.disabled = true;
			submitBtn.textContent = "Sending...";
			successEl.classList.add("hidden");
			errorEl.classList.add("hidden");

			try {
				const { data, error } = await supabase.functions.invoke("submit-form", {
					body: {
						formType: "contact",
						turnstileToken: turnstileResponse.value,
						formData: {
							name,
							email,
							service,
							message,
						},
					},
				});

				if (error) throw error;
				if (!data?.success) {
					throw new Error(data?.error || "Verification failed");
				}

				// Show success
				lastSubmitTime = Date.now();
				successEl.classList.remove("hidden");
				form.reset();
				// Reset Turnstile widget
				if (window.turnstile) {
					window.turnstile.reset();
				}
			} catch (err) {
				console.error("Contact form submission failed:", err.message || err);
				errorEl.textContent = `Something went wrong: ${err.message || "Connection Error"}`;
				errorEl.classList.remove("hidden");
			} finally {
				submitBtn.disabled = false;
				submitBtn.textContent = "Submit Project Brief";
			}
		});
	}


}

main();

