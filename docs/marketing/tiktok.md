# TikTok Content

There are 19 posts. Each one is built as a **Photo Mode carousel** (**max 5 slides**, 1080×1920, 9:16) and also comes with a **video script**, so it can be filmed as a short video instead.

| # | Topic | Slides | Goal |
| --- | --- | --- | --- |
| 1 | 3 tanda website-mu bikin pelanggan kabur | `output/tt-01-website-kabur-s1…s5.png` | Education → website leads |
| 2 | POV: HR masih pakai Excel | `output/tt-02-pov-hr-excel-s1…s5.png` | Relatable humor → HRIS demo |
| 3 | Behind the scenes: website dari nol | `output/tt-03-behind-website-s1…s5.png` | Trust / process → consultations |
| 4 | 3 red flag pas cari jasa website 🚩 | `output/tt-04-red-flag-jasa-website-s1…s5.png` | Viral: save & share → trust |
| 5 | Klien bilang vs maksudnya 😂 | `output/tt-05-klien-vs-maksudnya-s1…s5.png` | Viral: relatable humor → reach |
| 6 | 3 hal yang bikin bisnis kelihatan amatir | `output/tt-06-bisnis-kelihatan-amatir-s1…s5.png` | Viral: self-check → comments |
| 7 | 3 cara pakai AI di bisnismu minggu ini | `output/tt-07-ai-untuk-umkm-s1…s5.png` | AI education → saves |
| 8 | 3 salah kaprah soal AI di bisnis | `output/tt-08-mitos-fakta-ai-s1…s5.png` | AI myth-busting → shares |
| 9 | AI paling berguna justru yang tidak terlihat | `output/tt-09-ai-dalam-sistem-s1…s5.png` | AI in systems → custom-tools leads |
| 10 | Rate website ini 1–10 👀 | `output/tt-10-rate-website-s1…s5.png` | Viral (image): comment a score → reach |
| 11 | Pilih A atau B? (website kuliner) | `output/tt-11-pilih-a-atau-b-s1…s5.png` | Viral (image): poll in comments → reach |
| 12 | UMKM bisa punya website sekeren brand besar | `output/tt-12-umkm-website-keren-s1…s5.png` | Viral (image): proof → template leads |
| 13 | Kamu tipe bos yang mana? 🤔 | `output/tt-13-tipe-bos-s1…s5.png` | Viral: identity quiz → tags |
| 14 | Unpopular opinion: UMKM belum butuh aplikasi | `output/tt-14-unpopular-opinion-app-s1…s5.png` | Viral: hot take → debate + trust |
| 15 | Website bisnis 2010 vs 2026 | `output/tt-15-website-2010-vs-2026-s1…s5.png` | Viral (image): nostalgia glow-up → shares |
| 16 | 3 prompt AI untuk kerjaan kantor | `output/tt-16-prompt-ai-kantoran-s1…s5.png` | AI at work: saves → follows |
| 17 | 3 tugas HR lebih cepat dengan AI | `output/tt-17-ai-untuk-hr-s1…s5.png` | AI for HR → HRIS audience |
| 18 | Kerja tanpa AI vs dengan AI 😅 | `output/tt-18-tanpa-vs-dengan-ai-s1…s5.png` | Relatable AI → comments |
| 19 | "In this picture…" meme → she's looking at Vanaila | `output/meme-01-in-this-picture-s1…s5.png` | Trend meme → brand awareness |

To edit, change `data/tiktok.json` and run `npm run render:tiktok`.

---

## TikTok rules & best practices we follow

TikTok's policies change often. Check the current [Community Guidelines](https://www.tiktok.com/community-guidelines) and [Business/Ads policies](https://ads.tiktok.com/help/) before you post.

**Account & compliance**
- Post from a **TikTok Business Account**. Business accounts can only use sounds from the **Commercial Music Library (CML)**, not trending copyrighted songs.
- Don't make misleading claims: no fake prices, fake results or fake testimonials. Every offer in these posts has to be real.
- **Content disclosure:** when a post promotes Vanaila's own services or products (offers, demos, templates), turn on *Content disclosure → Your brand*. TikTok then shows a "Promotional content" label. Use *Branded content* only when a creator or partner is paid to post for us. Each post below says which setting to use. Check the current setting names in the TikTok app before posting.
- **AI-generated content:** if any slide, image or voice-over is made with AI, turn on the *AI-generated content* label. The current slides are designed in HTML with real screenshots, so they don't need it.
- **FYP eligibility:** no misleading claims, no "like/follow untuk…" style engagement bait or false incentives, no stolen or copyrighted media, and no personal data on screen. Posts that break these rules can be left out of the For You feed even if they aren't removed.
- Don't put personal data on screen. The screenshots use demo data only.

**Format**
- **Carousels: max 5 slides.** Hook → 3 points → CTA. Shorter carousels get finished, and completion is what gets them pushed to more people.
- 9:16 vertical, 1080×1920. Keep text out of the **top ~160px, bottom ~440px and right ~140px**, where the TikTok UI sits (this is built into the slides).
- The hook goes in the **first 1–3 seconds**, or on slide 1 for carousels. Slide 1 must make people stop and swipe.
- Use one idea per slide, few words, and large text.
- For video: aim for 15–45 seconds, use auto-captions or on-screen text (many people watch with the sound off), and keep a fast pace.

**Title (Photo Mode)**
- Photo posts have a separate **title** field (up to 90 characters). Every post below has one in ID and EN.
- Put the **search keyword first** ("3 Red Flag Saat Cari Jasa Pembuatan Website") and match it to the hook on slide 1.
- For videos, there's no separate title, so the first line of the caption does the same job.

**Captions**
- Lead with **search keywords** in the first line, because TikTok search indexes the caption and on-screen text. TikTok captions allow up to about 4,000 characters, but **short works better**: 1–3 lines, then hashtags.
- Use **3–5 relevant hashtags**: a mix of niche tags (#tipsbisnis) and topic tags (#hrd). Avoid generic tags like #fyp #viral spam. They don't help, and irrelevant tags can hurt distribution.
- External links aren't clickable in captions. Say **"link di profil"** and keep the bio link updated.
- End with **one** clear action: comment, save, share or follow. Ask for a meaningful comment ("komen CEK", "komen nomornya"), not empty engagement bait ("like kalau setuju", "follow biar dapat…").
- Asking people to tag someone the post is *useful* to ("tag rekan HR") is fine. Never promise a reward for likes or follows.

**After posting**
- Pin a comment that repeats the CTA.
- Reply to comments within the first hour. A **video reply** to a good question is a free next post.
- Post 3–5 times a week. Track **saves, shares and profile visits**, not only views.

---

## Post 1: 3 tanda website-mu bikin pelanggan kabur

**Format:** Photo Mode, 5 slides · **Sound:** upbeat track from the Commercial Music Library, low volume

**Title (ID):** `3 Tanda Website Bisnis Bikin Pelanggan Kabur (Nomor 3 Paling Sering!)`  
**Title (EN):** `3 Signs Your Business Website Is Driving Customers Away`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
3 tanda website bisnis bikin pelanggan kabur 😬 Nomor 3 paling sering kejadian. Komen "CEK" kalau mau kami lihat website-mu.

#tipsbisnis #websitebisnis #umkm #digitalmarketing #bisnisonline
```

**Caption (EN, optional)**
```
3 signs your business website is driving customers away 😬 #3 is the most common. Comment "CHECK" and we'll take a look at yours.

#smallbusinesstips #websitetips #digitalmarketing #businessowner
```

**Pinned comment:** `Komen "CEK" + link website kamu, kami review satu per satu 👇`

**Video script (alternative, ~30s)**
| Time | On screen | Voice-over / action |
| --- | --- | --- |
| 0–3s | "3 tanda website-mu bikin pelanggan KABUR" | Face to camera: "Website kamu mungkin lagi ngusir pelanggan." |
| 3–10s | "1. Loading lama" | Screen recording of a slow page loading on a phone |
| 10–17s | "2. Berantakan di HP" | Pinch-zoom on a broken mobile layout |
| 17–25s | "3. Nggak jelas harus ngapain" | Scroll a page with no WhatsApp/order button |
| 25–30s | "Komen CEK 👇" | "Mau kami cek? Komen CEK." |

> ⚠️ Confirm the "cek website gratis" offer before posting.

---

## Post 2: POV: HR masih pakai Excel

**Format:** Photo Mode, 5 slides · **Sound:** relatable/comedic track from the CML

**Title (ID):** `POV: HR Masih Pakai Excel untuk Semua Data Karyawan 😵`  
**Title (EN):** `POV: HR Still Runs Everything in Excel 😵`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
POV: kamu HR dan semua data karyawan masih di Excel 😵 Siapa yang relate? Tag rekan HR kamu 👇

#hrd #hrindonesia #kpi #duniakerja #vanailahris
```

**Caption (EN, optional)**
```
POV: you're in HR and every employee record still lives in Excel 😵 Tag an HR friend who needs this 👇

#hrtok #humanresources #kpi #worklife
```

**Pinned comment:** `Mau lihat Vanaila HRIS langsung? Request demo lewat link di profil 🙌`

**Video script (alternative, ~25s)**
| Time | On screen | Action |
| --- | --- | --- |
| 0–3s | "POV: kamu HR & semua data di Excel" | Person staring at a laptop, sighing |
| 3–8s | "KPI_final_v3_REVISI.xlsx" | Scroll through 4 near-identical file names |
| 8–13s | "Bikin PKWT copy-paste" | Copy-paste motion, "lupa ganti nama" sticker |
| 13–20s | "Plot twist: semua di satu data karyawan" | Screen recording of Vanaila HRIS (KPI Management → HR Documents) |

---

## Post 3: Behind the scenes: website bisnis dari nol

**Format:** Photo Mode, 5 slides · **Sound:** calm lo-fi track from the CML

**Title (ID):** `Cara Website Bisnis Dibuat dari Nol: 3 Tahap`  
**Title (EN):** `How a Business Website Is Built From Scratch: 3 Stages`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
Gimana website bisnis dibuat dari nol? Ini 3 tahap yang kami lalui di setiap proyek 🛠️ Bisnismu lagi di tahap mana? Tulis di komentar.

#behindthescenes #webdesign #websitebisnis #umkm #tipsbisnis
```

**Caption (EN, optional)**
```
How a business website is built from scratch: the 3 stages we follow on every project 🛠️ Which stage is your business at? Tell us below.

#behindthescenes #webdesign #smallbusiness #websitetips
```

**Pinned comment:** `Mau mulai dari tahap 01? Konsultasi lewat link di profil 👋`

**Video script (alternative, ~35s)**
| Time | On screen | Action |
| --- | --- | --- |
| 0–3s | "Gimana website dibuat dari NOL?" | Time-lapse of the desk setup |
| 3–10s | "01 Riset" | Sticky notes / brief on a whiteboard |
| 10–18s | "02 Desain" | Screen recording of the design file, then the Aura template |
| 18–35s | "03 Build, launch & ukur" | Code editor → CMS → site live on a phone + "Bisnismu tahap mana?" |

---

# Viral series (posts 4–6)

**Why these formats spread**
- **Red flags / checklists** get *saved* and *shared* ("send this to a friend"), and TikTok weights saves and shares heavily.
- **"X says vs what they mean"** is relatable humor. People tag coworkers, which brings in new viewers. It also pokes fun at **ourselves** (the "developer bilang" slide), so it doesn't read as mocking clients.
- **"Kamu banget nomor berapa?"** invites a one-word comment (a number). That's an easy, meaningful reply rather than empty engagement bait.
- Each hook leaves a gap ("Nomor 1 paling sering…", "Yang terakhir bikin tim kami tertawa…") so people swipe to the end.

**Viral playbook**
- Post at your audience's active hours (check TikTok Analytics → Followers), then stay online for the first hour to reply.
- When a comment asks a good question, **reply with a video**. It's a ready-made next post.
- If a post takes off, make a **part 2** within 48 hours ("3 red flag lagi…").
- Turn on **Stitch & Duet**. Other creators reacting to "klien vs maksudnya" is free reach.

---

## Post 4: 3 red flag pas cari jasa website 🚩

**Format:** Photo Mode, 5 slides · **Sound:** dramatic/suspense track from the CML

**Title (ID):** `3 Red Flag Saat Cari Jasa Pembuatan Website 🚩`  
**Title (EN):** `3 Red Flags When Hiring a Web Developer 🚩`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
3 red flag pas cari jasa website 🚩 Save sebelum bayar DP! Kamu pernah kena nomor berapa?

#jasawebsite #tipsbisnis #umkm #redflag #websitebisnis
```

**Caption (EN, optional)**
```
3 red flags when hiring a web developer 🚩 Save this before you pay the deposit. Which one happened to you?

#webdesign #smallbusinesstips #redflags #businessowner
```

**Pinned comment:** `Bonus: minta semua akses (domain, hosting, CMS) dikirim ke email bisnismu sendiri 🔑`

**Video script (alternative, ~30s)**
| Time | On screen | Action |
| --- | --- | --- |
| 0–3s | "3 RED FLAG jasa website 🚩" | Face to camera, holding a red flag (or a 🚩 sticker) |
| 3–24s | One red flag every ~7s | Green-screen over each slide and react to each one |
| 24–30s | "Save sebelum bayar DP!" | Point at the save button |

---

## Post 5: Klien bilang vs maksudnya 😂

**Format:** Photo Mode, 5 slides · **Sound:** trending *comedic* sound from the CML

**Title (ID):** `Yang Klien Bilang vs Maksudnya (Versi Agency) 😂`  
**Title (EN):** `What Clients Say vs What They Actually Mean 😂`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
Yang klien bilang vs yang sebenarnya dimaksud 😂 (nomor 3 itu kami sendiri sih) Paling relate nomor berapa?

#agencylife #desainer #programmer #kerjakantoran #webdeveloper
```

**Caption (EN, optional)**
```
What clients say vs what they actually mean 😂 (#3 is us, to be fair). Which one is most relatable?

#agencylife #designer #developer #worklife
```

**Pinned comment:** `Tim klien atau tim developer? 👀 Jawab di sini`

**Video script (alternative, ~20s):** two-person skit. One plays "Klien", the other "Tim". Use a text overlay for each line, and cut fast between the "bilang" and "maksudnya" lines. End on the developer twist.

> Tone check: keep it light and self-deprecating. Never use real client names, chats or projects.

---

## Post 6: 3 hal kecil yang bikin bisnismu kelihatan amatir

**Format:** Photo Mode, 5 slides · **Sound:** upbeat track from the CML

**Title (ID):** `3 Hal Kecil yang Bikin Bisnis Kelihatan Amatir`  
**Title (EN):** `3 Small Things That Make a Business Look Amateur`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
3 hal kecil yang bikin bisnis kelihatan amatir 😬 Semua bisa dibenerin hari ini. Jujur, kamu banget nomor berapa?

#tipsbisnis #umkm #bisnisonline #brandingbisnis #pengusahamuda
```

**Caption (EN, optional)**
```
3 small things that make your business look amateur 😬 All fixable today. Be honest, which number is you?

#smallbusinesstips #branding #entrepreneur #businessowner
```

**Pinned comment:** `Nomor 1 paling cepat dibenerin: email @namabisnis bisa aktif hari ini 💼`

**Video script (alternative, ~30s)**
| Time | On screen | Action |
| --- | --- | --- |
| 0–3s | "Bisnismu kelihatan amatir karena…" | Face to camera, a slight cringe |
| 3–27s | Items 1–3, each with "❌ → ✅" | Before/after split-screen for each item |
| 27–30s | "Kamu nomor berapa? 😂" | Laugh, then point at the comments |

---

# AI series (posts 7–9)

**Accuracy rules for AI content:** no hype ("AI menggantikan karyawan"), no promised results, and always remind people to check AI output. Never suggest putting customer data into public AI tools. Posts 7–8 are tool-agnostic on purpose, so the advice stays true whichever AI tool the viewer uses.

## Post 7: 3 cara pakai AI di bisnismu minggu ini

**Format:** Photo Mode, 5 slides · **Sound:** upbeat track from the CML

**Title (ID):** `3 Cara Pakai AI untuk Bisnis Minggu Ini (Tanpa Coding)`  
**Title (EN):** `3 Ways to Use AI in Your Business This Week`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
3 cara pakai AI di bisnis minggu ini, tanpa coding 🤖 Nomor 2 langsung bisa dicoba. Kamu sudah pakai AI untuk apa?

#ai #aiuntukbisnis #tipsbisnis #umkm #produktivitas
```

**Caption (EN, optional)**
```
3 ways to use AI in your business this week, no coding needed 🤖 Try #2 today. What do you already use AI for?

#ai #aiforbusiness #smallbusinesstips #productivity
```

**Pinned comment:** `Prompt nomor 2: "Tulis 3 deskripsi untuk [produk], target [pembeli], gaya santai." Jangan lupa edit lagi ya ✍️`

**Video script (alternative, ~30s):** screen recording on a phone. Type each prompt, then show the AI result and a quick human edit. End on "Selalu cek ulang hasilnya."

---

## Post 8: 3 salah kaprah soal AI di bisnis

**Format:** Photo Mode, 5 slides · **Sound:** suspense/"plot twist" track from the CML

**Title (ID):** `3 Salah Kaprah soal AI di Bisnis: Mitos vs Fakta`  
**Title (EN):** `3 AI Myths in Business: Myth vs Fact`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
3 salah kaprah soal AI di bisnis 👀 Nomor 2 paling berisiko buat data pelangganmu. Kamu pernah percaya yang mana?

#ai #keamanandata #tipsbisnis #duniakerja #literasidigital
```

**Caption (EN, optional)**
```
3 AI myths in business 👀 #2 is the riskiest for your customer data. Which one did you believe?

#ai #datasecurity #businesstips #worklife
```

**Pinned comment:** `Aturan simpel: kalau tidak boleh di-share ke orang asing, jangan dimasukkan ke AI publik 🔒`

**Video script (alternative, ~25s):** face to camera with a "MITOS ❌ / FAKTA ✅" text overlay. Say each myth with a fake-confident face, then flip to the fact.

---

## Post 9: AI paling berguna justru yang tidak terlihat

**Format:** Photo Mode, 5 slides · **Sound:** calm tech/lo-fi track from the CML

**Title (ID):** `AI untuk Bisnis Bukan Cuma Chatbot: 3 Contoh Nyata`  
**Title (EN):** `AI for Business Is More Than a Chatbot: 3 Examples`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
AI di bisnis bukan cuma chatbot 🤖 Yang paling berguna justru bekerja di balik layar sistemmu. Komen "AI" + bidang usahamu, kami kasih ide use case-nya.

#ai #otomasi #sistembisnis #digitalisasi #transformasidigital
```

**Caption (EN, optional)**
```
AI in business is more than a chatbot 🤖 The most useful AI works quietly inside your systems. Comment "AI" + your industry and we'll suggest a use case.

#ai #automation #businesssystems #digitaltransformation
```

**Pinned comment:** `Contoh: toko online → sortir otomatis pertanyaan "stok" vs "komplain". Bidang kamu apa? 👇`

**Video script (alternative, ~30s):** before/after screen. A messy inbox and spreadsheet ("sebelum"), then a dashboard with auto-sorted leads and a summary card ("sesudah"). Use mock or demo data only.

> Note: these are examples of what can be **built** (Custom Business Tools → AI integration). Don't present them as existing features of Vanaila HRIS, Flowraze or Psikotest unless they are.

---

# Image-led viral series (posts 10–12)

These slides are **picture-first**: full-screen Vanaila template previews on a blurred background of the same image, with short text on top. Images stop the scroll, and the text gives people a reason to comment.

**Honesty rule:** every image is a **Vanaila template** with a fictional brand (Aura, Nusa Jaya, Catering Mama Fadil, Budi Mobil, Javanesa, BDO.CLTH, etc.). Each frame is labelled "Template Vanaila". Never call them client projects or real businesses.

**Why they spread**
- **Rate 1–10**: a one-number comment is the easiest reply on TikTok. Disagreeing scores in the comments create replies on replies.
- **A or B**: a binary choice people defend in the comments. Our follow-up reply ("tim A biasanya usaha …") gives them a reason to come back.
- **"Siapa bilang UMKM…"**: pride and aspiration for local businesses. Owners share it ("ini kayak usaha kita").

## Post 10: Rate website ini 1–10 👀

**Format:** Photo Mode, 5 slides · **Sound:** trending upbeat track from the CML

**Title (ID):** `Rate Desain Website Ini 1–10 👀`  
**Title (EN):** `Rate These Website Designs 1–10 👀`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
Rate website ini 1–10 👀 Jujur aja, kami kuat kok 😅 Tulis nilaimu untuk #1, #2, #3 di komentar!

#ratewebsite #webdesign #desainwebsite #websitebisnis #umkm
```

**Caption (EN, optional)**
```
Rate these websites 1–10 👀 Be honest, we can take it 😅 Drop your score for #1, #2, #3!

#ratemywebsite #webdesign #websiteinspo #smallbusiness
```

**Pinned comment:** `Yang dapat nilai tertinggi kami bikin video breakdown desainnya 🔍`

**Video script (alternative, ~20s):** screen recording scrolling each template on a phone, ~5s each, with a big "?/10" overlay. End with "Komen nilaimu 👇".

---

## Post 11: Pilih A atau B? (website kuliner)

**Format:** Photo Mode, 5 slides · **Sound:** "this or that" style track from the CML

**Title (ID):** `Website Kuliner: Pilih Desain A atau B?`  
**Title (EN):** `Restaurant Website Design: A or B?`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
Usaha kuliner: website A atau B yang bikin kamu langsung pesan? 🍽️ Komen hurufnya, kami tebak jenis usahamu!

#pilihmana #websitekuliner #bisniskuliner #desainwebsite #umkm
```

**Caption (EN, optional)**
```
Restaurant websites: A or B, which one makes you order? 🍽️ Comment the letter and we'll guess your business type!

#thisorthat #restaurantwebsite #webdesign #foodbusiness
```

**Pinned comment:** `Hasil sementara: tim A biasanya usaha premium/fine dining, tim B usaha keluarga & catering. Kamu yang mana? 👀`

**Video script (alternative, ~15s):** split-screen A/B with a 3-2-1 countdown, then "Komen A atau B!" Use the "Pilih satu" sticker if one is available.

---

## Post 12: UMKM bisa punya website sekeren brand besar

**Format:** Photo Mode, 5 slides · **Sound:** empowering/upbeat Indonesian track from the CML

**Title (ID):** `Website UMKM Bisa Sekeren Brand Besar`  
**Title (EN):** `Small Business Websites Can Look Like Big Brands`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
Siapa bilang UMKM nggak bisa punya website sekeren brand besar? 💪 Bengkel, skincare lokal, distro, semua bisa. Usahamu bidang apa? Komen, kami tunjukkan contohnya!

#umkm #umkmnaikkelas #websiteumkm #banggabuatanindonesia #bisnislokal
```

**Caption (EN, optional)**
```
Who says small businesses can't have websites as good as big brands? 💪 Garages, local skincare, clothing brands, all possible. What's your business? Comment and we'll show you an example!

#smallbusiness #supportlocal #websitedesign #localbrand
```

**Pinned comment:** `Ada 14 contoh template per industri, sebut bidang usahamu dan kami kirimkan yang paling cocok 🙌`

**Video script (alternative, ~25s):** "Siapa bilang…?" face to camera. Fast cuts through 3–5 templates on a phone screen, each labelled with its industry. End on "Usahamu bidang apa?"

---

# Viral series 3 (posts 13–15)

**Why these formats spread**
- **Identity quiz ("tipe bos")**: people love labelling themselves and others. "Tag bosmu" brings in new viewers through tags, and it stays light and playful rather than mocking anyone.
- **Unpopular opinion**: a hot take gets debate in the comments, which drives distribution. It's also **honest** (we sell apps, yet we say most UMKM don't need one yet), which builds trust.
- **2010 vs 2026 glow-up**: nostalgia and humor. The retro site is a **mock we built in code** (tokokami.blogspot.com, a fictional site), not a real business. The 2026 side is a labelled Vanaila template.

## Post 13: Kamu tipe bos yang mana? 🤔

**Format:** Photo Mode, 5 slides · **Sound:** playful/quiz track from the CML

**Title (ID):** `Kamu Tipe Bos yang Mana? Excel, WhatsApp, atau Sistem`  
**Title (EN):** `Which Type of Boss Are You? Excel, WhatsApp or Systems`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
Kamu tipe bos yang mana? 🤔 Excel, WhatsApp, atau Sistem? Komen jawabanmu & tag bosmu 👀

#atasan #duniakerja #kerjakantoran #tipsbisnis #manajemenbisnis
```

**Caption (EN, optional)**
```
Which type of boss are you? 🤔 Excel, WhatsApp or Systems? Comment yours and tag your boss 👀

#boss #worklife #officehumor #management
```

**Pinned comment:** `Hasil sementara: tim WhatsApp paling banyak 😂 Kamu yang mana?`

**Video script (alternative, ~25s):** one person plays all 3 bosses (costume change per type). Bos Excel squints at formulas, Bos WhatsApp sends voice note after voice note, Bos Sistem sips coffee on holiday. End with "Kamu tipe apa?"

---

## Post 14: Unpopular opinion: UMKM belum butuh aplikasi

**Format:** Photo Mode, 5 slides · **Sound:** "hot take"/dramatic track from the CML

**Title (ID):** `Unpopular Opinion: UMKM Belum Butuh Aplikasi Mobile`  
**Title (EN):** `Unpopular Opinion: Most Small Businesses Don't Need an App Yet`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
Unpopular opinion: kebanyakan UMKM belum butuh aplikasi mobile 🔥 (iya, ini kata tim yang bikin aplikasi) Setuju atau nggak?

#unpopularopinion #aplikasimobile #umkm #tipsbisnis #startup
```

**Caption (EN, optional)**
```
Unpopular opinion: most small businesses don't need a mobile app yet 🔥 (yes, coming from a team that builds apps) Agree or disagree?

#unpopularopinion #mobileapp #smallbusiness #startuptips
```

**Pinned comment:** `Kalau masih ragu butuh app atau cukup website, komen bidang usahamu, kami kasih pendapat jujur 👇`

**Video script (alternative, ~25s):** face to camera with an "UNPOPULAR OPINION" text overlay. Deliver it confidently, list the 2 reasons, then "tapi kamu BUTUH app kalau…" with the 3 conditions. End on "Setuju atau nggak?"

> Tone check: keep it a fair argument, not a jab at competitors or at businesses that already have apps.

---

## Post 15: Website bisnis 2010 vs 2026

**Format:** Photo Mode, 5 slides · **Sound:** nostalgic 2000s-style track from the CML

**Title (ID):** `Website Bisnis 2010 vs 2026: Glow Up! 📈`  
**Title (EN):** `Business Websites: 2010 vs 2026 Glow Up 📈`  
**Content disclosure:** ON → *Your brand* (the post promotes Vanaila's own offer)

**Caption (ID)**
```
Website bisnis: 2010 vs 2026 😭📈 Ada yang masih "Under Construction"? Website bisnismu masih era berapa? Jawab jujur!

#glowup #website #nostalgia #websitebisnis #umkm
```

**Caption (EN, optional)**
```
Business websites: 2010 vs 2026 😭📈 Anyone still "Under Construction"? Which era is your website from? Be honest!

#glowup #webdesign #nostalgia #throwback
```

**Pinned comment:** `Siapa yang dulu punya visitor counter di website-nya? 🙋 Ngaku!`

**Video script (alternative, ~15s):** "Website 2010" with a dial-up sound effect (from the CML or royalty-free), scrolling the retro mock. A transition (swipe or flash) to the 2026 template scrolling smoothly on a phone. End on "Kamu era berapa?"

---

# AI series 2: AI for work & business (posts 16–18)

Same accuracy rules as the first AI series: AI **helps you start**, and people check and decide. Never put confidential or personal data into public AI tools. Every prompt is tool-agnostic, so it works in any AI chat tool.

## Post 16: 3 prompt AI yang bikin kerjaan kantor lebih ringan

**Format:** Photo Mode, 5 slides · **Sound:** chill productivity/lo-fi track from the CML

**Title (ID):** `3 Prompt AI untuk Kerjaan Kantor: Email, Notulen, Excel`  
**Title (EN):** `3 AI Prompts for Office Work: Emails, Notes, Excel`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
3 prompt AI untuk kerjaan kantor 📧📝📊 Email, notulen rapat & rumus Excel. Simpan, besok langsung pakai! Prompt mana yang paling kepake?

#promptai #ai #kerjakantoran #tipskerja #produktivitas
```

**Caption (EN, optional)**
```
3 AI prompts that make office work easier 📧📝📊 Emails, meeting notes & Excel formulas. Save it for tomorrow! Which one will you use most?

#aiprompts #ai #officetips #productivity
```

**Pinned comment:** `Bonus prompt: "Jelaskan dokumen ini dengan bahasa sederhana dalam 5 poin" 📄 (hapus data rahasia dulu ya)`

**Video script (alternative, ~30s):** screen recording on a laptop. Paste each prompt into an AI chat, show the result, then a quick human edit. Use **dummy data only** on screen.

---

## Post 17: 3 tugas HR yang jadi lebih cepat dengan AI

**Format:** Photo Mode, 5 slides · **Sound:** calm/professional track from the CML

**Title (ID):** `3 Tugas HR yang Lebih Cepat dengan AI`  
**Title (EN):** `3 HR Tasks AI Can Speed Up`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
3 tugas HR yang jadi lebih cepat dengan AI 🤖 Job description, pertanyaan interview & rangkuman penilaian. Keputusan tetap di tangan manusia ya! Tim HR-mu sudah pakai AI untuk apa?

#hrd #hrindonesia #ai #rekrutmen #tipshr
```

**Caption (EN, optional)**
```
3 HR tasks AI can speed up 🤖 Job descriptions, interview questions & performance summaries. People still make the decisions! What does your HR team use AI for?

#hrtok #humanresources #ai #recruiting
```

**Pinned comment:** `Aturan emas: hapus nama, NIK & data pribadi karyawan sebelum pakai AI publik 🔒`

**Video script (alternative, ~30s):** HR person at a desk. "Dulu…" (stack of papers), then "Sekarang…" (draft job description on screen), then a quick edit, then "Keputusan tetap di kita." Dummy data only.

> Note: this is general AI usage advice, not a feature of Vanaila HRIS. Don't imply HRIS has these AI features unless it does.

---

## Post 18: Kerja tanpa AI vs dengan AI 😅

**Format:** Photo Mode, 5 slides · **Sound:** trending comedic "before/after" track from the CML

**Title (ID):** `Kerja Tanpa AI vs Dengan AI 😅`  
**Title (EN):** `Working Without AI vs With AI 😅`  
**Content disclosure:** OFF (educational, no product promotion)

**Caption (ID)**
```
Kerja tanpa AI vs dengan AI 😅 Nomor 3 paling kerasa bedanya! AI bantu mulai, kamu yang menyelesaikan. Kamu paling sering pakai AI untuk apa?

#ai #kerjacerdas #kerjakantoran #aitools #produktivitas
```

**Caption (EN, optional)**
```
Working without AI vs with AI 😅 #3 hits different! AI helps you start, you finish the job. What do you use AI for most?

#ai #worksmarter #officelife #aitools
```

**Pinned comment:** `Tetap cek ulang hasil AI ya, dia bisa salah dengan sangat percaya diri 😂`

**Video script (alternative, ~20s):** split-screen skit. Left side, "tanpa AI": a frustrated person facing a blank screen. Right side, "dengan AI": a relaxed person editing a draft. Three quick rounds, one per slide. End on "AI bantu mulai. Kamu yang menyelesaikan."

---

# Trend meme (post 19)

## Post 19: "In this picture…" → she's looking at Vanaila 😌

**Format:** Photo Mode, 5 slides · **Sound:** use the **original trending sound** of this meme if it's in the Commercial Music Library. If it isn't, pick a dramatic/suspense CML track.

**Title (ID):** `In This Picture… Dia Lagi Lihat Apa? 👀`  
**Title (EN):** `In This Picture… She's Looking At 👀`  
**Content disclosure:** ON → *Your brand* (the last slide promotes Vanaila)

**Slides**
1. "In this picture…" (original image)
2. "He's looking at another woman" (original image)
3. "He's looking at her" (original image)
4. "And she's looking at" (original image)
5. **Vanaila** (our slide in the brand style: "…and she's looking at" → "Vanaila. Website yang bikin semua *menoleh*.", two template screenshots, Website · Aplikasi · Sistem bisnis, CTA "Konsultasi → link di profil")

**Caption (ID)**
```
Plot twist di slide terakhir 😌 Semua orang lagi lihat sesuatu… dan dia lihat website yang bikin bisnis kelihatan premium. Meme template: @partyandtoolrentals

#inthispicture #memebisnis #websitebisnis #umkm #vanaila
```

**Caption (EN, optional)**
```
Plot twist on the last slide 😌 Everyone's looking at someone… she's looking at the website that makes a business look premium. Meme format via @partyandtoolrentals

#inthispicture #businessmeme #webdesign #smallbusiness
```

**Pinned comment:** `Kalau website bisnismu belum bikin orang "noleh", komen bidang usahamu 👀`

> ⚠️ **Rights check before posting:** slides 1–4 are the original creator's images (watermark @partyandtoolrentals kept, credited in the caption). Reposting someone else's media in a **business** post can lead to a copyright takedown. TikTok may also treat it as unoriginal content and keep it out of the For You feed. Safest options, best first:
> 1. Ask @partyandtoolrentals for permission (a DM is enough), or
> 2. Swap slides 1–4 for a licensed stock photo with the same "everyone looking somewhere" setup, then add the text overlays. Slide 5 stays the same.
>
> Never remove or crop out the creator's watermark.

**Video version (alternative, ~10s):** use TikTok's slideshow/photo template with the trending audio. Show each image for ~2s with the text, then hard-cut to the Vanaila slide on the beat drop.

---

## Posting checklist
- [ ] Posted from the Business Account, with a sound from the Commercial Music Library
- [ ] Slides uploaded in order (s1 → s5, max 5)
- [ ] Title filled in (≤90 chars, keyword first)
- [ ] Caption: keyword first line, one CTA, 3–5 relevant hashtags (no #fyp spam)
- [ ] Content disclosure set as noted (Your brand ON/OFF)
- [ ] AI-generated label ON if any AI imagery or voice was used
- [ ] Bio link updated (contact / demo page)
- [ ] CTA comment pinned
- [ ] Replied to comments within the first hour
