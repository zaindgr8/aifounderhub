# Instagram Story Highlights

Four highlights, each with a circular **cover icon** and **3 story frames**. Matches the
brand system in `../../BRAND_KIT.md` (section 7). Volt covers, void glyphs, mono labels.

```
highlights/
├── covers/                  ← set these as the highlight cover image
│   ├── cover-start.png      (flag)      label: START HERE
│   ├── cover-workshops.png  (calendar)  label: WORKSHOPS
│   ├── cover-bootcamp.png   (rocket)    label: BOOTCAMP
│   └── cover-dubai.png      (pin)       label: DUBAI
└── stories/                 ← the frames that live inside each highlight, in order
    ├── start-1..3.png       you bring the idea → the path → start free Friday
    ├── workshops-1..3.png   every Friday free → what's on → save your seat
    ├── bootcamp-1..3.png    one goal/pathway → 4 pathways → $249, DM to apply
    └── dubai-1..3.png       Build Night free → what happens → RSVP free
```

## How to set them up on Instagram

1. **Post the frames as a Story.** Add the 3 frames for one highlight to your story
   (any order; they upload in sequence). They expire after 24h, which is fine.
2. **Create the highlight.** Profile → `+` under your bio → New → select those frames →
   Next. Type the **title** (keep it short, uppercase: `START HERE`, `WORKSHOPS`,
   `BOOTCAMP`, `DUBAI`). Instagram truncates long titles, so the short label matters.
3. **Set the cover.** Edit Highlight → Edit Cover → choose from gallery → pick the
   matching `covers/cover-*.png`. Instagram crops to a centre circle; the glyph is
   centred with padding so it never clips.
4. Repeat for each highlight. Keep them in this left-to-right order on the profile:
   **START HERE · WORKSHOPS · BOOTCAMP · DUBAI** (intro, then the offer ladder).

The cover image carries no text on purpose: at highlight size text is unreadable, so
the typed Instagram title is the label and the icon is the visual.

## Re-rendering after an edit

Edit the copy/icons in `../art/highlight-stories.html` or `../art/highlight-covers.html`,
then:

```bash
cd branding/instagram
./render-highlights.sh
```

(Uses headless Chrome, same as the posts. Covers render 1080x1080, stories 1080x1920.)

## Later additions

The brand kit reserves a **RECEIPTS** highlight for real, permissioned member wins
(do not pad it with mockups). **MEMBERSHIP** ($49.99/mo) and **1:1** ($299/hr) highlights
can be added the same way when you want the full offer ladder on the profile; ask and
the templates drop straight into the same render system.
