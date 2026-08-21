# Founder Diary

**The operating system founders actually run their week on.**
Rituals in, numbers out. Checklists that know your revenue.

Status: plan. Nothing built yet.

---

## 1. The insight

Every founder cheat sheet on the internet is a static image. People save it, feel
productive, and never open it again. The checkboxes are not clickable, the numbers are
not tracked, and nobody ever tells you when a red flag actually fires.

Founder Diary turns those sheets into a running system:

1. **Rituals** (morning, evening, Monday, Friday) that take 90 seconds each.
2. Every ritual captures a **checkbox and a number** (cash in bank, revenue today,
   prospects contacted, deals closed).
3. Those numbers roll into a **dashboard**: runway, burn, MRR, CAC, LTV, churn, streaks.
4. A **rule engine** watches the numbers and raises the red flags from the sheets
   ("burn growing faster than revenue", "founder does not know their numbers").
5. An **AI chief of staff** reads the diary plus the numbers and writes the weekly review,
   spots patterns, and drafts next week's goals.

The moat is the loop. A habit tracker has no numbers. A dashboard has no habit. Founder
Diary is the only place where the two feed each other, and after 90 days the founder has a
searchable history of every decision, number, and lesson. That history is what makes them
never churn.

---

## 2. Modules (mapped from the six sheets)

| Module | Source sheet | What it does |
|---|---|---|
| **Today** | Founder Daily Operating System | Morning 5 and Evening 5. Revenue dashboard, cash in bank, top 3 priorities, biggest customer problem, one sales activity. Evening: revenue generated, lessons learned, team update, tomorrow's plan, one improvement. |
| **Sales Desk** | Sales Cheat Sheet | Daily counters (20 prospects, follow ups, referrals asked, testimonials collected, deals closed), a lite pipeline of leads with next-follow-up dates, and an objection log where every objection is filed as feedback. |
| **The Week** | Weekly CEO Checklist | Monday plan (revenue, expenses, team meeting, roadmap, marketing) and Friday review (wins, failures, customer feedback, hiring, runway, next week goals). |
| **Numbers** | Startup Financial Rules | Runway, burn, CAC, LTV, LTV:CAC, churn, emergency cash months, business vs personal separation. Charts from the daily cash and revenue entries. |
| **Red Flags** | Startup Financial Rules | Automated detection. Fires a card when a rule trips, stays open until acknowledged or resolved. |
| **Rules Scorecard** | Founder Rules | The eight rules as a monthly self-audit with a score and trend, plus a note on each. |
| **Focus** | Productivity System | The Use/Avoid audit as a weekly 30 second rating, plus a deep work timer and a distraction log. |
| **Diary** | (the spine) | Every entry, lesson, and decision on one searchable timeline. Export to PDF or Markdown. |
| **Chief of Staff** | (the AI layer) | Weekly review written from real data, pattern spotting, next week goals, and a Sunday "here is what changed" email. |

### Streaks and accountability
Streak per ritual, not per app. Morning streak, evening streak, Monday streak, Friday
streak. A public "founder streak" badge that can be shared, which is the growth loop.
Miss a day and you get one freeze per month, because guilt kills retention.

---

## 3. Data model (Postgres, schema `diary`)

Keep it in its own schema so it never collides with the existing AI Founder Hub payments
and CRM tables. Unlike the current site schema (service role only, no policies), this app
is real multi tenant, so **RLS is on with `auth.uid()` policies on every table**.

```
diary.profiles          id (= auth.users.id), display_name, company_name, currency,
                        timezone, fiscal_start, onboarded_at, plan, streak_freezes_left

diary.rituals           id, key (morning|evening|monday|friday|sales_daily|monthly_rules),
                        title, cadence, sort_order, is_system, owner_id (null = system)

diary.ritual_items      id, ritual_id, key, label, icon, input_type
                        (check|number|money|text|select), unit, sort_order, is_required

diary.entries           id, user_id, ritual_id, entry_date, status
                        (pending|complete|skipped), completed_at, duration_seconds
                        unique (user_id, ritual_id, entry_date)

diary.entry_values      id, entry_id, item_id, bool_value, num_value, text_value

diary.metric_points     id, user_id, metric_key, on_date, value, source
                        (entry|manual|integration)
                        metric_key: cash_in_bank, revenue_day, expenses_month, mrr,
                        new_customers, churned_customers, cac_spend, prospects_contacted,
                        deals_closed, followups_sent
                        unique (user_id, metric_key, on_date)

diary.goals             id, user_id, period (week|month|quarter), period_start, title,
                        target_metric, target_value, actual_value, status

diary.leads             id, user_id, name, company, source, stage
                        (new|contacted|qualified|proposal|won|lost), value, currency,
                        last_touch_at, next_followup_at, notes

diary.lead_events       id, lead_id, kind (touch|objection|proposal|win|loss), body,
                        created_at

diary.testimonials      id, user_id, lead_id, author, quote, permission_to_use, asset_url

diary.lessons           id, user_id, on_date, body, tags[], sentiment

diary.rule_scores       id, user_id, period_start, rule_key, score (0-5), note
                        rule_key: build_before_announcing, sell_before_scaling, hire_slow,
                        fire_fast, document_everything, protect_reputation, focus_one_thing,
                        play_long_term

diary.flags             id, user_id, rule_key, severity (info|warn|critical), title, detail,
                        triggered_on, acknowledged_at, resolved_on

diary.ai_reviews        id, user_id, period (week|month), period_start, model, markdown,
                        input_hash, created_at

diary.nudges            id, user_id, channel (email|push|whatsapp), ritual_key, send_at_local,
                        enabled, last_sent_at

diary.subscriptions     id, user_id, plan, status, provider (ziina|stripe),
                        provider_ref, current_period_end
```

**Derived views**

```
diary.v_daily_rollup    user_id, on_date, revenue, cash, burn_30d, prospects, deals,
                        rituals_completed
diary.v_streaks         user_id, ritual_key, current_streak, longest_streak, last_done
diary.v_unit_economics  user_id, month, mrr, cac, ltv, ltv_cac_ratio, churn_rate,
                        runway_months
```

### The red flag rules (cron, nightly)

| rule_key | Trips when |
|---|---|
| `burn_over_revenue` | 30 day burn growth exceeds 30 day revenue growth for 2 consecutive months |
| `no_monthly_reporting` | no `expenses_month` point logged for the previous calendar month |
| `founder_blind` | no `cash_in_bank` point in 7 days |
| `high_churn` | monthly churn above 5 percent, or 3 rising months |
| `no_cash_forecast` | runway not recalculated in 30 days |
| `runway_critical` | runway under 3 months |
| `cac_over_ltv` | LTV:CAC below 3:1 |
| `no_emergency_cash` | cash below 3 months of average burn |
| `pipeline_dry` | fewer than 20 prospects contacted in the last 7 days |
| `followups_rotting` | 5 or more leads past their `next_followup_at` |

Each flag writes a card with the number that caused it and the one action that clears it.

---

## 4. App structure

```
founder-diary/
  index.html
  vite.config.ts                 PWA plugin, installable to home screen
  src/
    main.tsx
    App.tsx                      router + auth gate
    lib/
      supabase.ts                client + typed schema
      queries/                   one file per module, react-query style hooks
      metrics.ts                 runway, burn, CAC, LTV, churn math (pure, tested)
      streaks.ts                 pure streak math
      date.ts                    timezone safe "founder day" boundaries
    components/
      ui/                        Button, Card, Sheet, Stat, Ring, Chart, Empty
      ritual/                    RitualCard, CheckRow, NumberRow, MoneyRow, TextRow
      charts/                    Sparkline, RunwayChart, RevenueBars
    routes/
      Today.tsx                  the default screen. morning or evening by clock
      Week.tsx                   Monday plan / Friday review
      Numbers.tsx                dashboard + charts + unit economics
      Sales.tsx                  daily counters + pipeline + objections
      Flags.tsx                  red flag inbox
      Rules.tsx                  founder rules scorecard + focus audit
      Diary.tsx                  timeline, search, export
      Review.tsx                 AI chief of staff output
      Settings.tsx               nudges, currency, timezone, billing
      Onboarding.tsx             6 questions, then first check in
  supabase/
    migrations/                  0001_diary_schema.sql, 0002_rls.sql, 0003_views.sql
    functions/
      diary-nudge/               cron. sends morning and evening emails via Resend
      diary-flags/               cron. runs the rule engine nightly
      diary-review/              weekly AI review, Claude via the Anthropic API
      diary-export/              PDF/Markdown export of the diary
      diary-billing/             Ziina checkout + webhook, reuses existing _shared/ziina.ts
```

**Where it lives.** New repo, its own Vercel project, at `diary.aifounderhub.com`. It
shares one Supabase project with the main site so a Courses Membership can unlock Diary Pro
without a second account system. The marketing page for it stays on the main site as a new
section plus `/founder-diary`.

**Mobile first, always.** This is a phone app in practice. Build it as an installable PWA
from day one: a 44px tap target grid, thumb-reachable check rows, offline queue so a
check-in never fails on bad signal. Native wrappers later only if retention justifies it.

---

## 5. Tech stack

Reuse what is already proven in this repo, nothing new to learn.

- React 19 + Vite + TypeScript + Tailwind 4, same obsidian/volt design system.
- Supabase: Auth (magic link plus Google), Postgres with RLS, Edge Functions, pg_cron.
- Resend for nudge and review emails. Templates live beside the existing ones.
- Ziina for AED billing, same `_shared/ziina.ts` pattern as the site. Stripe later for
  non UAE cards.
- Claude (Anthropic API) for the chief of staff. Structured prompt over the last 7 days of
  rollups, lessons, and flags. Cache the system prompt, cap tokens, store the output so it
  is generated once per week per user.
- Recharts or lightweight SVG for charts. No heavy chart bundle on a phone.

---

## 6. Pricing

Slots into the existing ladder without cannibalising it.

| Tier | Price | Gets |
|---|---|---|
| **Free** | 0 | Today, streaks, diary timeline, 30 day history. This is the habit hook. |
| **Pro** | $19/mo or $180/yr | Numbers dashboard, red flag engine, sales desk, full history, exports, AI weekly review. |
| **Included** | in Courses Membership $49.99/mo | Diary Pro bundled. Makes the membership stickier and gives every member a daily reason to open an AI Founder Hub product. |
| **Team** | $49/mo (later) | Shared company numbers, co-founder visibility, team update roll ups. |

Diary Free is also the best lead magnet the hub could have: it collects an email, it earns
a daily open, and every red flag is a natural place to offer a 1:1 founder session.

---

## 7. Build phases

**Phase 0. Foundation (2 to 3 days)**
Repo, Supabase schema and RLS, auth, PWA shell, design tokens, seeded system rituals.

**Phase 1. The habit (week 1)**
Today screen with morning and evening rituals, entry saving, streaks, diary timeline,
onboarding. Ship this to 10 founders. Nothing else matters if the daily check-in does not
stick.

**Phase 2. The numbers (week 2)**
metric_points capture inside the rituals, Numbers dashboard, runway and burn and unit
economics math with unit tests, the Monday and Friday rituals.

**Phase 3. Sales and flags (week 3)**
Sales Desk counters and lite pipeline, objection log, the nightly rule engine, the Flags
inbox, email nudges via cron.

**Phase 4. Intelligence (week 4)**
Claude weekly review, pattern spotting, Sunday email, rules scorecard and focus audit,
export.

**Phase 5. Money (week 5)**
Ziina billing, Free vs Pro gating, membership entitlement sync with the main site,
referral and public streak badge.

Ship Phase 1 to real founders in the Dubai community before writing Phase 2. The check-in
completion rate on day 7 is the only metric that decides whether this becomes a product.

---

## 8. Success metrics

- Day 7 morning check-in completion above 40 percent.
- Median streak length above 10 days by week 4.
- Free to Pro conversion above 5 percent by day 30.
- At least one red flag acknowledged per active user per month, which proves the engine
  earns its keep.

---

## 9. Open decisions

1. Solo founder only at launch, or co-founder shared workspace from the start.
   Recommendation: solo. Teams double the schema and halve the shipping speed.
2. Manual number entry only, or bank and Stripe integrations.
   Recommendation: manual first. Typing the cash number every morning is the ritual, and
   automation removes the very awareness the product sells.
3. Separate brand or an AI Founder Hub product.
   Recommendation: AI Founder Hub product, own subdomain, shared login.
