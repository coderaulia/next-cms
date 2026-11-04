# Landing-page templates

Source for the 13 landing-page templates in `public/templates-static/` (shown at `/templates`). Each template is one self-contained HTML file (CSS and JS inlined), like the older templates.

```bash
node docs/marketing/landing/build.mjs            # build every template into public/templates-static/
node docs/marketing/landing/build.mjs kopi       # only templates whose file starts with "kopi"
```

- `base.css` / `base.js`: shared layout and behaviour (mobile menu, scroll reveal, counters, tabs, pricing toggle, testimonial slider, FAQ, forms → WhatsApp).
- `sites/<slug>.mjs`: one definition per template (palette, fonts, hero, sections, copy).
- `build.mjs`: turns a definition into a page. Add a new site by adding a file in `sites/`, then register it in `src/components/templates/registry.tsx` (newest first).
- `preview.mjs` and `test.mjs` need the `docs/marketing` dev dependencies (`npm install` there) and build with `--local` fonts: `node build.mjs --local && node test.mjs`.

**Before using a template for a client**, replace the placeholders: WhatsApp number (`wa` in the site file), email, address, prices, and the sample testimonials (they are marked as examples).
