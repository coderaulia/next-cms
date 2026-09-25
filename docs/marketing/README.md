# Marketing

Social media creatives for Vanaila Digital, built as HTML templates and rendered to PNG with Playwright.

| Post | Image | Topic |
| --- | --- | --- |
| 1 | `output/01-services.png` | Services |
| 2 | `output/02-notable-projects.png` | Notable projects |
| 3 | `output/03-products.png` | Products (HRIS, Flowraze, Psikotest) |

Captions: [`captions.md`](./captions.md).

## Setup

```bash
cd docs/marketing
npm install
npm run render            # render all templates
npm run render:one -- 02  # render one template by name match
```

- Uses `playwright-core` with the Chromium at `/opt/pw-browsers` (override with `CHROMIUM_PATH`).
- Fonts come from local `@fontsource` packages (no network needed).
- Files starting with `_` in `templates/` are partials, not rendered.
- Workflow skill: `skills/social-post/SKILL.md` (copy into `.claude/skills/` to use it with Claude Code; `.claude` is gitignored).
