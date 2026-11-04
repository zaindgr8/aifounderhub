# AI Founder Hub blog playbook

**Goal:** rank in Google for searches from people who could become students or clients.
**Rhythm:** one solid post a week beats daily thin posts. Don't publish news rewrites or copied video summaries.

## Publish a post

1. Copy `src/blog/posts/_template.md` to `src/blog/posts/your-keyword-slug.md`. The filename becomes the URL, so never change it after publishing.
2. Fill in the frontmatter and write the post. Remove `draft: true` when it's ready.
3. Run `npm run build` to check it, then push to `main`.

The build creates the page, schema, sitemap entry and RSS item automatically. A post with a future `date` stays hidden until the first build on or after that date.

Optional fields: `updated` (when you meaningfully refresh a post), `cover`, `coverAlt`, `featured: true` (the one large post on the blog index; keep it on only one post).

## Quality checklist

- [ ] One clear search query per post, with its keyword in the title, the first paragraph and one heading
- [ ] `seoTitle` under 60 characters, `description` under 160
- [ ] `tldr` answers the query directly in 2 or 3 sentences
- [ ] Something only we can say: our data, a real call, a client lesson, a screenshot
- [ ] At least 2 links to primary sources, and every number has a source
- [ ] At least 2 links to our other posts, and 1 to the course or free masterclass
- [ ] A "Frequently asked questions" section using `###` for each question
- [ ] No income promises. Label examples as examples.
- [ ] Prices and legal claims checked on the day of publishing, with the date stated

## The next 12 posts

Clustered so posts link to each other. Check real search volume in Google Search Console or Ahrefs before writing, and move up anything Search Console shows you already getting impressions for.

| # | Target search | Why | Links to |
|---|---|---|---|
| 1 | ai receptionist for dental clinics | Buyer intent, existing YouTube build | cost, agency guide |
| 2 | ai voice agent for real estate | Real demo calls and Vizz data | UAE rules, cost |
| 3 | how much to charge for ai automation | Agency-owner intent | agency guide, cost |
| 4 | how to build an ai voice agent with n8n | Tutorial, existing workflow | Retell vs Vapi |
| 5 | how to find clients for ai agency | Top pain point for course buyers | agency guide |
| 6 | ai receptionist dubai | Local, low competition | UAE rules |
| 7 | ai voice agent arabic | GCC gap, few good answers (test before publishing) | UAE rules |
| 8 | speed to lead statistics and instant callback | Links to the callback demo | real estate |
| 9 | retell ai tutorial | Tool intent, existing videos | Retell vs Vapi |
| 10 | n8n vs make for ai agencies | Comparison intent | n8n tutorial |
| 11 | ai voice agent script template | Linkable free resource | /progress#resources |
| 12 | ai voice agent vs ivr | Business-owner education | cost |

## After launch

1. **Submit `https://aifounderhub.com/sitemap.xml` in Google Search Console** and request indexing for `/blog` and each post.
2. **Each week:** check Search Console for queries with impressions but few clicks. Improve those titles and add those questions to the post.
3. **Each quarter:** re-check prices and rules in the cost, comparison and UAE posts, then set `updated`.
4. **Promote every post:** link from YouTube descriptions, LinkedIn and the WhatsApp group. Real links and clicks help a new blog more than volume.
