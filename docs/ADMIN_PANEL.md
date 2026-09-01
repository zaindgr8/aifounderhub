# /admin — operator dashboard

Answers four questions from one page: how many people signed up, who bought what
on which package, where those people came from, and whose access is expiring.

Live at `https://aifounderhub.com/admin` (and `localhost:3000/admin` in dev).
It is a separate lazy-loaded bundle, so the marketing site's payload is unchanged.

---

## Turn it on (2 steps)

### 1. Run the migration

Open the Supabase SQL editor and paste **`supabase/migrations/0003_admin_analytics.sql`**.
It is additive and idempotent — safe to re-run, nothing is dropped.

It does four things:

| Change | Why |
|---|---|
| `leads.goal` enum → `text` | The live forms submit `workshop` and `session`, which the old `lead_goal` enum rejected — every workshop signup was failing to persist. |
| Adds `payments.amount_cents`, `product_code`, `product_label`, `provider`, `completed_at` | Ziina charges USD cents here, not AED fils, and nothing recorded which package was bought. |
| Adds `leads.full_phone / workshop_title / ticket_number / submissions` and `members.full_name / product_code / total_paid_cents` | The forms already collect these; they had nowhere to go. |
| Creates `admin_users` and `admin_audit_log` | The access allowlist, and a record of every grant/revoke/manual payment. |

The panel works *before* the migration too — it falls back to the base columns —
but package attribution is inferred rather than stored, and it will tell you so
in a Setup banner.

### 2. Set the admin allowlist

Either add a row to `admin_users` (the migration seeds `zangbang360@gmail.com`
and `desigeek0007@gmail.com` — change these), or set the env var, locally and in
Vercel:

```
ADMIN_EMAILS="you@aifounderhub.com,cofounder@aifounderhub.com"
```

Either one grants access. With neither set it falls back to `OWNER_EMAIL`.

---

## Entitlements are per product (migration 0005)

`members` used to carry a unique index on `lower(email)` — one entitlement row
per person. But `check-member` derives `hasClaudeAccess` / `hasRoadmapAccess`
from the `product_code` of every active row, so a customer who bought Master
Claude and then the RoadMap hit a duplicate-key error. The insert sat inside
`Promise.allSettled`, so checkout carried on and still sent "you're enrolled" —
while `members` kept only the first product. **They paid $159/mo and were locked
out.** Same in reverse.

Migration 0005 moves uniqueness to `(lower(email), product_code)` and adds
`grant_member_product()`, an atomic upsert. PostgREST cannot name an expression
index as an upsert conflict target, which is exactly why the old code fell back
to a plain insert and 409'd — so the backend now calls the function instead of
POSTing to `/members`. It also never shortens access: re-confirming an old
payment keeps the later expiry.

In the panel this means the **Access** column lists every product a person
owns, and the customer drawer has an Entitlements list where each product can be
revoked on its own, plus a product-aware grant control. "Active members" counts
*people*; MRR counts *recurring entitlements*.

---

## Affiliate program

Members apply, admins approve, and commissions accrue per sale. Setup, the
attribution model and the admin controls: **[docs/AFFILIATE_PROGRAM.md](./AFFILIATE_PROGRAM.md)**.

---

## What each tab shows

**Overview** — total revenue as the hero figure, then eight stat tiles (revenue,
signups, leads, buyers, MRR, active members, signup→paid conversion, average
order value) each with a delta against the previous period of the same length.
Below: signups per day, revenue per day, the acquisition funnel, revenue split by
package, lead sources, and a merged activity feed. The date-range control at the
top scopes everything.

**Customers** — one row per human, joined across Supabase Auth, `members`,
`payments`, `leads` and `user_progress`. Someone appears here whether they signed
up, only left a lead, or only paid. Click a row for the full record plus actions:
grant 31 days, grant a year, or revoke access.

**Orders** — every payment with its package, amount, status, test/live mode and
Ziina intent id. **Record payment** logs a sale taken outside Ziina checkout
(bank transfer, invoice, or a sale made before payments were tracked) and
optionally grants access in the same step.

**Leads** — every form submission with phone, goal, source, workshop and ticket
number.

Every table and chart exports to CSV, and every chart has a table view.

---

## Security model

- `/admin` requires a Supabase session **and** an allowlisted email.
- Every `/api/admin` request re-verifies the access token against Supabase and
  re-checks the allowlist server-side. The client is never trusted.
- The service-role key lives only in the serverless function; the browser never
  sees it and never queries Supabase directly.
- A `viewer` role in `admin_users` gets read-only access — mutations are rejected.
- Mutations are written to `admin_audit_log` with the actor's email.
- `/admin` is disallowed in `robots.txt`.

---

## What now gets persisted (this was the real gap)

Before this, `payments` and `leads` were empty tables: checkout state lived in an
in-memory map that a serverless cold start wiped, and leads existed only inside
Resend emails. Three flows now write to the database:

| Flow | Writes |
|---|---|
| `POST /api/create-payment` | a `pending` payments row with the package and Ziina intent id |
| `POST /api/confirm-payment` | flips that row to `completed`, and creates it if the instance that started checkout is gone — so revenue is never silently lost |
| `POST /api/send-lead-email` | upserts the lead, counting repeat submissions |

`confirm-payment` also now uses the payments row as its idempotency guard rather
than an in-process `Set`, so a second confirmation from a different serverless
instance no longer sends a duplicate email.

Sales made **before** this shipped are not in the database — add them from
**Orders → Record payment**, or leave them out and treat the panel's revenue as
"from today forward".
