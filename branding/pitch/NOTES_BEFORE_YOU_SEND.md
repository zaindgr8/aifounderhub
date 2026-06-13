# Read this before sending the deck to an investor

The deck and memo are complete and the financial model ties out. Three things are
yours to confirm or fill in, because I cannot invent them honestly.

## 1. Founder credentials (Slide 11, important)
A skeptical angel review flagged the Team slide as the weakest point: at pre-launch,
the investment is a bet on you two. Right now each bio leads with what you genuinely
built for AI Founder Hub (true and a good signal), but it has no prior track record.

Before sending, add one concrete, verifiable proof point per founder, for example:
- A company you built, ran, or sold
- A product you shipped or a named role you held
- Years in the field, a notable client, or a relevant win

To edit: open `deck.html`, find the Ahmed and Zain `<p>` bios on the Team slide,
add your real credential, then re-render (command in `branding/BRAND_KIT.md` or below).

## 2. "Both full-time from launch" (memo risk section)
The memo now states you are both full-time on AI Founder Hub from launch. If that is
not yet true, change that line in `INVESTOR_MEMO.md` so the deck stays honest.

## 3. The equity and round structure
The deck offers 20% for 100,000 AED and names a 250,000 AED alternative. Confirm with
the investor how it is structured (priced equity, SAFE, or convertible) and get it
papered properly. The deck states the offer; the term sheet makes it real.

## Re-rendering after any edit
```bash
cd branding/pitch
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for i in $(seq 1 13); do n=$(printf "%02d" $i); "$CHROME" --headless --disable-gpu \
  --hide-scrollbars --window-size=1280,720 --virtual-time-budget=12000 \
  --screenshot="png/slide-$n.png" "file://$PWD/deck.html?s=$i"; done
"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="AI-Founder-Hub-Pitch-Deck.pdf" --virtual-time-budget=20000 \
  "file://$PWD/deck.html"
```

## What was checked
An adversarial review (a MENA angel skeptic and a financial-model auditor) confirmed:
use of funds sums to exactly 100% and 100,000 AED; MRR, ARR, cumulative revenue and
net all reconcile; LTV:CAC and the AED/USD conversions are correct; and there is no
fabricated traction. The fixes from that review are already applied.
