import "./styles/main.css";
import { renderManagedPage } from "./lib/pageRenderer.js";

const params = new URLSearchParams(window.location.search);
const slugParam = (params.get("slug") || "").replace(/^\/+|\/+$/g, "");
const slug = slugParam || "index";
const preview = params.get("preview") === "1";

void renderManagedPage({
	slug,
	preview,
});

