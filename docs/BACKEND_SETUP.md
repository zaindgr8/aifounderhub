# AI Founder Hub — Backend Setup Runbook

The backend is built. This is the step-by-step to make it live. Nothing here
needs code changes; it is accounts, keys, and deploys.

---

## What's built

```
Website form / Book button
        │
        ▼
Supabase Edge Functions (server logic, holds all secrets)
  capture-lead     → CRM lead + welcome email
  availability     → open 1:1 slots for a mentor
  create-payment   → opens a Ziina payment, returns checkout URL
  ziina-webhook    → Ziina calls this when paid → confirms + emails
  verify-payment   → fallback check when the buyer returns
        │
        ├── Postgres (Supabase): leads, members, mentors, bookings,
        │                        payments, bootcamp_applications, webhook_events
        ├── Ziina  → one-time payments (1:1 $299, bootcamp $249, membership month)
        └── Resend → customer emails + alerts to YOUR booking inbox (+ .ics invite)
```

Until `VITE_SUPABASE_URL` is set, the site runs in **demo mode** (forms simulate
success, booking shows a "coming soon" note). It will not break.

---

## Prerequisites (create these accounts)

1. **Supabase** account + a new project. https://supabase.com
2. **Ziina** business account with API access (start with a TEST key). https://docs.ziina.com
3. **Resend** account + a verified sending domain (e.g. aifounderhub.com). https://resend.com
4. The **Supabase CLI**: `npm i -g supabase` (or `brew install supabase/tap/supabase`).

---

## Step 1 — Database

```bash
cd "AIFounderHub"
supabase login
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations/0001_init.sql
```

This creates all tables and seeds the two mentors (Ahmed, Zain). RLS is on with
no public policies, so only the Edge Functions (service role) can touch data.

## Step 2 — Set the function secrets

```bash
supabase secrets set \
  ZIINA_API_KEY="sk_test_..." \
  ZIINA_API_BASE="https://api-v2.ziina.com/api" \
  ZIINA_TEST_MODE="true" \
  ZIINA_WEBHOOK_SECRET="$(openssl rand -hex 24)" \
  RESEND_API_KEY="re_..." \
  EMAIL_FROM="AI Founder Hub <hello@aifounderhub.com>" \
  BOOKINGS_NOTIFY_EMAIL="bookings@aifounderhub.com" \
  SITE_URL="https://aifounderhub.com" \
  ALLOWED_ORIGIN="https://aifounderhub.com" \
  BOOTCAMP_PRICE_FILS="91500" \
  MEMBERSHIP_PRICE_FILS="18350"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically in
deployed functions. Save the `ZIINA_WEBHOOK_SECRET` value, you need it in Step 4.

## Step 3 — Deploy the functions

**Live now: CRM only.** Bookings and payments are handled manually for the launch,
so you only need `capture-lead` to go live:

```bash
supabase functions deploy capture-lead
```

The payment + booking functions are built and ready but NOT wired into the site
yet (Zain finishes that later). Deploy them when you wire the automated flow:

```bash
supabase functions deploy availability create-payment ziina-webhook verify-payment
```

Your function base URL is `https://<project-ref>.functions.supabase.co/<name>`.

## Step 4 — Point Ziina at the webhook

In the Ziina dashboard, create a webhook to:
`https://<project-ref>.functions.supabase.co/ziina-webhook?secret=<ZIINA_WEBHOOK_SECRET>`
Subscribe it to payment status events. (The handler also re-verifies every event
against Ziina directly, so it is safe even if the payload shape differs.)
Confirm your exact API base URL and webhook scheme in the Ziina dashboard; the
defaults here follow the public docs.

## Step 5 — Verify the Resend domain

Add the DNS records Resend gives you for your domain so `EMAIL_FROM` and
`BOOKINGS_NOTIFY_EMAIL` send and land in inboxes.

## Step 6 — Wire and deploy the frontend

Set these where the site is hosted (Vercel/Netlify env, or `.env`):
```
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon public key>"
```
Redeploy the site. The forms and booking now hit the real backend.

## Step 7 — Set your real prices

Prices ship as placeholders. Ziina settles in **AED (fils)**; your site shows
USD. Pick the exact AED you want to charge and set it:
- 1:1 sessions: `update mentors set price_fils = <fils> where slug in ('ahmed','zain');`
  (e.g. 1100 AED = `110000`)
- Bootcamp: `BOOTCAMP_PRICE_FILS` secret
- Membership: `MEMBERSHIP_PRICE_FILS` secret

---

## Testing (before real money)

With `ZIINA_TEST_MODE="true"`, complete a booking and pay with any test card
(see Ziina "Test cards" in their docs). Confirm:
- a row appears in `bookings` (status `confirmed`) and `payments` (`completed`)
- the customer gets a confirmation email with a `.ics` invite
- your `BOOKINGS_NOTIFY_EMAIL` inbox gets the internal alert

## Going live

Set `ZIINA_TEST_MODE="false"` and swap in your **live** Ziina key:
`supabase secrets set ZIINA_TEST_MODE="false" ZIINA_API_KEY="sk_live_..."`

---

## What is wired now vs next

**Live now (this is the launch scope):**
- CRM lead capture: the Hero signup writes to `leads` and sends the welcome email.
- "Request a session" buttons open a pre-filled email to your booking inbox.
  Bookings and payments are arranged **manually** for now.

**Built but NOT wired (Zain finishes on his end):**
- Ziina payments + the automated booking flow. The schema, the
  `availability` / `create-payment` / `ziina-webhook` / `verify-payment`
  functions, and the frontend `getAvailability` / `createPayment` / `verifyPayment`
  helpers in `src/lib/api.ts` are all done. To turn it on: deploy those functions,
  rebuild a `BookingModal` (the previous version is in git history at the commit
  "CRM + Ziina payments + 1:1 booking backend"), and point the mentor buttons at it.
- Bootcamp / membership checkout: `create-payment` already supports
  `purpose: 'bootcamp' | 'membership'`; wire the buttons with a small name/email form.
- **Membership renewal:** Ziina has no recurring billing, so membership is a
  one-month pass. Add a daily scheduled function that emails a renewal link to
  members near `expires_at`. (Schema already has `expires_at` and
  `renewal_reminders_sent`.)
- **Admin view:** a simple authed page to read `leads`, `bookings`, `payments`.

## Honest caveats

- I could not create your accounts or test live Ziina payments from here. The
  code is built to run against your test keys; validate end-to-end in Step "Testing".
- Confirm the Ziina **API base URL** and **webhook signature scheme** in your
  dashboard. The integration is configurable (`ZIINA_API_BASE`) and re-verifies
  every webhook against Ziina, so it is resilient, but the exact values are yours
  to confirm.
- For true auto-charging subscriptions you would add Stripe alongside Ziina.
