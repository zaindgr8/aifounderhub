# Read this before sending the deck to an investor

The deck and memo are complete and the financial model ties out. One thing is still
yours to handle.

## 1. Founder credentials (DONE)
Real bios are now in. Slide 11 and the memo Team section credit Ahmed Yahya Al Kindi
(TSB Labs, Devmate Solutions, The System Builder, GCC Top 20 Entrepreneur) and Zain Ul
Abaideen (cofounder and CTO of Devmate Solutions, AI infrastructure and platform
engineering). The memo and risk section state both founders are full-time from launch.
If any detail changes, edit `deck.html` (Team slide) and `INVESTOR_MEMO.md`, then
re-render with the command below.

## 2. The equity and round structure (your action)
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
