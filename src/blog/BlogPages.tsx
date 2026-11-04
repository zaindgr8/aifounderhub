import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "../components/shared";
import { applyMeta } from "../lib/meta";
import { BLOG_AUTHOR, POSTS, formatDate, getPost, type Post } from "./posts";

// Everything here must render on the server too (scripts/prerender-blog.mjs),
// so no browser APIs outside effects and no opacity-0 entrance animations.

const SITE = "https://aifounderhub.com";
const COURSE = "/how-to-build-your-ai-agency";
const MASTERCLASS = "/freemasterclass";

function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const ORG = {
  "@type": "Organization",
  name: "AI Founder Hub",
  url: `${SITE}/`,
  logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
};

/* ————————————— shell ————————————— */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-void font-sans text-zinc-100">
      <header className="border-b border-edge/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="AI Founder Hub home">
            <LogoMark size={28} />
            <span className="font-display text-[16px] font-extrabold tracking-tight text-white">AI Founder Hub</span>
          </a>
          <nav className="flex items-center gap-5 text-[13.5px] font-medium">
            <a href="/blog" className="text-zinc-300 transition-colors hover:text-white">Blog</a>
            <a href={MASTERCLASS} className="hidden text-zinc-400 transition-colors hover:text-white sm:inline">Free masterclass</a>
            <a href={COURSE} className="rounded-full bg-volt px-4 py-2 text-[13px] font-semibold text-void transition-opacity hover:opacity-90">
              The course
            </a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-edge/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-[13px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© AI Founder Hub, Dubai</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/blog" className="hover:text-white">Blog</a>
            <a href={COURSE} className="hover:text-white">AI agency course</a>
            <a href={MASTERCLASS} className="hover:text-white">Free masterclass</a>
            <a href="/ai-community-dubai" className="hover:text-white">Dubai community</a>
            <a href="/rss.xml" className="hover:text-white">RSS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
      <span className="text-volt">{post.category}</span>
      <span className="mx-2 text-zinc-700">/</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span className="mx-2 text-zinc-700">/</span>
      {post.readMinutes} min read
    </p>
  );
}

function FreeClassCta() {
  return (
    <section className="mt-20 rounded-2xl border border-edge bg-panel/60 p-7 sm:p-10">
      <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
        See it built live, <span className="font-serif font-normal italic text-volt">for free.</span>
      </h2>
      <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-zinc-400">
        Every week we build a real AI system on screen and show how it gets sold. Want the full path to a first client? That's the course.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href={MASTERCLASS} className="inline-flex items-center justify-center gap-2 rounded-full bg-volt px-6 py-3 text-[14px] font-semibold text-void transition-opacity hover:opacity-90">
          Join the free masterclass <ArrowRight className="h-4 w-4" />
        </a>
        <a href={COURSE} className="inline-flex items-center justify-center gap-2 rounded-full border border-edge px-6 py-3 text-[14px] font-semibold text-zinc-200 transition-colors hover:border-zinc-500">
          See the AI agency course
        </a>
      </div>
    </section>
  );
}

/* ————————————— index ————————————— */

export function BlogIndex() {
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
  const rest = POSTS.filter((p) => p !== featured);
  return (
    <Shell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "AI Founder Hub Blog",
          url: `${SITE}/blog`,
          description: "Practical guides on AI voice agents and starting an AI automation agency.",
          publisher: ORG,
          blogPost: POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE}/blog/${p.slug}`,
            datePublished: p.date,
            dateModified: p.updated,
            author: { "@type": "Person", name: BLOG_AUTHOR.name, url: BLOG_AUTHOR.url },
          })),
        }}
      />
      <main className="mx-auto max-w-6xl px-5 md:px-8">
        <section className="pb-12 pt-16 sm:pt-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt">The blog</p>
          <h1 className="mt-5 max-w-4xl font-display text-[42px] font-extrabold leading-[1.02] tracking-tight text-white sm:text-[64px]">
            AI voice agents and AI agencies, <span className="font-serif font-normal italic text-volt">without the hype.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17.5px] leading-relaxed text-zinc-400">
            What it really costs, what works with real clients, and how to build a business on it. Written by people who sell these systems every week.
          </p>
        </section>

        {featured && (
          <section aria-label="Latest article" className="border-t border-edge py-10 sm:py-14">
            <a href={`/blog/${featured.slug}`} className="group grid items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className="min-w-0">
                <PostMeta post={featured} />
                <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white transition-colors group-hover:text-volt sm:text-[40px]">
                  {featured.title}
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-zinc-400">{featured.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-white">
                  Read the guide <ArrowRight className="h-4 w-4 text-volt transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              {featured.cover && (
                <img
                  src={featured.cover}
                  alt={featured.coverAlt ?? ""}
                  className="aspect-[16/10] w-full rounded-2xl border border-edge object-cover"
                  fetchPriority="high"
                />
              )}
            </a>
          </section>
        )}

        <section aria-label="All articles" className="pb-6">
          {rest.map((p) => (
            <article key={p.slug} className="border-t border-edge">
              <a href={`/blog/${p.slug}`} className="group grid gap-3 py-8 md:grid-cols-[1fr_2fr] md:gap-10">
                <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-zinc-500">
                  <span className="block text-volt">{p.category}</span>
                  <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readMinutes} min
                </p>
                <div>
                  <h2 className="font-display text-[23px] font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-volt">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-zinc-400">{p.description}</p>
                </div>
              </a>
            </article>
          ))}
        </section>

        <div className="pb-20">
          <FreeClassCta />
        </div>
      </main>
    </Shell>
  );
}

/* ————————————— article ————————————— */

export function BlogPost({ post }: { post: Post }) {
  const url = `${SITE}/blog/${post.slug}`;
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <Shell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: post.title,
              description: post.description,
              url,
              mainEntityOfPage: url,
              datePublished: post.date,
              dateModified: post.updated,
              image: `${SITE}${post.cover ?? "/og-cover.jpg"}`,
              articleSection: post.category,
              author: { "@type": "Person", name: BLOG_AUTHOR.name, url: BLOG_AUTHOR.url },
              publisher: ORG,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
            ...(post.faqs.length
              ? [
                  {
                    "@type": "FAQPage",
                    mainEntity: post.faqs.map((f) => ({
                      "@type": "Question",
                      name: f.q,
                      acceptedAnswer: { "@type": "Answer", text: f.a },
                    })),
                  },
                ]
              : []),
          ],
        }}
      />
      <main className="mx-auto max-w-6xl px-5 md:px-8">
        <article>
          <header className="mx-auto max-w-3xl pb-10 pt-10 sm:pt-14">
            <nav aria-label="Breadcrumb" className="text-[13px] text-zinc-500">
              <a href="/" className="hover:text-white">Home</a>
              <span className="mx-2 text-zinc-700">/</span>
              <a href="/blog" className="hover:text-white">Blog</a>
            </nav>
            <div className="mt-8">
              <PostMeta post={post} />
            </div>
            <h1 className="mt-4 font-display text-[36px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[52px]">
              {post.title}
            </h1>
            <p className="mt-5 text-[19px] leading-relaxed text-zinc-400">{post.description}</p>
            <div className="mt-7 flex items-center gap-3">
              <img src={BLOG_AUTHOR.photo} alt={BLOG_AUTHOR.name} width={40} height={40} className="h-10 w-10 rounded-full border border-edge bg-panel object-cover" />
              <div className="text-[13.5px] leading-snug">
                <a href={BLOG_AUTHOR.url} className="font-semibold text-white hover:text-volt">{BLOG_AUTHOR.name}</a>
                {post.updated !== post.date && (
                  <p className="text-zinc-500">
                    Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                  </p>
                )}
                {post.updated === post.date && <p className="text-zinc-500">{BLOG_AUTHOR.role.split(" · ")[0]}</p>}
              </div>
            </div>
          </header>

          {post.cover && (
            <img
              src={post.cover}
              alt={post.coverAlt ?? ""}
              className="mx-auto aspect-[16/8] w-full max-w-5xl rounded-2xl border border-edge object-cover"
              fetchPriority="high"
            />
          )}

          <div className="relative mx-auto grid max-w-5xl gap-10 pt-10 lg:grid-cols-[1fr_200px] lg:gap-14">
            <div className="min-w-0 max-w-3xl">
              <aside className="rounded-2xl border border-volt/25 bg-volt/[0.05] p-6">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-volt">Short answer</p>
                <p className="mt-2.5 text-[16.5px] leading-relaxed text-white">{post.tldr}</p>
              </aside>
              <div className="article-body mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>

            {post.toc.length > 2 && (
              <nav aria-label="On this page" className="hidden lg:block">
                <div className="sticky top-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">On this page</p>
                  <ul className="mt-3 space-y-2.5 border-l border-edge pl-4 text-[13px] leading-snug">
                    {post.toc.map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="text-zinc-400 transition-colors hover:text-white">{t.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            )}
          </div>
        </article>

        <div className="mx-auto max-w-3xl lg:max-w-5xl">
          <section aria-label="About the author" className="mt-16 flex max-w-3xl gap-4 border-t border-edge pt-8">
            <img src={BLOG_AUTHOR.photo} alt="" width={56} height={56} className="h-14 w-14 flex-shrink-0 rounded-full border border-edge bg-panel object-cover" />
            <div>
              <p className="font-display text-[16px] font-bold text-white">
                <a href={BLOG_AUTHOR.url} className="hover:text-volt">{BLOG_AUTHOR.name}</a>
              </p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-zinc-400">
                {BLOG_AUTHOR.role}. He has worked with 40+ brands since 2019, and his team builds and sells AI voice agents to real businesses.
              </p>
            </div>
          </section>

          <FreeClassCta />

          {related.length > 0 && (
            <section className="pb-20 pt-16">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Keep reading</h2>
              <div className="mt-2">
                {related.map((p) => (
                  <a key={p.slug} href={`/blog/${p.slug}`} className="group block border-b border-edge py-5">
                    <h3 className="font-display text-[20px] font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-volt">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">{p.category} / {p.readMinutes} min read</p>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </Shell>
  );
}

/* ————————————— 404 ————————————— */

export function BlogNotFound() {
  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-5 py-28 text-center md:px-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">We can't find that page</h1>
        <p className="mt-4 text-zinc-400">It may have moved. The latest guides are on the blog.</p>
        <a href="/blog" className="mt-8 inline-flex items-center gap-2 rounded-full bg-volt px-6 py-3 text-[14px] font-semibold text-void">
          Go to the blog <ArrowRight className="h-4 w-4" />
        </a>
      </main>
    </Shell>
  );
}

/* ————————————— client route ————————————— */

export function BlogRoute() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  const slug = path.startsWith("/blog/") ? path.slice("/blog/".length) : null;
  const post = slug ? getPost(slug) : undefined;

  useEffect(() => {
    if (post) {
      applyMeta({ title: post.seoTitle, description: post.description, path: `/blog/${post.slug}`, image: post.cover ? `${SITE}${post.cover}` : undefined });
    } else if (slug) {
      applyMeta({ title: "Page not found | AI Founder Hub", description: "This page does not exist.", path: "/blog", noindex: true });
    }
  }, [post, slug]);

  if (!slug) return <BlogIndex />;
  return post ? <BlogPost post={post} /> : <BlogNotFound />;
}
