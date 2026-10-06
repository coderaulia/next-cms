# Instagram & Facebook Ads: 3 Content Pillars

One ad per pillar, each in 2 placements:

| Pillar | Feed (1080×1350) | Stories / Reels (1080×1920) |
| --- | --- | --- |
| 01 Online Presence | `output/ad-01-presence-feed.png` | `output/ad-01-presence-story.png` |
| 02 Business Systems | `output/ad-02-systems-feed.png` | `output/ad-02-systems-story.png` |
| 03 Products | `output/ad-03-products-feed.png` | `output/ad-03-products-story.png` |

To edit the creatives, change `data/ads.json` and run `npm run render:ads`. Stories keep the top ~250px and bottom ~260px clear for Meta's UI.

**Before launch:** check that each offer is real and can be delivered (free consultation, free workflow mapping call, live demo). Pick one WhatsApp number or landing page per pillar so leads are easy to track.

---

## Pillar 01: Online Presence (Website · Online Shop · Business Email)

**Objective:** Leads (Instant Form or WhatsApp) · **Landing:** `/website-development` or WhatsApp
**Audience:** Indonesia, 25–55, small business owners, *Small business*, *Entrepreneurship*, *Online shopping* / *E-commerce* interests; retarget site visitors.

**Primary text (EN)**
> Your customers are searching right now. Are they finding you, or your competitor?
>
> We build fast, SEO-ready websites, secure online shops and official @yourbrand email, so your business looks credible and gets found.
> ✓ Mobile-first & Google-friendly
> ✓ Easy to update yourself
> ✓ Packages from a 5-page site to full ecommerce
>
> Book a free consultation today 👇

**Primary text (ID)**
> Pelanggan kamu sedang mencari sekarang. Yang mereka temukan bisnismu atau kompetitor?
>
> Kami bikin website cepat & SEO-ready, toko online yang aman, dan email resmi @namabisnis, supaya bisnismu terlihat kredibel dan mudah ditemukan.
> ✓ Nyaman di HP & ramah Google
> ✓ Bisa kamu update sendiri
> ✓ Paket dari website 5 halaman sampai toko online lengkap
>
> Konsultasi gratis, klik di bawah 👇

| Field | EN | ID |
| --- | --- | --- |
| Headline (≤40) | Be the business they find | Bisnis yang mudah ditemukan |
| Description | Website · Shop · Business email | Website · Toko online · Email bisnis |
| CTA button | Book Now / Send WhatsApp Message | Book Now / Send WhatsApp Message |

**Hook variants to A/B test:** "Is your website losing you customers?" · "Still selling only through DMs?" · "Your competitor's website is open 24/7. Is yours?"

---

## Pillar 02: Business Systems (Custom Tools · Mobile Apps)

**Objective:** Leads (Instant Form with qualifying questions) · **Landing:** `/custom-business-tools`
**Audience:** Indonesia, 28–55, business owners, operations/finance managers, general managers; interests *Business management*, *Operations management*, *Microsoft Excel*; LinkedIn-style job-title targeting if available.

**Primary text (EN)**
> Still running operations on spreadsheets and chat approvals?
>
> We build software around the way your business actually works:
> ✓ Dashboards & portals: one source of truth
> ✓ Approvals with a full audit trail
> ✓ Web & mobile apps for your team and customers
>
> Start with one workflow. Book a free workflow mapping call 👇

**Primary text (ID)**
> Operasional masih pakai spreadsheet dan approval lewat chat?
>
> Kami bikin software yang mengikuti cara kerja bisnismu:
> ✓ Dashboard & portal: satu sumber data
> ✓ Approval lengkap dengan jejak audit
> ✓ Aplikasi web & mobile untuk tim dan pelanggan
>
> Mulai dari satu alur kerja. Booking sesi mapping workflow gratis 👇

| Field | EN | ID |
| --- | --- | --- |
| Headline (≤40) | Software built around your process | Software sesuai proses bisnismu |
| Description | Free workflow mapping call | Sesi mapping workflow gratis |
| CTA button | Book Now / Get Quote | Book Now / Get Quote |

**Instant form questions:** company size · which process hurts most (approvals / reporting / inventory / other) · timeline.

**Hook variants:** "5 spreadsheets, 3 WhatsApp groups, 1 tired team." · "Month-end reports shouldn't take a week." · "What if approvals took minutes, not days?"

---

## Pillar 03: Products (Vanaila HRIS · Flowraze CRM · Psikotest)

**Objective:** Leads (demo request) · **Landing:** `/products` (or run one ad set per product → `/hris`, `/flowraze`, `/psikotest`)
**Audience:** Indonesia, 25–50, HR managers, HRBP, recruiters, sales managers, business owners; interests *Human resources*, *Recruitment*, *Sales*, *CRM*.

**Primary text (EN)**
> Ready-to-use software for growing teams:
> 🧾 Vanaila HRIS: KPIs, competency assessment & HR letters (PKWT, PKWTT, SK) in one employee record
> 📈 Flowraze: leads, deals & team performance in one visual pipeline
> 🧩 Psikotest: online psychometric tests with automatic scoring
>
> See it live. Request a demo for your team 👇

**Primary text (ID)**
> Software siap pakai untuk tim yang sedang bertumbuh:
> 🧾 Vanaila HRIS: KPI, asesmen kompetensi & surat HR (PKWT, PKWTT, SK) dalam satu data karyawan
> 📈 Flowraze: leads, deal & performa tim dalam satu pipeline visual
> 🧩 Psikotest: psikotes online dengan penilaian otomatis
>
> Lihat langsung. Request demo untuk timmu 👇

| Field | EN | ID |
| --- | --- | --- |
| Headline (≤40) | Hire, manage & sell smarter | Rekrut, kelola & jual lebih cerdas |
| Description | Live demo for your team | Demo langsung untuk timmu |
| CTA button | Request Time / Learn More | Request Time / Learn More |

**Hook variants:** "Stop running HR on spreadsheets." (HRIS) · "Close more deals. Lose zero leads." (Flowraze) · "Psychotests, without the paper." (Psikotest). The matching hero posts 11–13 can be used as extra creatives for these ad sets.

---

## Campaign structure (suggested)

```
Campaign: Vanaila — Leads (Indonesia)
├─ Ad set A · Online Presence     → ad-01 feed + story
├─ Ad set B · Business Systems    → ad-02 feed + story
└─ Ad set C · Products            → ad-03 feed + story (+ hero posts 11–13)
Retargeting ad set (site visitors / engagers, 30 days) → best performer + soft-sell posts 04–09, 14–16
```

- Run EN and ID copy as separate ads in each ad set and keep the winner after about 7 days.
- Test one variable at a time: hook first, then creative, then CTA.
- Track cost per lead **and** lead-to-meeting rate. A cheap lead that never books isn't a win.
