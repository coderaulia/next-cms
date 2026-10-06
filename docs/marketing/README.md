# Marketing

Social media creatives for Vanaila Digital, built as HTML templates and rendered to PNG with Playwright.

| Post | Image | Topic |
| --- | --- | --- |
| 1 | `output/01-services.png` | Services |
| 2 | `output/02-notable-projects.png` | Notable projects |
| 3 | `output/03-products.png` | Products (HRIS, Flowraze, Psikotest) |
| 4 | `output/04-spreadsheet-signs.png` | Soft-sell: outgrown the spreadsheet |
| 5 | `output/05-business-email.png` | Soft-sell: business email trust |
| 6 | `output/06-website-questions.png` | Soft-sell: 3 questions before a website |
| 7 | `output/07-slow-website.png` | Education: why is my website slow |
| 8 | `output/08-marketplace-vs-store.png` | Education: marketplace vs own store |
| 9 | `output/09-kpi-vs-competency.png` | Education: KPI vs competency |
| 10 | `output/10-hero-website.png` | Hard-sell hero: website |
| 11 | `output/11-hero-flowraze.png` | Hard-sell hero: Flowraze |
| 12 | `output/12-hero-hris.png` | Hard-sell hero: HRIS |
| 13 | `output/13-hero-psikotest.png` | Hard-sell hero: Psikotest |
| 14 | `output/14-domain-hosting.png` | Edukasi (ID): domain vs hosting |
| 15 | `output/15-seo-umkm.png` | Edukasi (ID): SEO dasar UMKM |
| 16 | `output/16-pkwt-pkwtt.png` | Edukasi (ID): PKWT vs PKWTT |

Service series (10 posts, one per offer): `output/svc-*.png`, captions and value propositions by customer type in [`service-series.md`](./service-series.md). Edit `data/services.json`, then run `npm run render:services`.

Ads (3 content pillars, feed + story): `output/ad-*.png`, copy and campaign setup in [`ads-pillars.md`](./ads-pillars.md). Edit `data/ads.json`, then run `npm run render:ads`.

TikTok (3 Photo Mode carousels, 6 slides each): `output/tt-*.png`, captions, scripts and TikTok best practices in [`tiktok.md`](./tiktok.md). Edit `data/tiktok.json`, then run `npm run render:tiktok`.

Captions: [`captions.md`](./captions.md). Services marketing brief: [`services-marketing.md`](./services-marketing.md).

## Setup

```bash
cd docs/marketing
npm install
npm run render            # render all templates
npm run render:one -- 02  # render one template by name match
```

- Uses `playwright-core` with the Chromium at `/opt/pw-browsers` (override with `CHROMIUM_PATH`).
- Fonts come from local `@fontsource` packages (no network needed).
- Logo: `assets/brand/` (`vanaila-logo.png` original, `mark.png`, `wordmark.png`, `wordmark-white.png` for dark posts). Use `<div class="brand"><span class="lm"></span><span class="lw"></span></div>` in templates.
- Files starting with `_` in `templates/` are partials, not rendered (`_brand.css` shared tokens, `_hero.css` jumbotron layout).
- Workflow skill: `skills/social-post/SKILL.md` (copy into `.claude/skills/` to use it with Claude Code; `.claude` is gitignored).
