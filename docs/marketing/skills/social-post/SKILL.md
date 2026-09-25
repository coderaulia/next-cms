---
name: social-post
description: Create or update Vanaila social media creatives (HTML template → PNG) and captions in docs/marketing.
---

# Social post workflow

1. Pull facts only from the repo: `data/default-content.json` (portfolio, settings), `src/config/site-profile.ts` (services), `src/components/pages/*PageView.tsx` (product copy). Never invent metrics.
2. Copy an existing file in `templates/` (e.g. `01-services.html`). Keep `_brand.css` tokens: navy `#1a2d4c`, accent `#2f6dff`, Inter Tight + Instrument Serif italic accent + JetBrains Mono labels.
3. Reference screenshots via `../../../public/...` paths.
4. Render: `npm run render` (all) or `npm run render:one -- <name>`. Output goes to `output/<name>.png` at 1080×1350.
5. Open the PNG and check for overflow/clipping before shipping.
6. Add IG/FB + LinkedIn captions to `captions.md`.
