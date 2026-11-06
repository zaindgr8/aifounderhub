---
title: 30 Claude Skills That Run Your Business — Cold Email, Funnels, Ads, Social, Courses and Video
seoTitle: 30 Claude Skills for Agencies, Coaches and Creators
description: Six ranked lists of Claude skills — 30 in total — for cold email, sales funnels, ads, social content, courses and video editing, with a plain-English install guide.
tldr: Claude skills are add-ons that teach Claude Code (and Codex) how to do one job well. Keeran AI ranked the most-installed skills into six lists of five: cold email, sales funnels, ads, social, courses and video. Most are free; a few need a paid account. Install one with a single terminal command, or paste the list page's link into Claude Code and ask it to install them.
category: AI agency guides
date: 2026-11-06
---

You do not need a bigger team to do more marketing. You need your AI to know how to do one job properly, then another, then another.

That is what Claude skills are. Small add-ons that teach Claude Code — and Codex — how to do one specific job well: find leads, write a cold email, plan a funnel, cut a video. [Keeran AI ranked the most-installed skills](https://keeranai.com/skills) into six short lists of five, ranked by installs on skills.sh on 3 November 2026. Thirty skills in total.

This guide covers all six lists, in our own words, plus how to install them. Nothing here is copied from the source pages. Every skill name and install command is as listed; what each one does is explained plainly, so you can decide what to install first.

## What is a Claude skill, actually?

A skill is a markdown file that gives an AI agent specialised knowledge and a workflow for one task. When you add it to your project, your agent recognises when you are working on that kind of task and applies the right frameworks and best practices.

Think of it like hiring. A general assistant can do a bit of everything, badly. A skill is a specialist you bring in for one job. You would not ask your video editor to write your cold emails. Do not ask your AI to do it without the right skill either.

Most of the skills below come from one library: [Marketing Skills for AI Agents](https://github.com/coreyhaines31/marketingskills) by Corey Haines. It is free, MIT-licensed, and had 58,800 stars on GitHub when we checked. It works with Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the Agent Skills spec. Its skills share one foundation — a `product-marketing` skill that every other skill reads first, so the agent understands your product, audience and positioning before it does anything.

The other skills come from smaller libraries — Autonnel, Higgsfield, HeyGen, and a few independent builders. A few of those need a paid account to work. We say so where it applies.

## How to install a skill

There are two ways. The terminal way is the direct one.

1. **Open your terminal.** On a Mac, that is the Terminal app. You need Node.js installed for the `npx` command to work.
2. **Paste one install command.** Every skill installs with the same shape of command:
   ```
   npx skills add https://github.com/coreyhaines31/marketingskills --skill cold-email
   ```
   The first part is the library. The last part, after `--skill`, is the skill's name. Swap it for any other skill in this guide.
3. **Ask Claude Code to use it.** Open Claude Code in your project and ask for the job in plain words — "find me 20 leads" or "write a follow-up sequence". The skill loads itself when the task matches.

The easier way, if you do not like the terminal: **paste the list page's link into Claude Code and ask it to install them.** Each Keeran list page says exactly that. Claude Code reads the page and installs all five skills from it.

One warning before you install anything: a skill is code and instructions from GitHub. Install from libraries you trust, read what a skill does before you add it, and never paste credentials into a skill's setup unless you understand where they go. Free and open does not mean unreviewed.

## 1. Get clients with cold email

For agency owners: find leads, write the emails, and follow up until they book. All five are from the marketingskills library — free.

| SKILL | WHAT IT DOES |
|---|---|
| prospecting | Find the right people to email in the first place. |
| lead-magnets | Build something worth replying for — a lead magnet that earns the inbox. |
| cold-email | Write and run B2B cold outbound that gets replies: the emails, the follow-ups, the sending setup, LinkedIn included. |
| email-sequence | The follow-up sequence — the emails that keep going until someone books. |
| sales-enablement | The sales side of the stack: turn replies into meetings and revenue. |

Install all five:
```
npx skills add https://github.com/coreyhaines31/marketingskills --skill cold-email
npx skills add https://github.com/coreyhaines31/marketingskills --skill sales-enablement
npx skills add https://github.com/coreyhaines31/marketingskills --skill lead-magnets
npx skills add https://github.com/coreyhaines31/marketingskills --skill prospecting
npx skills add https://github.com/coreyhaines31/marketingskills --skill email-sequence
```

This is the list that matters most if you run an agency. Cold email only works when every step is done well — the list, the offer, the email, the follow-up. One skill per step is the whole point. Our own rule still applies on top of all of it: every email must be personalised to that specific business, or it is a blast, not outreach. A skill writes the email. You are still responsible for knowing who it goes to.

## 2. Build your sales funnel

For coaches and info products: plan the offer, pick the builder, and fix the page. Four skills from Autonnel, one from marketingskills.

| SKILL | WHAT IT DOES |
|---|---|
| sales-funnel-blueprint | Plan the funnel before you build it — the stages, the offer at each step, the order. |
| funnel-platform-picker | Pick the builder for your funnel instead of guessing. |
| landing-page-conversion-audit | Check a landing page and find what is losing conversions. |
| self-hosted-funnel-launch | Launch a funnel you host yourself. |
| offers | Design the offer itself — the thing you actually sell. |

Install all five:
```
npx skills add https://github.com/autonnel/autonnel-skills --skill landing-page-conversion-audit
npx skills add https://github.com/autonnel/autonnel-skills --skill sales-funnel-blueprint
npx skills add https://github.com/autonnel/autonnel-skills --skill funnel-platform-picker
npx skills add https://github.com/autonnel/autonnel-skills --skill self-hosted-funnel-launch
npx skills add https://github.com/coreyhaines31/marketingskills --skill offers
```

Start with `offers` and `sales-funnel-blueprint`. A funnel with a weak offer is a fast way to send traffic nowhere. Fix the offer, plan the funnel, then audit the page.

## 3. Make your ads for you

For ecom brands: scripts, campaigns, copy and product shots, without a studio.

| SKILL | WHAT IT DOES |
|---|---|
| higgsfield-product-photoshoot | Product photos without a photoshoot. Needs a Higgsfield account. |
| higgsfield-marketplace-cards | Product cards for marketplaces. Needs a Higgsfield account. |
| ad-creative | Generate and improve ad creative — headlines, descriptions, primary text. |
| paid-ads | Help with paid campaigns across Google, Meta, X and more. |
| ugc-ad-scripts | Scripts for user-generated-content style ads. |

Install all five:
```
npx skills add https://github.com/higgsfield-ai/skills --skill higgsfield-product-photoshoot
npx skills add https://github.com/higgsfield-ai/skills --skill higgsfield-marketplace-cards
npx skills add https://github.com/coreyhaines31/marketingskills --skill ad-creative
npx skills add https://github.com/coreyhaines31/marketingskills --skill paid-ads
npx skills add https://github.com/mbfinotti/advertising-skills --skill ugc-ad-scripts
```

The honest caveat: the two Higgsfield skills run on Higgsfield, so you need a Higgsfield account for them to work. Plans start at $19 a month. The other three are free. Do not install the paid ones and then wonder why nothing happens — check the account first.

## 4. Post on social for you

For creators: what to post, how to write it, and the thumbnail to go with it.

| SKILL | WHAT IT DOES |
|---|---|
| content-strategy | Plan what to post and what topics to cover. |
| copy-editing | Edit and improve copy you already wrote. |
| higgsfield-youtube-thumbnail | YouTube thumbnails. Needs a Higgsfield account. |
| social-content | The social posts themselves — written for the platform. |
| last30days | Look at your last 30 days and learn from what worked. |

Install all five:
```
npx skills add https://github.com/coreyhaines31/marketingskills --skill content-strategy
npx skills add https://github.com/coreyhaines31/marketingskills --skill copy-editing
npx skills add https://github.com/higgsfield-ai/skills --skill higgsfield-youtube-thumbnail
npx skills add https://github.com/coreyhaines31/marketingskills --skill social-content
npx skills add https://github.com/mvanhorn/last30days-skill --skill last30days
```

The order matters: strategy first, then the writing, then the thumbnail. Most creators do it backwards — they make a thumbnail for a video nobody asked for. `last30days` is the quiet gem here: it looks at what you actually posted and what actually worked, instead of guessing.

## 5. Sell your course or coaching

For coaches and course creators: the offer, the price, the launch and the sales page.

| SKILL | WHAT IT DOES |
|---|---|
| copywriting | Write or rewrite the sales copy — the page, the emails, the pitch. |
| customer-research | Research your customers before you write a word. |
| pricing | Price the offer instead of guessing. |
| launch | Plan the launch — the announcement, the sequence, the timing. |
| 100m-offers | The offer framework skill from the founder-playbook library. |

Install all five:
```
npx skills add https://github.com/coreyhaines31/marketingskills --skill copywriting
npx skills add https://github.com/coreyhaines31/marketingskills --skill customer-research
npx skills add https://github.com/coreyhaines31/marketingskills --skill pricing
npx skills add https://github.com/coreyhaines31/marketingskills --skill launch
npx skills add https://github.com/getagentseal/founder-playbook --skill 100m-offers
```

Do these in order: research, offer, price, copy, launch. Most failed launches are not a copy problem. They are a research problem — the course was built for people who never asked for it.

## 6. Edit your videos for you

For creators: cut your talking-head videos, caption them, or skip the camera.

| SKILL | WHAT IT DOES |
|---|---|
| faceless-explainer | Explainer videos without filming yourself. |
| embedded-captions | Captions burned into the video. |
| talking-head-recut | Re-cut a talking-head video into something tighter. |
| higgsfield-soul-id | A Higgsfield video skill. Needs a Higgsfield account. |
| higgsfield-video-explainer | A Higgsfield video explainer skill. Needs a Higgsfield account. |

Install all five:
```
npx skills add https://github.com/heygen-com/hyperframes --skill faceless-explainer
npx skills add https://github.com/heygen-com/hyperframes --skill embedded-captions
npx skills add https://github.com/heygen-com/hyperframes --skill talking-head-recut
npx skills add https://github.com/higgsfield-ai/skills --skill higgsfield-soul-id
npx skills add https://github.com/higgsfield-ai/skills --skill higgsfield-video-explainer
```

The first three run on HeyGen's Hyperframes. The last two run on Higgsfield and need a Higgsfield account, plans from $19 a month. If you post video every day, `talking-head-recut` and `embedded-captions` are the two that save the most hours — cutting and captioning is where most creators lose their week.

## Which five should you install first?

If you run an agency, ours would be: `prospecting`, `cold-email`, `email-sequence`, `offers`, and `copywriting`. Leads, emails, follow-ups, the offer, and the words to sell it. That is a business.

If you are a coach, swap in `pricing` and `launch`. If you are a creator, swap in `content-strategy` and `talking-head-recut`.

Do not install all thirty at once. Install five, use them for a week, and see which ones actually change your output. A skill you never invoke is clutter. Five you use every day are a team.

## What to try today

1. **Install one skill, not thirty.** Pick `cold-email` if you sell to businesses, `content-strategy` if you are a creator, `offers` if your offer is unclear. One command, one job.
2. **Give it a real job.** Not "test this skill". A real lead list, a real page, a real video. Judge it on whether the work got better or faster.
3. **Check the result before you send it.** A skill writes the draft. You are still the one who sends it to a real person. Read it, fix what is wrong, and only then hit send.

## Frequently asked questions

### What is a Claude skill?

An add-on that teaches Claude Code (and Codex) how to do one job well. It is a markdown file with specialised knowledge and a workflow. When your task matches the skill, the agent loads it and follows it.

### Are Claude skills free?

Most of the ones in this guide are free — the marketingskills library is MIT-licensed, and the Autonnel, HeyGen and independent skills listed here cost nothing to install. The exception is skills that run on a paid platform: Higgsfield skills need a Higgsfield account, with plans from $19 a month.

### Do these skills work with anything besides Claude Code?

The marketingskills library works with Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the Agent Skills spec. Other libraries vary — check the skill's own page before installing.

### How do I install a skill?

Paste one command in your terminal: `npx skills add <library-url> --skill <skill-name>`. Or paste the list page's link into Claude Code and ask it to install them. Full commands for all six lists are in this guide.

### Which skill should I install first?

If you sell to businesses, start with `cold-email` and `prospecting`. If you sell a course, start with `customer-research` and `offers`. If you create content, start with `content-strategy`. One skill, used daily, beats thirty you never open.
