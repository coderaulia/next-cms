# Video versions (Remotion)

This folder holds animated 9:16 videos (1080×1920, 30 fps, H.264) of the TikTok content, built with [Remotion](https://github.com/remotion-dev/remotion), plus real screen recordings of the Vanaila site made with Playwright.

| Type | Composition id | Source |
| --- | --- | --- |
| Animated carousel videos (52) | `tt-01-…` to `tt-52-…` | `../data/tiktok.json`, the same data as the PNG carousels |
| Screen-recorded tours (5) | `tour-site-home`, `tour-site-hris`, `tour-site-flowraze`, `tour-site-psikotest`, `tour-site-templates` | `public/recordings/*.webm` + `src/tours.ts` |
| Meme slideshow (1) | `meme-01-in-this-picture` | the rendered PNG slides in `../output/` |

Rendered files go to `../output/video/<id>.mp4`.

## Setup

```bash
cd docs/marketing/video
npm install
```

The scripts automatically use the Chromium headless shell at `/opt/pw-browsers` when it exists. Set `REMOTION_BROWSER` to use a different browser.

## Commands

```bash
npm run studio                    # Remotion Studio: preview and tweak every video in the browser
npm run render -- --list          # list all compositions with their durations
npm run render -- tt-13 tour      # render only ids containing "tt-13" or "tour"
npm run render                    # render everything (slow: about 2 hours on 4 CPUs)
```

`CONCURRENCY=4 npm run render -- tt-01` sets how many frames render in parallel.

## Screen recordings

```bash
# 1. start the site from the repo root
npm run dev                                   # serves http://localhost:3000
# 2. record the pages (smooth auto-scroll, phone-sized viewport 540×1080)
cd docs/marketing/video
npm run record                                # all targets
npm run record -- hris                        # only targets containing "hris"
SITE_URL=http://localhost:3123 npm run record # different port or host
```

- **Targets** are listed in `scripts/record-screens.mjs`: home, `/hris`, `/flowraze`, `/psikotest` and `/templates`. Add more pages there, then add a matching entry in `src/tours.ts` with its title, timed captions and CTA.
- **How a recording runs:** the recorder visits each page once to warm up Next.js dev compilation, records a smooth scroll, and forces scroll-reveal sections visible (they stay hidden in headless capture).
- **Blocked CDNs:** the static HTML templates in `public/templates-static` load Tailwind and images from CDNs. Where those are blocked, record the Next.js pages instead (the default targets).

## How the animation works

- **Carousel videos.** `src/Carousel.tsx` plays the slides in sequence. Each slide type in `src/Slides.tsx` (hook, point, vs, img, collage, split, guess, chat, annot, check, shot, cta) has its own entrance motion:
  - text springs up into place
  - numbers and buttons pop in
  - screenshots slowly zoom in (Ken Burns)
  - callout boxes draw in
  - chat bubbles arrive one by one
  - the photo theme uses a blurred image backdrop

  Story-style progress bars sit at the top, and slide length depends on how much there is to read (2.7–4.3 s).
- **Screen tours.** `src/ScreenTour.tsx` runs a hook card, then the recording inside a phone frame with timed caption callouts, then the CTA.
- **Safe zones.** Every layout keeps the same TikTok margins as the PNGs: top 160px, bottom 440px, right 140px.
- **Editing.** Change a post's text in `../data/tiktok.json`, then re-render it. The PNG and video versions stay in sync.

## Audio

The videos are rendered **without sound** on purpose. Add a track from TikTok's **Commercial Music Library** inside the TikTok app when posting. Business accounts may only use CML sounds (see `../tiktok.md`).

## Licensing

Remotion is free for individuals and companies with **up to 3 employees**. Larger companies need a paid Remotion company license. Check https://www.remotion.dev/license before using it commercially.
