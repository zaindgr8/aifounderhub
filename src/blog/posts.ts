import { Marked } from "marked";

/* ————————————————————————————————————————————————————————————————
   Blog content layer. A post is one Markdown file in ./posts:
   add the file, push, and the build publishes it (page, sitemap, RSS).
   See docs/blog-playbook.md and posts/_template.md.
———————————————————————————————————————————————————————————————— */

export const BLOG_AUTHOR = {
  name: "Zain Ul Abideen Baloch",
  url: "https://aifounderhub.com/zain-ul-abideen-baloch",
  photo: "/me.svg",
  role: "Founder, AI Founder Hub · Founder & CEO, DevMate Solutions",
};

export interface Post {
  slug: string;
  title: string;
  /** <title> tag, under 60 characters. Falls back to the title. */
  seoTitle: string;
  /** Shown large at the top of the blog index. */
  featured: boolean;
  description: string;
  /** Answer-first summary shown above the article. */
  tldr: string;
  category: string;
  date: string;
  updated: string;
  cover?: string;
  coverAlt?: string;
  html: string;
  toc: { id: string; text: string }[];
  faqs: { q: string; a: string }[];
  readMinutes: number;
}

const files = import.meta.glob("./posts/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const stripMarkdown = (md: string) =>
  md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const marked = new Marked({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(inner)}">${inner}</h${depth}>\n`;
    },
    link({ href, tokens }) {
      const inner = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href) && !href.startsWith("https://aifounderhub.com");
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>`;
    },
    image({ href, text }) {
      return `<img src="${href}" alt="${text.replace(/"/g, "&quot;")}" loading="lazy" decoding="async" />`;
    },
  },
});

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Blog post is missing its --- frontmatter --- block");
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { data, body: match[2] };
}

function extractFaqs(body: string) {
  const section = body.match(/^## Frequently asked questions\s*\n([\s\S]*?)(?=^## |\s*$(?![\s\S]))/m);
  if (!section) return [];
  return section[1]
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [q, ...rest] = chunk.split("\n");
      return { q: q.trim(), a: stripMarkdown(rest.join(" ")) };
    });
}

function parsePost(path: string, raw: string): Post & { draft: boolean } {
  const { data, body } = parseFrontmatter(raw);
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  for (const key of ["title", "description", "tldr", "category", "date"]) {
    if (!data[key]) throw new Error(`Blog post "${slug}" is missing "${key}" in its frontmatter`);
  }
  const html = (marked.parse(body) as string)
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
  const toc = [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, ""),
  }));
  return {
    slug,
    title: data.title,
    seoTitle: data.seoTitle || data.title,
    featured: data.featured === "true",
    description: data.description,
    tldr: data.tldr,
    category: data.category,
    date: data.date,
    updated: data.updated || data.date,
    cover: data.cover,
    coverAlt: data.coverAlt,
    html,
    toc,
    faqs: extractFaqs(body),
    readMinutes: Math.max(1, Math.round(stripMarkdown(body).split(" ").length / 220)),
    draft: data.draft === "true",
  };
}

const today = new Date().toISOString().slice(0, 10);

/** Published posts, newest first. Drafts and future-dated posts stay hidden. */
export const POSTS: Post[] = Object.entries(files)
  .filter(([path]) => !path.split("/").pop()!.startsWith("_"))
  .map(([path, raw]) => parsePost(path, raw))
  .filter((p) => !p.draft && p.date <= today)
  .sort((a, b) => b.date.localeCompare(a.date) || b.updated.localeCompare(a.updated));

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
