// Runs after `vite build`. Writes real HTML for every blog URL, so crawlers get the
// full article, the right <title>, canonical and schema without running JavaScript.
// Also adds the posts to sitemap.xml and writes rss.xml.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const SITE = "https://aifounderhub.com";
const dist = resolve("dist");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const vite = await createServer({
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
  logLevel: "error",
  // SSR only: no browser dep pre-bundling, and never touch a running dev server's cache.
  cacheDir: "node_modules/.vite-prerender",
  optimizeDeps: { noDiscovery: true, include: [] },
});
const { POSTS } = await vite.ssrLoadModule("/src/blog/posts.ts");
const { BlogIndex, BlogPost, BlogNotFound } = await vite.ssrLoadModule("/src/blog/BlogPages.tsx");
const { ROUTE_META } = await vite.ssrLoadModule("/src/lib/meta.ts");

const template = readFileSync(resolve(dist, "index.html"), "utf8");

// The built index.html with one page's title, canonical and meta tags. `image` is an absolute URL.
function withHead({ title, description, path, image = `${SITE}/og-cover.jpg`, type = "website", author = "AI Founder Hub", noindex = false }) {
  const url = `${SITE}${path}`;
  const setMeta = (html, attr, name, value) =>
    html.replace(new RegExp(`<meta\\s+${attr}="${name}"\\s+content="[^"]*"\\s*/?>`), () => `<meta ${attr}="${name}" content="${esc(value)}" />`);

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);

  for (const [attr, name, value] of [
    ["name", "description", description],
    ["name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large"],
    ["name", "author", author],
    ["property", "og:type", type],
    ["property", "og:url", url],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:image", image],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", image],
  ]) {
    html = setMeta(html, attr, name, value);
  }
  return html;
}

// Names a route as a page of the site, with its place under the homepage.
function routeSchema({ title, description, path, label }) {
  const url = `${SITE}${path}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${SITE}/#site` },
        publisher: { "@id": `${SITE}/#org` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: label ?? title, item: url },
        ],
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
}

function page({ element, image, extraHead = "", ...head }) {
  const rss = `<link rel="alternate" type="application/rss+xml" title="AI Founder Hub Blog" href="${SITE}/rss.xml" />`;
  return withHead({ ...head, author: "Zain Ul Abideen Baloch", image: image ? `${SITE}${image}` : undefined })
    // Blog pages carry their own schema in the rendered body.
    .replace(/<!-- Structured data -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, "")
    .replace("</head>", () => `    ${rss}\n    ${extraHead}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${renderToString(element)}</div>`);
}

function write(path, html) {
  const file = resolve(dist, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Index
const meta = ROUTE_META.blog;
write("blog/index.html", page({ element: createElement(BlogIndex), title: meta.title, description: meta.description, path: "/blog" }));

// Posts
for (const post of POSTS) {
  write(
    `blog/${post.slug}/index.html`,
    page({
      element: createElement(BlogPost, { post }),
      title: post.seoTitle,
      description: post.description,
      path: `/blog/${post.slug}`,
      image: post.cover,
      type: "article",
      extraHead: `<meta property="article:published_time" content="${post.date}" /><meta property="article:modified_time" content="${post.updated}" />`,
    }),
  );
}

// Real 404 for retired or mistyped blog URLs
write("404.html", page({ element: createElement(BlogNotFound), title: "Page not found | AI Founder Hub", description: "This page does not exist.", path: "/blog", noindex: true }));

// Every other route: its own head over an empty body, so raw HTML has the right title,
// canonical and robots tag while the app still boots client-side. A file only gets served
// if vercel.json rewrites to it, so a missing rewrite fails the build instead of silently
// falling back to the noindex fallback below.
const { rewrites } = JSON.parse(readFileSync(resolve("vercel.json"), "utf8"));
const routes = Object.values(ROUTE_META).filter((m) => m.path !== "/" && m.path !== "/blog");
for (const route of routes) {
  const file = `${route.path}/index.html`;
  if (!rewrites.some((r) => r.source === route.path && r.destination === file)) {
    throw new Error(`vercel.json needs a rewrite from ${route.path} to ${file}`);
  }
  const html = withHead(route);
  write(file.slice(1), route.noindex ? html : html.replace("</head>", () => `    ${routeSchema(route)}\n  </head>`));
}

// Unknown URLs still show the homepage, but noindexed and with no canonical, so they can't
// be indexed as duplicates of it. vercel.json's catch-all serves this file.
write("fallback.html", withHead({ ...ROUTE_META.home, noindex: true }).replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>/, ""));

// Sitemap
const newest = POSTS[0]?.updated ?? new Date().toISOString().slice(0, 10);
const entries = [
  `  <url>\n    <loc>${SITE}/blog</loc>\n    <lastmod>${newest}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  ...POSTS.map(
    (p) =>
      `  <url>\n    <loc>${SITE}/blog/${p.slug}</loc>\n    <lastmod>${p.updated}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${
        p.cover ? `\n    <image:image>\n      <image:loc>${SITE}${p.cover}</image:loc>\n    </image:image>` : ""
      }\n  </url>`,
  ),
];
const sitemapPath = resolve(dist, "sitemap.xml");
writeFileSync(sitemapPath, readFileSync(sitemapPath, "utf8").replace("</urlset>", `${entries.join("\n")}\n</urlset>`));

// RSS
const items = POSTS.map(
  (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid>${SITE}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T06:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.description)}</description>
    </item>`,
).join("\n");
writeFileSync(
  resolve(dist, "rss.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI Founder Hub Blog</title>
    <link>${SITE}/blog</link>
    <description>${esc(meta.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`,
);

await vite.close();
console.log(`Prerendered blog index + ${POSTS.length} posts, ${routes.length} route heads, 404, sitemap and RSS.`);
