# Scroll Animation Rollout Plan (Front Pages)

## Selected Library
- **Library**: `framer-motion` (already installed in this repository)
- **Why**:
  - Supports viewport-triggered animation with `whileInView` and `viewport` options.
  - Supports accessibility fallback with reduced-motion hooks.
  - No new dependency required.

## Target Scope
- Home page blocks
- About page
- Services page
- Service detail pages
- Partnership page
- Contact page
- Blog list and blog detail pages (light reveal only)

## Component Architecture
1. Create `src/components/animations/Reveal.tsx` (client component)
2. Create `src/components/animations/StaggerGroup.tsx` (client component)
3. Reuse variants across all pages to keep timing consistent

## Motion Presets
- `fadeUp`: `opacity 0 -> 1`, `y 24 -> 0`, duration `0.45s`
- `fadeIn`: `opacity 0 -> 1`, duration `0.35s`
- `scaleInSoft`: `opacity 0 -> 1`, `scale 0.96 -> 1`, duration `0.4s`
- `staggerChildren`: `0.08s` step for card grids

## Placement Map
- Hero sections: animate headline, subtext, CTA row separately
- Section wrappers: `fadeUp` on first viewport entry
- Cards/grids: parent stagger + child `fadeUp`
- Footer and header: no aggressive animation; keep subtle

## Accessibility and Performance
- Respect `prefers-reduced-motion` and disable transform-heavy effects when enabled
- Trigger once (`viewport: { once: true, amount: 0.2 }`) to avoid repeated CPU work
- Keep blur/glow backgrounds static; animate only content layers
- Avoid layout shift by preserving final layout dimensions

## QA Checklist
- Desktop/mobile visual pass: 375, 768, 1440 widths
- Keyboard navigation remains stable while animations run
- Lighthouse pass for CLS and performance regressions
- Reduced-motion mode behavior verification

## Rollout Sequence
1. Build animation primitives (`Reveal`, `StaggerGroup`)
2. Apply to homepage blocks
3. Apply to About/Service/Partnership/Contact pages
4. Apply light reveals to blog pages
5. Run `npm run build` and manual visual QA
