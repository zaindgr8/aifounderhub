# AI Founder Hub — Program Design Document

> Internal blueprint for the community, funnel, and paid programs.
> Last updated: June 2026 · Owners: Ahmed (Business) & Zain (AI/Product)

---

## 1. Positioning

**AI Founder Hub is the community where AI builders are made.**
Non-technical founders, freelancers, and business operators learn to ship real AI
products — and get paid for them. Virtual-first, Dubai-rooted.

Tagline: **Learn it. Build it. Get paid for it.**

---

## 2. The Funnel

```
Signup (website form, captures #1 goal)
   │
   ▼
CRM contact created  →  tagged by goal: founder / freelancer / scaleup / agency / explore
   │
   ▼
Automated email #1: welcome + invite to next free workshop (within minutes)
   │
   ▼
Free weekly workshops (lead magnets) + 3-day flagship summit
   │            │
   │            ▼
   │   Nurture sequence per goal tag (case studies, pathway previews)
   ▼
Paid conversion offers, in ascending commitment:
   1. Courses Membership: $49.99/month subscription (course library + replays + vault)
   2. AI Builder Bootcamp: $249 per program (goal-based pathway, up to 4 weeks)
   3. 1:1 sessions with Ahmed & Zain: $299 per 60-minute session (AI + business)

**On-page conversion placement (matches the live site):**
- The membership band sits immediately AFTER the free workshops section, while
  attention and intent are highest ("why wait for Friday" framing).
- The post-signup success ticket carries a membership tripwire ("your workshop is
  days away; members start tonight"). This is the highest-intent moment on the page.
- The workshops section plants replay FOMO ("every replay lands in the membership").
- The final CTA offers the membership as the secondary path for visitors not ready
  to commit to a live date.
- Anchoring used throughout: $299/hr and $249 are stated before $49.99/mo so the
  subscription reads as the obvious low-risk entry. Risk reversal: cancel anytime,
  7-day money-back guarantee.
```

**CRM requirements (when wiring the backend):**
- Fields: first name, email, phone (optional), country, goal tag, source workshop, attendance history.
- Automations: instant welcome email w/ next-workshop invite; weekly workshop broadcast;
  post-workshop follow-up (replay + pathway pitch matched to goal tag); bootcamp cart
  abandonment; Dubai-event alerts for UAE-region contacts.
- Suggested stack: HubSpot Free / Brevo / GoHighLevel + Zapier or n8n webhook from the form.

---

## 3. Free Tier (Lead Magnets)

| Asset | Cadence | Format |
|---|---|---|
| Claude MasterClass | monthly rotation | Virtual, live, 90 min |
| OpenClaw MasterClass (personal AI agents) | monthly rotation | Virtual, live, 90 min |
| Build Apps Using AI MasterClass | monthly rotation | Virtual, live, 90 min |
| AI Automations MasterClass | monthly rotation | Virtual, live, 90 min |
| Vibe Coding 101 / Micro-SaaS Money / AI Agents for Sales | new drops monthly | Virtual |
| 3-Day Build Summit (flagship) | quarterly | Virtual, live, 3 days |
| Dubai Build Night | monthly-ish | In person, free |

Every workshop ends with a soft pitch: pathway quiz → bootcamp or mentorship.

---

## 4. AI Builder Bootcamp: $249 per program

**Format:** up to 4 weeks · live weekly labs · 1:1 checkpoints · templates & workbooks ·
community channel · demo day finale. Cohort-based, capped seats per pathway.

### Pathway A — Founder Launch (idea → first client)

*Audience:* aspiring founders, with or without an idea.

| Week | Theme | Materials | Learning outcome |
|---|---|---|---|
| 1 | Validate Like a Pro | Validation workbook · 25 market-research prompts · competitor-scan agent template | Validated one-liner + waitlist landing page live |
| 2 | Build the MVP | MVP blueprint canvas · founder prompt library · UI component kit | Working MVP deployed to a real URL |
| 3 | Monetize It | Stripe playbook · pricing calculator · pilot-offer call scripts | Live checkout + 3 pilot conversations booked |
| 4 | Launch & Sell | 30-day GTM plan · outreach sequences · pitch deck framework | Public launch + first-client pipeline |

**Graduates leave with:** live product, validated offer & pricing, working checkout,
30-day GTM plan, demo-day pitch.

### Pathway B — Freelance Pro (get hired on marketplaces)

*Audience:* anyone starting from zero clients/portfolio who wants AI-service income.

| Week | Theme | Materials | Learning outcome |
|---|---|---|---|
| 1 | Pick Your Lane | Niche selector matrix · service menu templates · rate card builder | Defined offer + AI-built portfolio site live |
| 2 | Proof of Work | 3 demo project briefs · case-study generator prompts · Loom walkthrough framework | 3 polished, deployed portfolio pieces |
| 3 | Marketplace Domination | Profile audit checklist · 20 proposal templates · keyword research kit | Optimized Upwork/Fiverr/LinkedIn profiles + 10 proposals sent |
| 4 | The Client Machine | Discovery call scripts · SOW templates · delivery & review checklist | Repeatable client pipeline + first-gig action plan |

**Graduates leave with:** live portfolio, 3 case studies, optimized profiles,
proposal & pricing system, client delivery playbook.

### Pathway C — Business Scale-Up (existing business + AI)

*Audience:* owners/operators with revenue who want hours back and margins up.

| Week | Theme | Materials | Learning outcome |
|---|---|---|---|
| 1 | AI Opportunity Audit | Workflow mapping canvas · ROI scoring matrix · audit interview agent | Prioritized automation roadmap |
| 2 | Automate Operations | 12 plug-and-play automation templates · integration guides · cost-per-task calculator | First 3 automations in production |
| 3 | The AI Growth Engine | Content engine kit · funnel personalization templates · lead-scoring prompts | AI-assisted marketing system shipping weekly |
| 4 | Team & Governance | AI policy template · team training curriculum · 90-day roadmap canvas | Team enabled + signed-off 90-day AI roadmap |

**Graduates leave with:** ROI roadmap, 3 production automations, AI marketing engine,
team playbook & SOPs, 90-day scale roadmap.

### Pathway D — Automation Agency *(our suggested addition)*

*Audience:* builders who want recurring-revenue AI services (productized retainers).
This captures the booming "AI automation agency" segment between freelancer and founder.

| Week | Theme | Materials | Learning outcome |
|---|---|---|---|
| 1 | Niche & Offer | Vertical selection scorecard · retainer package builder · agency brand kit prompts | Signature offer + agency site live |
| 2 | The Delivery Stack | Agent template vault (OpenClaw, n8n, LLM APIs) · build SOPs · client env checklist | Deliver-in-one-week fulfillment stack |
| 3 | The Sales Engine | Outbound sequence pack · discovery call framework · proposal & close templates | 20 outbound conversations + booked calls |
| 4 | Fulfill & Scale | QA checklist library · subcontractor onboarding kit · upsell map | Retainer pipeline + 90-day scale plan |

**Other pathway candidates for later:** AI for Creators (content businesses),
AI Career Accelerator (employees becoming AI leads in their company), Corporate team
edition of Scale-Up (B2B, priced separately).

---

## 5. Courses Membership: $49.99/month

The recurring-revenue base of the business. One subscription, all content:

- Full course library (Claude, OpenClaw, app building, automations)
- A new deep-dive course drop every month
- Replay vault of every masterclass and summit
- Template, prompt and workbook vault
- Members-only community channels
- Cancel anytime

**Positioning:** the "stay and grow" tier. Free workshop attendees who are not ready
for a bootcamp convert here; bootcamp graduates land here to keep momentum.

---

## 6. 1:1 Sessions with Ahmed & Zain: $299 per hour

Private 60-minute sessions, booked on demand. No monthly commitment.

- **Ahmed (Business & Growth):** offer/pricing strategy, sales & first clients,
  scaling ops, Dubai market entry.
- **Zain (AI Engineering):** AI app architecture, agent & automation stacks,
  code/prompt reviews, tool selection & cost control.

Suggested bundle for later: 3-pack at $799 (saves $98) to encourage repeat bookings.

---

## 7. Dubai In-Person Track

- **Free:** monthly Build Night (laptops, prototypes, networking) — community growth +
  content capture.
- **Paid:** quarterly hands-on intensives (1-day, premium pricing), summit watch parties,
  bootcamp demo days hosted live when a cohort is UAE-heavy.

---

## 8. Pricing Summary

| Tier | Price | Promise |
|---|---|---|
| Community + workshops + summit | $0 | Learn the skills live, every week |
| Courses Membership | $49.99 / month | All courses, replays and templates, always growing |
| AI Builder Bootcamp | $249 / program (up to 4 weeks) | Ship a goal-specific result with support |
| 1:1 sessions (Ahmed or Zain) | $299 / hour | Targeted unblock, booked on demand |

## 9. KPIs to track from day one

- Signup to workshop attendance rate (target 35%+)
- Workshop attendee to bootcamp conversion (target 5-8% at the $249 price point)
- Free attendee to courses membership conversion (target 4%+)
- Bootcamp completion rate (target 70%+) and demo-day artifacts shipped
- Membership churn (target under 8%/month) and 1:1 session rebooking rate
- Dubai event NPS + repeat attendance
