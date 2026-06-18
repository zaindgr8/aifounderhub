# AI Founder Hub Brand Kit

> The single source of truth for how AI Founder Hub looks, sounds, and shows up.
> Version 1.0 · June 2026

---

## 1. The Brand in One Breath

**Positioning:** The community where AI builders are made.
**Tagline:** Learn it. Build it. Get paid for it.
**Sub-line:** Idea → App → Income
**Promise:** You bring the idea. AI writes the code. We teach the loop in between.
**Personality:** A sharp, generous builder. Confident, never hypey. Talks outcomes, not features. Slightly playful, always honest. No em dashes, ever.

---

## 2. Logo

The mark is a **lightning bolt in a rounded tile**: instant energy, app-icon native, readable at 16px.

| File | Use |
|---|---|
| `logo/logo-primary.svg` | Default. Volt tile, void bolt. On light or photo backgrounds |
| `logo/logo-primary-dark.svg` | On dark backgrounds (void tile, volt bolt, volt ring) |
| `logo/logo-mono-black.svg` | Single-color print, embossing, stamps (bolt is punched out) |
| `logo/logo-mono-white.svg` | Single-color on dark photos or video |
| `logo/wordmark-on-dark.png` | Horizontal lockup for dark headers, banners, decks |
| `logo/wordmark-on-light.png` | Horizontal lockup for light contexts |
| `logo/avatar-instagram.svg/png` | Social profile picture (circle-safe, bolt centered) |

**Rules**
- Clear space: keep at least half the tile's width empty on all sides.
- Minimum size: 24px tile, 120px wordmark width.
- Never: recolor outside the palette, rotate, add shadows, stretch, or place the volt tile on the volt background without the void variant.

---

## 3. Color

| Name | Hex | Role | Ratio |
|---|---|---|---|
| **Void** | `#07070B` | Primary background, text on volt | ~60% |
| **Volt** | `#CCF244` | The signature. CTAs, accents, highlights | ~20% |
| **Paper** | `#F4F1E8` | Editorial relief, light tiles | ~10% |
| **Lilac** | `#B5A1FF` | Secondary accent, serif moments | ~5% |
| Panel | `#0D0D14` | Cards on void | support |
| Edge | `#1E1E2A` | Hairline borders | support |
| Ink | `#14130E` | Text on paper | support |
| Volt Deep | `#9DC41C` | Volt on light backgrounds | support |

Volt is the brand. If a layout has no volt, it is not finished. If everything is volt, nothing is.

---

## 4. Typography

| Font | Role | Where to get it |
|---|---|---|
| **Bricolage Grotesque** (800) | Display headlines, always uppercase, tight tracking | Google Fonts |
| **Instrument Serif** (italic) | The "human" accent: one phrase per layout, lowercase | Google Fonts |
| **Inter** (400-700) | Body copy | Google Fonts |
| **JetBrains Mono** (700) | Eyebrows, labels, data, dates. Wide letter-spacing | Google Fonts |

The signature move: a heavy uppercase grotesque line followed by one italic serif phrase in volt or lilac. Example: "YOU DON'T NEED TO LEARN TO CODE. *you need to learn to ship.*"

---

## 5. Voice and Tone

**We say:** ship, build, loop, live, real, free forever, your call
**We never say:** ninja, guru, hack, secret, get rich, limited spots (unless literally true), em dashes

- Short sentences. Strong verbs. Outcomes before features.
- Prices stated plainly, anchored honestly ($299/hr and $249 before $49.99/mo).
- Every claim survivable by a skeptic: if we can't prove it, we don't post it.
- One CTA per piece of content. "Link in bio" on socials, "Save your free seat" on web.

---

## 6. Social Templates (the system behind the first 9)

Every tile: 88px padding, mono eyebrow with dash, display headline, serif accent phrase, brand footer (tile logo + name, @aifounderhub.me, post index), dot grid, film grain at 5%, oversized bolt watermark bottom-right at 7%.

Three tile themes rotate to build the grid pattern:
- **Volt tile** for statements and CTAs
- **Void tile** for education, product, and proof
- **Paper tile** for lists and editorial value

**The first-9 grid pattern** (as it appears on the profile, newest first):

```
[9 volt]  [8 void]  [7 paper]
[6 void]  [5 volt]  [4 void ]
[3 paper] [2 void]  [1 volt ]
```

The volt diagonal (9-5-1) plus paper corners (7, 3) makes the profile read as one designed object. Maintain the rhythm after launch: roughly 1 volt : 2 void : occasional paper.

---

## 7. Instagram Profile Setup

- **Handle:** @aifounderhub.me (claim the closest match on TikTok, X, YouTube, LinkedIn; some platforms disallow periods)
- **Avatar:** `logo/avatar-instagram-1024.png`
- **Name field:** AI Founder Hub | Build Apps With AI (searchable keywords)
- **Bio:**
  > The community where AI builders are made ⚡
  > 🆓 Free live masterclass every Friday
  > 🛠 Idea → App → Income, no code needed
  > 📍 Dubai and everywhere ↓
- **Link:** the website (aifounderhub.com), or a link-in-bio page (Linktree / Beacons) with the workshop signup first.
- **Highlights (volt covers, mono labels):** START HERE · WORKSHOPS · BOOTCAMP · DUBAI
  (add a RECEIPTS highlight only once real member results exist; never pad it with mockups)

---

## 8. Asset Inventory

```
branding/
├── BRAND_KIT.md             ← this file
├── logo/                    ← 5 SVGs + 4 PNGs (transparent)
├── instagram/
│   ├── art/posts.html       ← the design source (edit text, re-render)
│   ├── art/highlight-*.html ← cover + story sources for highlights
│   ├── png/post-01..09.png  ← 1080x1080, ready to post
│   ├── grid-preview.png     ← the 3x3 profile preview
│   ├── highlights/          ← 4 covers + 12 story frames (see highlights/README.md)
│   ├── render-highlights.sh ← re-render the highlights
│   └── CAPTIONS.md          ← captions, hashtags, posting plan
```

**To re-render after editing `posts.html`:**
```bash
cd branding
for i in 1 2 3 4 5 6 7 8 9; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
    --window-size=1080,1080 --hide-scrollbars --virtual-time-budget=15000 \
    --screenshot="instagram/png/post-0$i.png" \
    "file://$PWD/instagram/art/posts.html?p=$i"
done
```
