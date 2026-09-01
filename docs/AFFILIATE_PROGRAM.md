# Affiliate program

Members share a link, and when someone signs up through it and buys, the sharer
earns a percentage of the sale. Hidden until a member applies; inert until an
admin approves.

---

## Turn it on

Paste **`supabase/migrations/0004_affiliate_program.sql`** into the Supabase SQL
editor. Additive and idempotent.

It also fixes an unrelated live bug it depends on: `PACKAGES['claude-master']`
declares `purpose: 'course'`, which the `payment_purpose` enum
(`booking|bootcamp|membership`) rejected — so **every Master Claude checkout was
silently failing to write a payments row**, in both the full and the fallback
payload. No payments row means no order in /admin and no commission to pay, so
the migration widens `payments.purpose` to text.

Two related bugs in `confirm-payment.js` are fixed in code:

- The package was hard-coded to `session-1on1` or `aaa-accelerator`, so a Claude
  purchase was confirmed as a RoadMap purchase — wrong entitlement, wrong
  revenue attribution, and it would have paid commission against the wrong
  product. It now reads the product code off the pending row.
- `settlePayment()` did not report which row it settled, so a commission had
  nothing to point at. It now returns the payment id.

---

## How attribution works

1. **Click.** A visitor lands on any page with `?ref=CODE`. The browser stores
   the code for 90 days and pings `/api/affiliate` (`track`). The parameter is
   stripped from the URL so the visitor does not reshare someone else's code.
2. **Sign-up.** The first time that person signs in, `useAuth` calls `bind`,
   which writes an `affiliate_referrals` row keyed on their email.
   **First touch wins** — a unique index on the email means a later affiliate
   cannot take over an existing referral, and the binding never expires once it
   exists.
3. **Purchase.** Every completed payment by a bound person creates one
   commission at the affiliate's **current** rate. A unique index on
   `payment_id` makes this idempotent, so a retried confirmation cannot pay
   twice.

Deliberate choices, all reversible:

| Decision | Behaviour |
|---|---|
| Recurring products | The RoadMap is $159/mo and **every renewal earns commission**, because the binding is permanent rather than first-purchase-only. If you want first-payment-only, add a check on `affiliate_referrals.first_purchase_at` in `recordCommission`. |
| Attribution window | 90 days from first click, until they have an account. Change `app_settings.affiliate_cookie_days` and `WINDOW_DAYS` in `src/lib/referral.ts`. |
| Self-referral | Blocked, both at bind and at commission time. |
| Rate changes | Applied to future sales only — existing commissions keep the rate they were earned at. |
| Payouts | **Money never moves through this system.** See below. |

---

## Payouts are manual, on purpose

No money moves through this app. The dashboard is a ledger of what an affiliate
has earned and what they can claim; you transfer it yourself and mark it off.

Each commission moves through three states:

| State | Affiliate sees | Meaning |
|---|---|---|
| `pending` | **Under review** | Earned, but you have not checked the referral yet. Not claimable. |
| `approved` | **Ready to claim** | You have verified it. This is the number they can ask you for. |
| `paid` | **Paid** | You sent the transfer and marked it off here. |
| `void` | **Not eligible** | Refunded, fraudulent, or otherwise rejected. Excluded from every total. |

The working loop in **/admin → Affiliates → Commissions**:

1. Review the rows sitting in **To review**.
2. Select them and hit **Approve for payout**. The affiliate's dashboard moves
   that money from *Under review* to *Ready to claim*.
3. Send the transfer using the payout details they saved on their dashboard
   (bank, PayPal, Wise, crypto — their choice, shown on their card in /admin).
4. Select the same rows and hit **Mark as paid**.

Nothing auto-approves and nothing auto-pays. The summary card at the top shows
**Ready to pay out** and how much is **still to review**, so the queue is
visible at a glance. Anything you reject becomes `void` and disappears from the
affiliate's totals.

---

## One code, several links

An approved affiliate gets **one** code. The product links are that same code on
different landing pages:

```
https://aifounderhub.com/?ref=ZAIN7K                        ← universal
https://aifounderhub.com/claude-master-in-7-days?ref=ZAIN7K ← $45 course
https://aifounderhub.com/progress?ref=ZAIN7K                ← $159/mo RoadMap
https://aifounderhub.com/#courses?ref=ZAIN7K                ← All Access
https://aifounderhub.com/#mentors?ref=ZAIN7K                ← 1:1 session
```

Because attribution is by code, not by link, sharing the Claude link and having
someone buy the RoadMap instead still pays out. The course link only decides
which page they land on first. Edit the list in `AFFILIATE_PRODUCTS`
(`api/_affiliate-lib.js`) to add a product.

---

## For members — dashboard → Affiliate

- **Not applied:** the pitch and an application form (name, payout method,
  details, how they will promote). Nothing else is visible.
- **Pending:** "under review". Their code is reserved but tracks nothing.
- **Approved:** total earned, rate, clicks / signups / purchases / sales volume,
  the copyable links, an earnings table, and their payout details.
- **Rejected or suspended:** a short notice plus the admin's note, if any.

Referred buyers' emails are **masked** (`jo••••@gmail.com`) — the affiliate gets
a handle, not a third party's contact details.

## For admins — /admin → Affiliates

- **Affiliates:** every applicant with clicks, signups, sales, earned and unpaid.
  Approve, reject, suspend, and set **each person's rate** inline. A summary card
  edits the programme-wide default for future applicants.
- **Commissions:** the full ledger. Select rows and mark them paid or void; the
  selected total is shown before you act.
- Both export to CSV. Every action is written to `admin_audit_log`.

---

## Security

- `track` is the only public action — it happens before anyone signs in, and it
  ignores unknown or unapproved codes.
- Every other action requires a Supabase session and is scoped to the caller's
  own email. There is no way to read another affiliate's numbers.
- Approve/reject/rate/payout actions require an admin, re-checked server-side.
- All four affiliate tables have RLS on with **no policies**, so only the
  service-role backend can touch them.
