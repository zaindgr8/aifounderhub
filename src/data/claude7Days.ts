/* ————————————————————————————————————————————————————————————————
   CLAUDE MASTER IN 7 DAYS — game content
   Source: AI Founder Hub Operator Field Guide, Edition 2.0
   Commands verified against Claude Code 2.1.x
———————————————————————————————————————————————————————————————— */

export interface CodeBlock {
  label?: string;
  lang: "bash" | "md" | "json" | "text" | "yaml";
  code: string;
}

export interface Callout {
  kind: "edge" | "trap" | "myth";
  title: string;
  body: string;
}

export interface Drill {
  id: string;
  xp: number;
  title: string;
  body: string;
  blocks?: CodeBlock[];
  table?: { head: string[]; rows: string[][] };
  callout?: Callout;
}

export interface Day {
  id: number;
  code: string;
  title: string;
  tagline: string;
  time: string;
  concept: { heading: string; body: string[] };
  drills: Drill[];
  boss: { intro: string; checks: string[]; xp: number };
  side: { text: string; xp: number };
  founder: string;
  badge: { name: string; desc: string };
  rankAfter: string;
}

/* ——— ranks ——— */
export const RANKS = [
  { lvl: 0, name: "Civilian", min: 0, note: "you prompt, you pray" },
  { lvl: 1, name: "Recruit", min: 100, note: "" },
  { lvl: 2, name: "Technician", min: 225, note: "" },
  { lvl: 3, name: "Operator", min: 350, note: "" },
  { lvl: 4, name: "Foreman", min: 500, note: "" },
  { lvl: 5, name: "Commander", min: 675, note: "" },
  { lvl: 6, name: "Architect", min: 850, note: "" },
  { lvl: 7, name: "Chief of Staff", min: 1100, note: "certified" },
];

export const MAX_XP = 1250;

/* ——— myth cards (tap to reveal) ——— */
export const MYTHS: { stale: string; truth: string }[] = [
  {
    stale: "npm install is how you install it, Node 18+",
    truth:
      "The native installer is now the recommended path and needs no Node.js at all. If you do use npm, it requires Node.js 22+, not 18.",
  },
  {
    stale: '"Type /plan to enter Plan Mode"',
    truth:
      "Plan mode is a permission mode you cycle to with Shift+Tab. If you don't know about Shift+Tab, you don't know the tool.",
  },
  {
    stale: "Skills live in .claude/skills/name.md",
    truth:
      "A Skill is a directory: .claude/skills/name/SKILL.md. Flat .md files in .claude/commands/ still work as legacy slash commands, but they are not Skills and can't bundle scripts or resources.",
  },
  {
    stale: '"Create a pre-commit hook in .claude/hooks/"',
    truth:
      "Hooks are configured in settings.json under a \"hooks\" key, and there is no pre-commit event. The events are PreToolUse, PostToolUse, UserPromptSubmit, Stop and friends. To gate a commit you match PreToolUse on Bash(git commit*).",
  },
  {
    stale: '"Use Desktop Preview to let Claude see your app"',
    truth:
      "There is no such feature. The three real ways are pasted screenshots, the Chrome DevTools MCP, and the Claude in Chrome extension (--chrome). Day 4 covers all three.",
  },
  {
    stale: "--dangerously-skip-permissions is how power users work",
    truth:
      "There is now a proper Auto mode — classifier-backed, with a circuit breaker that pauses after repeated blocks. Use it. The dangerous flag is for sandboxes only.",
  },
  {
    stale: '"Just /clear if it goes wrong"',
    truth:
      "Claude Code has automatic checkpointing. /rewind (or double-Esc on an empty prompt) rolls back code, conversation, or both. Day 1 covers the one big limitation that will bite you.",
  },
  {
    stale: '"Put everything about your project in CLAUDE.md"',
    truth:
      "A bloated CLAUDE.md measurably reduces rule adherence and eats context on every single turn. Keep it lean and push depth into path-scoped rules.",
  },
  {
    stale: '"Run /agents to open the subagent creation wizard"',
    truth:
      "Recent versions removed the interactive creation wizard. You write the agent file yourself in .claude/agents/ — or, better, ask Claude to write it for you.",
  },
];

/* ——— Day 0 ——— */
export const DAY_ZERO = {
  title: "Boot Camp",
  tagline:
    "Twenty minutes. Get the tool installed properly, on the right plan, with the right expectations. Skip this and every later day breaks in a way that's hard to diagnose.",
  plans: [
    ["Pro", "$20/mo", "The minimum. Fine for Days 1–5. You will feel the limits on Day 6."],
    ["Max 5×", "$100/mo", "The sweet spot if you're doing this seriously. Comfortable through all seven days."],
    ["Max 20×", "$200/mo", "For people running fleets of agents daily. Overkill for week one."],
    ["API key", "pay per token", "No session caps — you pay for what you burn. Best for headless work on Day 7."],
  ],
  blocks: [
    {
      label: "macOS / Linux / WSL — native installer, no Node.js required",
      lang: "bash" as const,
      code: "curl -fsSL https://claude.ai/install.sh | bash",
    },
    {
      label: "Windows (PowerShell)",
      lang: "bash" as const,
      code: "irm https://claude.ai/install.ps1 | iex",
    },
    {
      label: "Package managers",
      lang: "bash" as const,
      code: "brew install --cask claude-code       # macOS\nwinget install Anthropic.ClaudeCode   # Windows",
    },
    {
      label: "npm — fallback only, requires Node.js 22+",
      lang: "bash" as const,
      code: "node -v                                # must be v22 or higher\nnpm install -g @anthropic-ai/claude-code",
    },
    {
      label: "Verify and launch",
      lang: "bash" as const,
      code: "cd ~/your-real-project\nclaude\n\n# inside the session:\n/status     # version, model, auth, working directory\n/doctor     # diagnoses your install, and offers to fix what it finds\n/usage      # where you stand against your plan limits",
    },
  ],
  checks: [
    "claude launches inside a real project you care about",
    "/status shows you're authenticated on a paid plan",
    "/doctor reports no problems",
    "That project is a git repository with everything committed — git status is clean",
  ],
};

/* ——— the seven days ——— */
export const DAYS: Day[] = [
  /* ————————————————— DAY 1 ————————————————— */
  {
    id: 1,
    code: "MISSION 01",
    title: "The Handshake",
    tagline:
      "Learn the one loop that separates people who get clean code from people who get chaos — and the safety net that means you can never lose an afternoon again.",
    time: "60–75 min",
    rankAfter: "Recruit",
    badge: {
      name: "First Contact",
      desc: "Shipped a real commit through the full four-phase loop without a single blind edit.",
    },
    concept: {
      heading: "Four phases, always in order",
      body: [
        "Almost every bad Claude Code session has the same shape — the model started writing before it finished reading. It guessed at your file structure, invented a helper that already exists three folders over, and imported a package you don't have.",
        "The fix is a loop that never changes: Explore, Plan, Code, Commit. Each phase has a job, and each has something that must not happen.",
      ],
    },
    drills: [
      {
        id: "d1_modes",
        xp: 15,
        title: "Learn the modes — the tool's hidden gear stick",
        body:
          "Claude Code runs in permission modes. Press Shift+Tab in the terminal to cycle between them and watch the indicator change at the bottom of your screen. This is the single most useful key in the tool.",
        table: {
          head: ["Mode", "What it does", "Use it when"],
          rows: [
            ["Default / Manual", "Asks before each meaningful action", "Anything unfamiliar or risky"],
            ["Accept Edits ⏵⏵", "File edits go through; commands still prompt", "A well-scoped ticket you trust"],
            ["Plan ⏸", "Read-only. It can explore and propose, but physically cannot edit", "The start of every non-trivial task"],
            ["Auto", "Runs autonomously behind a safety classifier, with a circuit breaker that pauses after repeated blocks", "Long, well-defined runs"],
          ],
        },
        callout: {
          kind: "trap",
          title: "Windows gotcha",
          body:
            "On some Windows terminals, Shift+Tab only toggles between Manual and Accept Edits and skips Plan mode entirely. Use Alt+M instead, or launch with claude --permission-mode plan. In VS Code, use the mode indicator at the bottom of the panel.",
        },
      },
      {
        id: "d1_loop",
        xp: 15,
        title: "Run the loop, for real",
        body:
          "Pick a small change you actually want in your project. Not a hello-world — something like \"add a CSV export button to the leads table\" or \"add rate limiting to the signup endpoint.\" Then run these four prompts in order, one phase at a time.",
        blocks: [
          {
            label: "Phase 1 — Explore (Shift+Tab to Plan mode first)",
            lang: "text",
            code:
              "Read the files that handle [the leads table / the signup endpoint].\nTrace how data flows from the API into the component.\nDo NOT write or modify anything.\n\nThen tell me:\n1. Which files own this behaviour today\n2. The existing patterns and conventions I should stay consistent with\n3. Anything that already exists which I might be about to duplicate\n4. What you are uncertain about",
          },
          {
            label: "Phase 2 — Plan",
            lang: "text",
            code:
              "Good. Now think harder and produce an implementation plan.\n\nInclude:\n1. Exact files to modify, and exact files to create\n2. The step-by-step logic, in order\n3. Edge cases and failure modes, especially around [auth / validation / empty states]\n4. How we will verify it works — the specific command to run\n5. Any question you need answered before you write a line\n\nDo not implement yet.",
          },
          {
            label: "Phase 3 — Code",
            lang: "text",
            code:
              "The plan is approved, with one change: [your correction].\n\nImplement steps 1 and 2 only. Stop there and show me the diff.\nDo not touch any file outside the ones listed in the plan.",
          },
          {
            label: "Phase 4 — Commit",
            lang: "text",
            code:
              "Run the verification command from the plan and paste the real output.\nIf it fails, fix it and run it again — do not summarise, show me the output.\n\nThen stage only the files from the plan and write a commit message\nin the style of our recent history (check git log --oneline -10).",
          },
        ],
        callout: {
          kind: "edge",
          title: "The thinking dial",
          body:
            'The words "think", "think harder" and "ultrathink" in your prompt raise how much reasoning effort Claude spends before answering. Use them on planning and debugging, not on renaming a variable — deeper thinking costs tokens and time. Press Ctrl+O to watch the reasoning as it happens.',
        },
      },
      {
        id: "d1_rewind",
        xp: 15,
        title: "Your safety net — checkpoints and /rewind",
        body:
          "Claude Code automatically snapshots your files before it edits them. Type /rewind, or press Esc twice with an empty prompt box, then choose Restore code, Restore conversation, or both. There's also \"summarise up to here\" — compress the conversation without undoing any work. Go and use it once, deliberately, on purpose.",
        callout: {
          kind: "trap",
          title: "The limitation that will bite you",
          body:
            "Checkpointing only tracks changes made through Claude's file editing tools. It does not capture files changed by bash commands (rm, mv, a migration script), and it does not capture your own manual edits in your editor. /rewind is an undo button, not a backup system. Git is still your backup system — commit at every green checkpoint.",
        },
      },
      {
        id: "d1_keys",
        xp: 15,
        title: "The keys that make you fast",
        body: "Learn these nine. They are the difference between typing at Claude and operating it.",
        table: {
          head: ["Key", "What it does"],
          rows: [
            ["Shift+Tab", "Cycle permission modes — your most-used key, by far"],
            ["Esc", "Interrupt immediately. Use it the moment you see it going wrong — don't wait politely"],
            ["Esc Esc", "Open the rewind menu (only when the input box is empty)"],
            ["@", "File path autocomplete — @src/api/leads.ts beats describing a file in words"],
            ["#", "Write the line straight into project memory. The fastest way to teach it a rule"],
            ["!", "Run a bash command directly, without Claude interpreting it"],
            ["Ctrl+O", "Toggle verbose / thinking view"],
            ["Ctrl+G", "Open the current plan in your editor"],
            ["Ctrl+R", "Search your command history"],
          ],
        },
      },
    ],
    boss: {
      intro: "Ship one real commit, through all four phases, with zero blind edits.",
      xp: 40,
      checks: [
        "The session started in Plan mode and produced a written plan before any edit",
        "You rejected or corrected at least one thing in that plan",
        "Claude ran the verification command and pasted actual output — not a summary",
        "The commit exists in git log and touches only the files the plan named",
        "You used /rewind at least once, deliberately, just to see it work",
      ],
    },
    side: {
      xp: 30,
      text:
        'Do the whole loop again on a second task, but this time deliberately give a vague prompt ("make the leads page better") and watch what happens. Then /rewind it all away. You need to feel the failure mode once so you recognise it in the wild for the rest of your career.',
    },
    founder:
      "You don't need a codebase. Make a folder, put twenty real files in it — invoices, contracts, exported CSVs, meeting notes — and run claude there. Then run the same four-phase loop: Explore (\"Read every file. Change nothing. Tell me what's here.\") → Plan (\"Propose a renaming convention and folder structure. Show me before/after for five files.\") → Code (\"Apply it to those five.\") → Verify (\"List the folder and show me the result.\"). Claude Code is the best file-and-data tool you own. Most founders never find this out.",
  },

  /* ————————————————— DAY 2 ————————————————— */
  {
    id: 2,
    code: "MISSION 02",
    title: "The Repo Brain",
    tagline:
      "Stop explaining your stack, your conventions and your business every single morning. Today you write the onboarding manual once, and it persists forever.",
    time: "60–90 min",
    rankAfter: "Technician",
    badge: {
      name: "Brain Surgeon",
      desc: "Built a repo memory that passes the cold-start test in a fresh session.",
    },
    concept: {
      heading: "A good CLAUDE.md is short, opinionated, and full of things Claude could not work out on its own",
      body: [
        "You wouldn't re-explain the company to a new hire every morning. You'd hand them an onboarding document. In Claude Code that document is CLAUDE.md, and it is loaded into context on every single turn.",
        "Which is exactly why the naive version of this advice is wrong. \"Put everything in CLAUDE.md\" is how people end up with an 800-line file that eats their context window on every message and — counter-intuitively — makes Claude worse at following rules, because the important ones are buried under trivia.",
      ],
    },
    drills: [
      {
        id: "d2_hierarchy",
        xp: 15,
        title: "Learn the memory hierarchy",
        body:
          "Claude assembles its memory from several layers at once. Knowing which layer to write to is half the skill. Files above your working directory load in full at launch; child-directory files load lazily. You can pull in other markdown with @path/to/file.md — imports resolve recursively.",
        table: {
          head: ["Location", "Scope", "Put this here"],
          rows: [
            ["~/.claude/CLAUDE.md", "You, everywhere", 'Personal style: "always use pnpm", "never comment obvious code"'],
            ["./CLAUDE.md", "This project, whole team", "Stack, architecture, conventions, operating rules. Commit this."],
            [".claude/rules/*.md", "Only matching files", "Deep rules that load only when working in that area"],
            ["subdir/CLAUDE.md", "That subdirectory", "Loads on demand when Claude reads files there. Great for monorepos."],
            ["Auto memory", "Claude's own notes", "Written by Claude as it learns your repo. Browse and edit with /memory."],
          ],
        },
      },
      {
        id: "d2_init",
        xp: 15,
        title: "Generate, then ruthlessly cut",
        body:
          "Run /init. This scaffolds a starter CLAUDE.md by reading your repo. It's a starting point, not a deliverable — it will be too long and too descriptive. Your job now is to delete most of it and replace it with judgement.",
        blocks: [{ label: "In your session", lang: "bash", code: "/init" }],
        callout: {
          kind: "edge",
          title: "The deletion test",
          body:
            'For every line ask: "Could Claude work this out by reading the code?" If yes, delete it. "This project uses React" is visible in package.json. "We never use React Context for server state — we tried it and it caused a cascade of bugs; use TanStack Query" is not, and it\'s worth ten of the first kind of line. Document the why, the scars, and the rules. Never the what.',
        },
      },
      {
        id: "d2_write",
        xp: 15,
        title: "Write the real thing",
        body:
          "Target under 200 lines. For reference, Anthropic's own internal CLAUDE.md files run around 2,500 tokens — roughly two pages. Here's a template that earns its place.",
        blocks: [
          {
            label: "CLAUDE.md",
            lang: "md",
            code:
              "# Project Memory & Operating Rules\n\n## What this is\n- Product: Missed-lead responder for med spas\n- Who pays: the spa owner. What they care about: speed to lead, zero friction.\n- What breaks trust: dropped leads, robotic-sounding replies.\n\n## Stack\n- Next.js 15 (App Router), TypeScript strict, Tailwind\n- Supabase (Postgres) + Prisma - Vitest + RTL\n- Deployed on Vercel. Env vars live in Vercel, never in the repo.\n\n## Hard rules\n1. Never edit more than 3 files without stopping to show me a diff.\n2. Read the existing pattern before introducing any new library.\n3. Never add an npm dependency without asking. Ever.\n4. Run npm run test and npm run lint before you call anything done.\n5. Never touch /app/api/billing/** — that's human-only.\n6. Server state uses TanStack Query. Not Context. We learned this the hard way.\n\n## Conventions that are not obvious from the code\n- API routes return { data, error }, never bare objects.\n- All dates are stored UTC, rendered in the spa's local timezone.\n- leads.status is a strict enum — adding a value requires a migration.\n\n## How to finish a task\nEnd every session with: what changed, the test output, and anything\nyou were unsure about. Never claim something works without showing evidence.\n\n## Deeper context\n@context/business.md\n@context/data-model.md",
          },
        ],
      },
      {
        id: "d2_rules",
        xp: 15,
        title: "Path-scoped rules — the pro move",
        body:
          "This is how you get deep, specific guidance without paying for it on every turn. Files in .claude/rules/ carry a glob in their frontmatter and load only when Claude is working on matching files. Now your API rules can be exhaustive, and they cost you nothing when you're editing a CSS file.",
        blocks: [
          {
            label: ".claude/rules/api-routes.md",
            lang: "md",
            code:
              '---\nglobs: ["app/api/**/*.ts"]\n---\n\n# Rules for API routes\n- Validate every input with Zod at the top of the handler. No exceptions.\n- Never interpolate user input into a raw SQL string.\n- Wrap the handler body in try/catch and return { error } with a real status code.\n- Rate limit anything unauthenticated.\n- Log failures with the request id, never with the request body.',
          },
        ],
      },
      {
        id: "d2_hash",
        xp: 15,
        title: "Teach it mid-flight with #, then keep house",
        body:
          "The moment Claude does something you'll have to correct twice, don't just correct it — press # and write the rule. It goes straight into memory. This is how a good CLAUDE.md actually gets built: not in one sitting, but one scar at a time.",
        blocks: [
          {
            label: "Press # then type the rule",
            lang: "text",
            code: "# Always use cn() from lib/utils for conditional classNames, never template literals",
          },
          {
            label: "Housekeeping",
            lang: "bash",
            code:
              "/memory      # view and edit what Claude has stored\n/context     # see exactly what's eating your context window right now\n/doctor      # audits your setup — bloated memory, slow hooks, dead MCP servers",
          },
        ],
        callout: {
          kind: "edge",
          title: "Coming from another AI tool?",
          body:
            "If your repo already has an AGENTS.md (used by several other coding agents), you don't need to duplicate it. Just add @AGENTS.md to your CLAUDE.md and keep one source of truth.",
        },
      },
    ],
    boss: {
      intro:
        "The cold-start test. Write your CLAUDE.md and at least one path-scoped rules file. Then quit Claude entirely, reopen it in a fresh session, and ask it the four questions below — without letting it read any source files. You win if it answers all four correctly, with no hallucination. If it gets one wrong, your memory file is unclear: fix the file, not the prompt, and run the test again. That loop is the entire skill.",
      xp: 50,
      checks: [
        "A CLAUDE.md exists in your project root and is under 200 lines",
        "At least one path-scoped rules file exists in .claude/rules/ with a glob",
        "In a fresh session it correctly stated what the product does and who pays for it",
        "It correctly stated your stack and where state lives",
        "It named three hard rules and one directory it is forbidden to touch",
      ],
    },
    side: {
      xp: 30,
      text:
        "Write a ~/.claude/CLAUDE.md for yourself — your personal defaults across every project. Package manager, commit message style, testing preference, how much explanation you want, and one line about how blunt you want feedback to be. You'll feel this every day for the rest of the year.",
    },
    founder:
      "Your CLAUDE.md is a business brain, not a tech spec. Write: who your customer is, what your offer is, your pricing rules, your tone of voice, the three things you never say in client comms, your file naming convention, and where things live. Then every future session — proposals, outreach, data cleanup, reports — starts from your actual business context instead of a blank slate. This one file is worth more to a founder than any prompt you'll ever write.",
  },

  /* ————————————————— DAY 3 ————————————————— */
  {
    id: 3,
    code: "MISSION 03",
    title: "The Work Order",
    tagline:
      "Scope creep and context rot are the two things that quietly destroy AI-assisted projects. Today you kill both — with written tickets and ruthless context hygiene.",
    time: "75 min",
    rankAfter: "Operator",
    badge: {
      name: "Scope Sheriff",
      desc: "Executed a written ticket end-to-end with zero out-of-scope files touched.",
    },
    concept: {
      heading: "One ticket. One definition of done. One pull request. Then /clear.",
      body: [
        "Two forces work against you inside every session, and they compound. Scope drift: a prompt with five requests gets three of them right, wobbles on the fourth, and invents the fifth. Attention is finite, even at a million tokens.",
        "Context rot: as a session fills with failed attempts, stale file contents and abandoned approaches, quality degrades — noticeably, after roughly two rounds of auto-compaction. A big context window is a big desk, not a clean one. You can pile more junk on it before you notice the problem.",
      ],
    },
    drills: [
      {
        id: "d3_ticket",
        xp: 20,
        title: "Write a real ticket",
        body:
          "Create specs/ticket-01.md. This file is the contract: everything Claude is allowed to do is in it, and everything else is explicitly out.",
        blocks: [
          {
            label: "specs/ticket-01.md",
            lang: "md",
            code:
              "# Ticket-01 — Inbound lead webhook\n\n## Goal\nPOST /api/webhooks/sms receives Twilio payloads and records the lead.\n\n## Definition of Done\n- [ ] Verifies X-Twilio-Signature against process.env.TWILIO_AUTH_TOKEN;\n      rejects with 403 on mismatch\n- [ ] Parses From, Body, MessageSid\n- [ ] Upserts into leads keyed on MessageSid, status unread\n      (duplicate deliveries must not create duplicate rows)\n- [ ] Returns HTTP 200 with an empty TwiML body\n- [ ] Tests in tests/sms-webhook.test.ts cover: valid payload,\n      bad signature, duplicate MessageSid\n- [ ] npm run test and npm run lint both exit 0\n\n## Out of scope\n- Sending the automated reply (Ticket-02)\n- Any change to the dashboard UI\n- Any schema change beyond the leads upsert\n\n## Verification\nRun: npm run test -- sms-webhook and paste the full output.",
          },
        ],
        callout: {
          kind: "edge",
          title: "Out of scope is doing more work than Definition of Done",
          body:
            'It is the single highest-leverage block of text in this entire guide. Without it, "add a webhook" becomes "add a webhook, refactor the database layer, upgrade three packages, and reformat the whole file." Name the boundary explicitly and the boundary holds.',
        },
      },
      {
        id: "d3_dispatch",
        xp: 20,
        title: "Dispatch it",
        body:
          "Two things to notice here. You referenced the file with @ instead of pasting it — cheaper and always current. And you inserted a mid-task checkpoint, so you catch a wrong direction at 30% instead of 100%.",
        blocks: [
          {
            label: "The dispatch prompt",
            lang: "text",
            code:
              "Read @specs/ticket-01.md.\n\nWork through the Definition of Done in order.\nDo not touch anything listed under Out of scope.\nStop and show me a diff after the signature verification is done,\nbefore you write the tests.\n\nWhen you finish, run the verification command and paste the real output.",
          },
        ],
      },
      {
        id: "d3_evidence",
        xp: 20,
        title: "Demand evidence, not reassurance",
        body:
          "Claude will tell you something works. It is not lying; it genuinely believes it. The fix is to make believing irrelevant.",
        blocks: [
          {
            label: "The evidence demand",
            lang: "text",
            code:
              "Don't tell me it works. Show me:\n- the command you ran\n- its actual stdout, unedited\n- the assertion that proves the duplicate case is handled\n\nIf it failed, say so plainly and fix it. Do not narrate around a failure.",
          },
        ],
        callout: {
          kind: "trap",
          title: "The confident summary",
          body:
            '"I\'ve implemented the endpoint, added comprehensive tests, and everything passes" is a sentence, not a result. Until you have seen stdout, nothing has been verified. Train yourself to feel a small alarm whenever a completion claim arrives without output attached — it is the most common way AI-assisted bugs reach production.',
        },
      },
      {
        id: "d3_hygiene",
        xp: 15,
        title: "Context hygiene",
        body:
          "The single largest driver of token spend for most people is carrying a dead conversation into a new task. Every turn re-sends the whole history. Running /clear between tickets — combined with a lean CLAUDE.md and file references instead of pasted files — routinely cuts spend by half without changing a single thing about how you work.",
        table: {
          head: ["Command", "When to use it"],
          rows: [
            ["/context", "Any time things feel sluggish or dumb. Shows what's consuming your window."],
            ["/clear", "Between every ticket. Free, instant, and the single most underused command in the tool."],
            ["/compact", "Mid-ticket when you're running long but the thread still matters."],
            ["/compact Keep the auth decisions and the failing test. Drop the rest.", "Compaction with instructions — you choose what survives. Far better than the default."],
            ["/rewind → summarise", "Compress history without undoing the code."],
          ],
        },
      },
    ],
    boss: {
      intro: "Execute a full ticket, end to end, with a clean scope record.",
      xp: 50,
      checks: [
        "A written ticket file exists in specs/ with an Out of scope section",
        "Claude hit your mid-task checkpoint and stopped there",
        "Real test output is in your terminal — you can see the pass count",
        "git diff --stat shows no files touched outside the ticket",
        "You ran /clear before starting anything else",
      ],
    },
    side: {
      xp: 35,
      text:
        "Run /context at the start of a fresh session and write down the number. Now do a long messy task without clearing. Run /context again. Then /clear and check a third time. Seeing those three numbers changes how you work permanently — most people have never looked once.",
    },
    founder:
      "Tickets work identically for non-code work, and most founders have never written one. Try: Goal — produce a one-page summary of every client contract in /contracts. Done when — a markdown table with client, start date, renewal date, monthly value, notice period; every row traceable to a file name; ambiguous contracts flagged. Out of scope — opinions about the terms, any file outside /contracts. Then demand the same evidence: \"show me the file names you read.\" This is how you get reliable output from an AI instead of plausible output.",
  },

  /* ————————————————— DAY 4 ————————————————— */
  {
    id: 4,
    code: "MISSION 04",
    title: "Give It Eyes",
    tagline:
      "Passing tests don't mean the app works. Today Claude gets to look at your running product, click things, read the console — and connect to the rest of your tools.",
    time: "75–90 min",
    rankAfter: "Foreman",
    badge: {
      name: "The Eyes",
      desc: "Claude found a bug you hadn't noticed, in your running app, by itself.",
    },
    concept: {
      heading: "Tests verify logic. They do not verify experience.",
      body: [
        "A button can pass every unit test and still be unclickable because a modal overlay sits on top of it. A table can render perfectly in your tests and be unreadable on a 375px screen.",
        "Giving Claude sight closes the loop: it makes a change, looks at the result, notices what's wrong, and fixes it — without you being the eyeballs in the middle.",
      ],
    },
    drills: [
      {
        id: "d4_screens",
        xp: 25,
        title: "Option A — Screenshots (works today, zero setup)",
        body:
          "Drag or paste an image straight into the prompt. Underrated and instant. It is genuinely how engineers at Anthropic have debugged production infrastructure outages — by pasting dashboard screenshots and asking what was wrong.",
        blocks: [
          {
            label: "Paste the screenshot, then:",
            lang: "text",
            code:
              "This is the leads table on a 375px viewport. Three things look wrong to me\nand there may be more. Diagnose what's happening in the CSS, then propose\nfixes ranked by how much they'd improve the experience for a busy salon owner.",
          },
        ],
      },
      {
        id: "d4_devtools",
        xp: 25,
        title: "Option B — Chrome DevTools MCP (the real power move)",
        body:
          "An official server from the Chrome team that gives Claude roughly two dozen tools: navigate, click, fill forms, take snapshots and screenshots, evaluate scripts, and read the console, network requests and performance traces. This is the one that turns Claude into a QA engineer.",
        blocks: [
          {
            label: "Install",
            lang: "bash",
            code:
              "# Add it as an MCP server (project scope so your team gets it too)\nclaude mcp add --scope project chrome-devtools -- npx -y chrome-devtools-mcp@latest\n\n# Then inside Claude Code:\n/mcp        # confirm it's connected",
          },
          {
            label: "Use it",
            lang: "text",
            code:
              "Start the dev server, then open http://localhost:3000/dashboard/leads.\n\nAct like a busy med spa owner on an iPhone:\n1. Check the table renders at 375px and at 1440px\n2. Click \"Mark as contacted\" and read the console for errors or warnings\n3. Confirm the badge changes from Unread to Contacted\n4. Check the network tab — flag any request over 500ms\n\nReport what you found, worst first. Fix nothing yet.",
          },
        ],
      },
      {
        id: "d4_chrome",
        xp: 20,
        title: "Option C — Claude in Chrome",
        body:
          "An extension that lets Claude drive your logged-in browser — your sessions, your cookies, your staging environment behind SSO. Enable it with the /chrome command in-session, or launch with claude --chrome.",
        blocks: [{ label: "Enable", lang: "bash", code: "claude --chrome\n\n# or, inside a session:\n/chrome" }],
        callout: {
          kind: "trap",
          title: "Read before you enable browser control",
          body:
            "An agent that can read web pages and act in your logged-in browser is exposed to prompt injection: text on a page instructing the agent to do something you never asked for. Never point browser-driving tools at untrusted sites while logged into anything that matters. Treat \"browse the web and then act\" as the highest-risk pattern in this entire guide.",
        },
      },
      {
        id: "d4_mcp",
        xp: 20,
        title: "Wire up MCP properly",
        body:
          "MCP is how Claude Code talks to the rest of your stack: GitHub, Sentry, Notion, Slack, Linear, Supabase, Figma, your own database. Learning it well is what makes Claude an employee rather than a code generator. Choose your scope deliberately.",
        blocks: [
          {
            label: "The three scopes",
            lang: "bash",
            code:
              "# local (default) — just you, just this project\nclaude mcp add my-server -- npx -y some-mcp-package\n\n# project — writes .mcp.json, commit it, whole team gets it\nclaude mcp add --scope project sentry --transport http https://mcp.sentry.dev/mcp\n\n# user — you, across every project on this machine\nclaude mcp add --scope user linear --transport http https://mcp.linear.app/mcp\n\n# with environment variables\nclaude mcp add db -e DATABASE_URL=postgres://... -- npx -y postgres-mcp",
          },
        ],
        table: {
          head: ["Transport", "Use"],
          rows: [
            ["stdio", "Default. Runs a local process. Most npm-based servers."],
            ["http", "The current standard for remote servers. Handles OAuth."],
            ["sse", "Deprecated. If a guide tells you to use SSE, it's old. Use http."],
          ],
        },
        callout: {
          kind: "edge",
          title: "Don't over-MCP",
          body:
            "Every connected server injects its tool definitions into your context on every turn. Five heavyweight servers can cost you a serious chunk of your window before you type a word. Where a good CLI already exists — gh, aws, supabase, stripe — prefer the CLI. Claude is excellent at command-line tools and they cost almost nothing. Run /context after adding a server and see what it actually cost you.",
        },
      },
    ],
    boss: {
      intro: "Let Claude find a bug you didn't know about, then fix it.",
      xp: 60,
      checks: [
        "Claude viewed your running app — via screenshot, DevTools MCP, or the Chrome extension",
        "It reported at least one genuine issue you had not already spotted",
        "You turned that finding into a small ticket (Day 3 skills — don't skip this)",
        "It shipped the fix, and then looked again to confirm the fix worked",
        "At least one MCP server is connected and shows up under /mcp",
      ],
    },
    side: {
      xp: 35,
      text:
        "Have Claude walk one complete user journey — signup to core action — narrating what a first-time user would find confusing at each step, then produce a prioritised UX punch list. You will get feedback that is more honest than most usability tests, in about four minutes.",
    },
    founder:
      "This is the day Claude Code stops being a developer tool for you. Connect the servers your business actually runs on — Notion, Slack, Google Drive, your CRM, your database — and now you can ask: \"Pull every deal that's been in proposal stage more than 21 days, cross-reference the last email in each thread, and draft a follow-up for each one in our voice from CLAUDE.md.\" That's not a coding task. It's an operations task, and it's the highest-ROI thing most founders can do with this tool.",
  },

  /* ————————————————— DAY 5 ————————————————— */
  {
    id: 5,
    code: "MISSION 05",
    title: "The Quality Gate",
    tagline:
      "Two layers of defence: a reviewer that isn't the author, and hooks that don't have opinions at all — they just refuse.",
    time: "90 min",
    rankAfter: "Commander",
    badge: {
      name: "Gatekeeper",
      desc: "A hook physically blocked a bad action. You watched it happen.",
    },
    concept: {
      heading: 'Never ask "does this look good?"',
      body: [
        "Ask a model to review its own work and it will approve it. Not from dishonesty — from context. It just spent twenty turns constructing an argument for why this approach is correct. Asking it to now find the flaw is asking it to argue against itself while holding all of its own reasoning in front of it.",
        "There are two real fixes, and you want both: a reviewer with fresh eyes in a separate context window, and deterministic hooks that are code, not judgement — they cannot be persuaded.",
      ],
    },
    drills: [
      {
        id: "d5_rubric",
        xp: 30,
        title: "Write the rubric",
        body:
          '"Review this" produces mush. A rubric with forced severity classification produces a list you can act on. Create REVIEW.md in your project root.',
        blocks: [
          {
            label: "REVIEW.md",
            lang: "md",
            code:
              "# Review standards\n\nJudge every diff against these gates. Cite file and line for each finding.\n\n1. Scope     — were files touched that the ticket didn't name?\n2. Security  — unvalidated input, raw SQL, secrets in code, missing authz,\n               anything logged that shouldn't be\n3. Types     — any, as casts, @ts-ignore, silently widened types\n4. Failure   — every async path has real error handling; no empty catch;\n               user-facing errors are actionable\n5. Clarity   — functions under ~40 lines, honest names, no dead code\n6. Tests     — does a test exist that would FAIL if this feature broke?\n\n## Classify every finding\n- [MUST FIX]    functional bug, security issue, data loss, breaking change\n- [SHOULD FIX]  weak types, perf risk, inconsistent with our conventions\n- [OK TO SHIP]  polish, optional refactor, taste\n\n## Rules for you, the reviewer\n- If you find nothing MUST FIX, say so plainly — do not manufacture findings.\n- Do not praise. Do not summarise the diff back to me. Findings only.\n- If you cannot verify something without running it, say that explicitly.",
          },
        ],
        callout: {
          kind: "edge",
          title: "Gate 6 is the one nobody writes",
          body:
            '"Does a test exist that would fail if this broke?" is the difference between tests that exist and tests that protect you. Ask it of every diff and you will be shocked how often the answer is no.',
        },
      },
      {
        id: "d5_reviewer",
        xp: 30,
        title: "Build a reviewer subagent",
        body:
          "A subagent runs in its own context window with its own system prompt and its own tool permissions. That isolation is exactly what makes review work. Note the tools: line — this agent can read, search and run commands, but it has no write tools at all. It structurally cannot \"helpfully\" fix things while reviewing, which keeps the review honest and the diff stable.",
        blocks: [
          {
            label: ".claude/agents/code-reviewer.md",
            lang: "md",
            code:
              "---\nname: code-reviewer\ndescription: Reviews a diff against REVIEW.md and classifies every finding by\n  severity. Use after any implementation work, before committing.\ntools: Read, Grep, Glob, Bash\nmodel: sonnet\n---\n\nYou are a senior engineer reviewing a colleague's pull request.\nYou did not write this code and you have no stake in the approach taken.\n\nProcess:\n1. Run git diff to see exactly what changed.\n2. Read REVIEW.md and apply every gate in it.\n3. Read the relevant ticket in specs/ and check the diff against its\n   Definition of Done AND its Out of scope section.\n4. Report findings grouped by severity, each with file:line and a\n   concrete suggested fix.\n\nYou are blunt and specific. You do not soften findings. You do not\ncompliment the author. If the diff is clean, you say \"No MUST FIX\nfindings\" and stop.",
          },
          {
            label: "Run it",
            lang: "text",
            code: "Use the code-reviewer agent on the current diff.\n\n# or use the built-in review command\n/code-review",
          },
        ],
        callout: {
          kind: "edge",
          title: "Note on /agents",
          body:
            'Recent versions removed the interactive agent-creation wizard. Write the file yourself, or — much faster — say: "Create a subagent at .claude/agents/security-auditor.md that does X, with these tools, using the Haiku model." Claude will write its own colleague.',
        },
      },
      {
        id: "d5_hooks",
        xp: 30,
        title: "Hooks — the layer that can't be argued with",
        body:
          "A reviewer has judgement. Sometimes you want the opposite: a gate that runs deterministic code and simply refuses. That's a hook, and it is configured in settings.json — not, as older guides claim, as a loose shell script in a hooks folder.",
        blocks: [
          {
            label: ".claude/settings.json",
            lang: "json",
            code:
              '{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Edit|Write",\n        "hooks": [\n          { "type": "command",\n            "command": "npx prettier --write \\"$CLAUDE_FILE_PATHS\\"" }\n        ]\n      }\n    ],\n    "PreToolUse": [\n      {\n        "matcher": "Edit|Write",\n        "hooks": [\n          { "type": "command",\n            "command": ".claude/scripts/block-secrets.sh" }\n        ]\n      }\n    ]\n  }\n}',
          },
          {
            label: ".claude/scripts/block-secrets.sh — exit 2 blocks the action",
            lang: "bash",
            code:
              "#!/bin/bash\n# Claude passes the tool call as JSON on stdin\nINPUT=$(cat)\nif echo \"$INPUT\" | grep -qE '\\.env|credentials|id_rsa|\\.pem'; then\n  echo \"BLOCKED: protected file. Ask a human.\" >&2\n  exit 2        # exit 2 = block, and stderr is fed back to Claude\nfi\nexit 0",
          },
        ],
        table: {
          head: ["Event", "Hook worth having on day one"],
          rows: [
            ["PostToolUse", "Format every file Claude writes. You never see a style diff again."],
            ["PreToolUse", "Block edits to .env, secrets, migrations, billing code."],
            ["Stop", "Run the type-checker when it finishes. Catches the silent break."],
            ["Notification", "Desktop ping when Claude needs you — so long runs don't block you."],
          ],
        },
        callout: {
          kind: "trap",
          title: "There is no pre-commit hook event",
          body:
            "Guides that tell you to create .claude/hooks/pre-commit.sh are conflating Claude hooks with git hooks. The real events are PreToolUse, PostToolUse, UserPromptSubmit, Notification, Stop, SubagentStop, PreCompact, SessionStart and SessionEnd. To gate commits, either match PreToolUse on Bash(git commit*), or use a real git pre-commit hook — which also protects you when you commit by hand.",
        },
      },
    ],
    boss: {
      intro: "Build both layers and watch them work.",
      xp: 60,
      checks: [
        "REVIEW.md exists and a code-reviewer subagent uses it",
        "The reviewer produced at least one MUST FIX on real code, and you fixed it",
        "A formatting hook fires automatically on every write — you can see the file change",
        "A blocking hook refused an action in front of you (ask Claude to edit .env and watch it get stopped)",
        'You did not once ask "does this look good?"',
      ],
    },
    side: {
      xp: 40,
      text:
        "Build a second reviewer with a different personality — a security-auditor on a cheap fast model that only looks for injection, authz and secret-leak issues. Run both on the same diff. Two specialists beat one generalist, and the cost difference is negligible.",
    },
    founder:
      "Write a REVIEW.md for your standards, not for code: brand voice, factual accuracy, no invented numbers, no claim without a source, every price matching the pricing sheet. Then build a reviewer agent that enforces it on every draft you produce — proposals, emails, landing copy. You just hired an editor who never gets tired and never flatters you.",
  },

  /* ————————————————— DAY 6 ————————————————— */
  {
    id: 6,
    code: "MISSION 06",
    title: "The Agent Army",
    tagline:
      "One of you. Many of them. Today you stop being a person who talks to an AI and start being a manager who runs a team.",
    time: "90 min",
    rankAfter: "Architect",
    badge: {
      name: "Fleet Commander",
      desc: "Three agents, three branches, three clean merges, one afternoon.",
    },
    concept: {
      heading: "Two kinds of parallelism",
      body: [
        "Subagents: Claude delegates to specialists inside one session. Each gets a fresh context window and returns a summary. Use for research, review, testing, exploration — anything that would otherwise pollute your main thread.",
        "Worktrees: several full Claude Code sessions on separate branches in separate folders. Use for genuinely independent features being built at the same time.",
      ],
    },
    drills: [
      {
        id: "d6_subagents",
        xp: 35,
        title: "Subagents that earn their keep",
        body:
          "Three built-ins exist already: Explore (read-only, fast, cheap — perfect for \"go find out how X works\"), Plan, and a general-purpose agent. Your own live in .claude/agents/. Subagents buy you three things: context isolation (an agent can read forty files and return six lines — the biggest, least-understood win), enforced constraints (the tools field is a hard boundary, not a suggestion), and cost control (route grunt work to a cheap fast model).",
        blocks: [
          {
            label: "A team worth building",
            lang: "text",
            code:
              ".claude/agents/\n  code-reviewer.md      # Day 5 — blunt, read-only, uses REVIEW.md\n  security-auditor.md   # cheap model, narrow brief, high paranoia\n  test-writer.md        # writes failing tests first, then stops\n  debugger.md           # reproduces, isolates, forms a hypothesis, proves it\n  researcher.md         # read-only; digs through the repo and reports back",
          },
        ],
        callout: {
          kind: "edge",
          title: "The description field is the whole game",
          body:
            'Claude decides when to delegate based on the agent\'s description. Vague description, never used. Write it as a trigger: "Use immediately after any code change, before committing" beats "Reviews code" by a mile. This one field is the difference between a team you built and a team that shows up.',
        },
      },
      {
        id: "d6_patterns",
        xp: 35,
        title: "Orchestration patterns that actually work",
        body: "Four patterns cover almost everything you will ever want to run in parallel.",
        table: {
          head: ["Pattern", "How to run it"],
          rows: [
            ["Fan-out research", '"Use three Explore agents in parallel: one maps the auth flow, one maps the data layer, one finds every place we handle errors. Then synthesise."'],
            ["Two Claudes", "One writes, a second reviews with no knowledge of the first's reasoning. Same model, different context — the isolation is what does the work."],
            ["TDD loop", '"Write failing tests for this ticket. Do not write implementation. Show me the tests failing." Then: "Now make them pass without touching the tests."'],
            ["Orchestrator / worker", "Main session owns the plan and the merges; subagents own the pieces. You talk only to the orchestrator."],
          ],
        },
        callout: {
          kind: "edge",
          title: 'Why "write the test first" matters more with an AI than without one',
          body:
            "A failing test is an objective, external target. Without one, Claude decides for itself when it's done, and it's an optimist. With one, done is defined by something outside the conversation. If you adopt exactly one habit from this entire guide, make it this one.",
        },
      },
      {
        id: "d6_worktrees",
        xp: 35,
        title: "Worktrees — three engineers, three branches, no collisions",
        body:
          "Run two Claude sessions in the same folder and they'll overwrite each other's work. Git worktrees give each one its own directory on its own branch, sharing one repository. Give each one a ticket from Day 3 and let them run.",
        blocks: [
          {
            label: "The built-in way",
            lang: "bash",
            code: "claude --worktree feat/csv-export\n\n# short form, and with a tmux session per worktree\nclaude -w feat/csv-export --tmux",
          },
          {
            label: "Or manually, for full control",
            lang: "bash",
            code:
              "git worktree add ../app-backend  -b feat/lead-notes\ngit worktree add ../app-frontend -b feat/table-redesign\ngit worktree add ../app-docs     -b chore/onboarding-docs\n\n# one terminal tab each\ncd ../app-backend  && npm install && claude\ncd ../app-frontend && npm install && claude\ncd ../app-docs     && claude",
          },
          {
            label: "Then merge",
            lang: "bash",
            code: "git checkout main\ngit merge feat/lead-notes\ngit worktree remove ../app-backend",
          },
        ],
        callout: {
          kind: "trap",
          title: "Three things that go wrong",
          body:
            "Dependencies: each worktree needs its own npm install. Yes, it's annoying. Yes, you have to do it. Stateful MCP servers: some need one instance per worktree — check before you assume. Rate limits: three parallel agents burn your window roughly three times faster. Check /usage before you launch the fleet, not after it stalls.",
        },
      },
    ],
    boss: {
      intro: "Run a fleet and land it cleanly.",
      xp: 70,
      checks: [
        "At least three specialist agent files exist in .claude/agents/",
        "You watched Claude delegate on its own — because a description was written well enough to trigger it",
        "Three worktrees ran three separate tickets in parallel",
        "All three branches merged into main with no conflicts (conflicts mean your tickets overlapped — that's the lesson)",
        "You killed at least one session that was going nowhere instead of rescuing it",
      ],
    },
    side: {
      xp: 40,
      text:
        "Run the two-Claudes experiment properly. Have session A build a feature. Have session B — which has never seen A's reasoning — review it against REVIEW.md. Then paste B's findings into A. Watch what a second pair of eyes catches. This is the pattern most professional teams end up standardising on.",
    },
    founder:
      "Your three parallel agents don't have to write code. Try: agent one drafts this week's client report from the raw data; agent two audits your landing page copy against your customer profile in CLAUDE.md; agent three cleans and de-duplicates your lead spreadsheet. Three tabs, three tickets, one hour. That's a full day of operations work compressed.",
  },

  /* ————————————————— DAY 7 ————————————————— */
  {
    id: 7,
    code: "MISSION 07",
    title: "The Factory",
    tagline:
      "Turn everything you've learned into assets: one-word Skills, locked-down permissions, and automation that runs while you sleep.",
    time: "90–120 min",
    rankAfter: "Chief of Staff",
    badge: {
      name: "Factory Owner",
      desc: "Built a Skill and an automation that runs with no human in the loop.",
    },
    concept: {
      heading: "Stop repeating yourself. Package it.",
      body: [
        "Everything you built this week is a one-off until you turn it into an asset someone else can run. A Skill is a repeatable procedure Claude can load on demand — and crucially, a Skill is a directory, not a file.",
        "Progressive disclosure is why the directory format matters: only the description sits in context, the body loads when invoked, bundled references load only if needed, and a bundled script executes without its source code entering the window.",
      ],
    },
    drills: [
      {
        id: "d7_skills",
        xp: 30,
        title: "Skills — package your expertise",
        body:
          "Build the skill your team explains to every new hire. Once it exists, anyone types /teardown app/page.tsx and gets your standard, every time. Legacy flat files in .claude/commands/*.md still work and still create a /name command — they're fine for one-liners, but anything with real substance should be a Skill.",
        blocks: [
          {
            label: "The directory shape",
            lang: "text",
            code:
              ".claude/skills/\n  teardown/\n    SKILL.md          # the instructions (keep under ~500 lines)\n    reference.md      # loaded only if needed\n    scripts/\n      score.py        # runs without its source entering context",
          },
          {
            label: ".claude/skills/teardown/SKILL.md",
            lang: "md",
            code:
              "---\nname: teardown\ndescription: Audits a landing page or feature for five-second clarity and\n  buyer conversion. Use when reviewing marketing copy or a public-facing page.\nargument-hint: [file path]\nallowed-tools: Read, Grep, Glob\n---\n\n# Conversion teardown\n\nRead our customer profile in @context/business.md first. Everything below\nis judged from that buyer's point of view, not from good taste.\n\nThen review the target file and produce, in this exact order:\n\n1. Five-second test — if they read only what's above the fold, what do they\n   think we sell and what does it cost them? Quote the exact words that\n   created that impression.\n2. Clarity score, 1-10, with the single sentence that cost the most points.\n3. Pain vs payoff — is the financial upside stated in numbers? If not,\n   that is the top finding.\n4. Three copy replacements — exact before/after text, not advice.\n5. The one thing you'd cut entirely.\n\nNever suggest \"add more social proof\" without naming which proof and where.",
          },
        ],
        callout: {
          kind: "edge",
          title: "Let Claude build your skills",
          body:
            'The fastest route from "we always do it this way" to a working command is to describe it: "Create a skill at .claude/skills/db-migrate/SKILL.md that walks our migration checklist, with allowed-tools Read and Bash." Then test it, and refine the description until Claude reaches for it on its own.',
        },
      },
      {
        id: "d7_plugins",
        xp: 25,
        title: "Plugins — install other people's factories",
        body:
          "Plugins bundle skills, agents, hooks, commands and MCP servers into one installable package. Before you build something, spend ten minutes looking for it. And when you build something good, package it — an internal plugin is how you distribute your team's standards to every engineer at once.",
        blocks: [
          {
            label: "In-session",
            lang: "bash",
            code: "/plugin                      # browse and manage\n/plugin marketplace add <owner>/<repo>\n/plugin install <name>@<marketplace>",
          },
        ],
      },
      {
        id: "d7_perms",
        xp: 25,
        title: "The permission architecture",
        body:
          "Settings cascade, most specific winning: enterprise policy → ~/.claude/settings.json → .claude/settings.json → .claude/settings.local.json. Rules are allow, ask, or deny. Decide your three tiers once, for real.",
        blocks: [
          {
            label: ".claude/settings.json",
            lang: "json",
            code:
              '{\n  "permissions": {\n    "allow": [\n      "Bash(npm run test:*)",\n      "Bash(npm run lint)",\n      "Bash(git diff:*)",\n      "mcp__chrome-devtools__*"\n    ],\n    "ask": [\n      "Bash(npm install:*)",\n      "Bash(npx prisma migrate:*)"\n    ],\n    "deny": [\n      "Read(./.env*)",\n      "Read(./secrets/**)",\n      "Bash(git push --force:*)",\n      "Edit(./app/api/billing/**)"\n    ]\n  }\n}',
          },
        ],
        table: {
          head: ["Tier", "Scope", "Setting"],
          rows: [
            ["1 — Safe", "Read files, run tests and linters, edit feature-branch code, git diff/status", "allow · runs autonomously"],
            ["2 — Ask first", "Install packages, run migrations, touch auth or payments, push branches", "ask · you type Y"],
            ["3 — Human only", "Production deploys, live secrets, customer PII, force pushes, anything billing", "deny · never, plus a blocking hook"],
          ],
        },
        callout: {
          kind: "trap",
          title: "On --dangerously-skip-permissions",
          body:
            "You'll see it recommended everywhere. Don't. Auto mode now gives you autonomous operation with a safety classifier and a circuit breaker that pauses after repeated blocks — that's the modern answer. Reserve the dangerous flag for a genuine sandbox with no network and nothing valuable in it. And remember the underlying risk it removes your protection from: prompt injection. An agent that reads a web page, an issue tracker, or a customer email is reading text that might be instructions.",
        },
      },
      {
        id: "d7_headless",
        xp: 25,
        title: "Headless — Claude with no human in the loop",
        body:
          "Wrap it in a cron job, a CI step, or a script. Always bound it with --allowedTools and an explicit --permission-mode, so a runaway can't reach anything that matters. For real applications, use the Claude Agent SDK (npm install @anthropic-ai/claude-agent-sdk) — note it was renamed from the old \"Claude Code SDK\", so ignore packages using the old name.",
        blocks: [
          {
            label: "One-shot, non-interactive",
            lang: "bash",
            code: 'claude -p "Summarise today\'s failing tests and open a GitHub issue for each"',
          },
          {
            label: "Bounded and machine-readable",
            lang: "bash",
            code:
              'claude -p "Review the diff on this branch against REVIEW.md" \\\n  --output-format json \\\n  --allowedTools "Read,Grep,Bash(git diff:*)" \\\n  --permission-mode plan \\\n  --model sonnet',
          },
          {
            label: "Pipe things in",
            lang: "bash",
            code: 'cat error.log | claude -p "Group these errors by root cause. Table only."',
          },
        ],
        callout: {
          kind: "edge",
          title: "And in GitHub",
          body:
            "Add the official anthropics/claude-code-action to your workflows and you can mention @claude in an issue or pull request and have it respond, review, or implement — inside your CI, on your rules.",
        },
      },
    ],
    boss: {
      intro: "Turn the week into assets that outlive it.",
      xp: 70,
      checks: [
        "A working Skill exists at .claude/skills/<name>/SKILL.md and you invoked it with /name",
        "Your settings.json implements all three permission tiers, with real deny rules",
        "You tested a deny rule and watched it refuse",
        "One thing now runs without you — a headless script, a cron job, or a CI step",
        "You browsed the plugin marketplace and installed at least one thing you didn't write",
      ],
    },
    side: {
      xp: 40,
      text:
        "Build the skill your team explains to every new hire. Onboarding walkthrough, release checklist, the way you write migrations, your proposal format, your QA pass. Then commit it. You just turned tribal knowledge into infrastructure — and that is the actual deliverable of this entire week.",
    },
    founder:
      "Turn your most repeated workflow into a Skill. Weekly client report, proposal format, onboarding pack, the way you qualify an inbound lead — whatever you explain to people over and over. Write it once as SKILL.md and it becomes a one-word command for you and everyone you hire after you.",
  },
];

/* ——— Appendix: prompt vault ——— */
export const PROMPTS: { n: number; title: string; code: string }[] = [
  {
    n: 1,
    title: "Cold explore",
    code:
      "Read the files that own [behaviour]. Trace the data flow end to end.\nChange nothing. Report: which files own this, what conventions exist,\nwhat already does something similar, and what you're unsure about.",
  },
  {
    n: 2,
    title: "Architecture plan",
    code:
      "Think harder and produce an implementation plan: exact files to modify,\nexact files to create, step-by-step logic, edge cases and security\nconsiderations, the command that will verify it, and every question you\nneed answered first. Do not implement.",
  },
  {
    n: 3,
    title: "Scoped dispatch",
    code:
      "Read @specs/ticket-XX.md. Work the Definition of Done in order.\nTouch nothing under Out of scope. Stop and show me a diff after step 2.",
  },
  {
    n: 4,
    title: "Evidence demand",
    code:
      "Don't tell me it works. Show me the command, its unedited stdout, and\nthe specific assertion that proves the edge case is handled.",
  },
  {
    n: 5,
    title: "The honest self-critique",
    code:
      "Argue against your own implementation. What would a senior engineer who\ndislikes this approach say in review? Give me the three strongest\nobjections, then tell me which one you think is actually right.",
  },
  {
    n: 6,
    title: "Rubric review",
    code:
      "Audit git diff against @REVIEW.md. Classify every finding as\n[MUST FIX], [SHOULD FIX] or [OK TO SHIP], with file:line and a concrete\nfix. Do not praise. Do not summarise the diff. If nothing is MUST FIX,\nsay so and stop.",
  },
  {
    n: 7,
    title: "Test-first",
    code:
      "Write failing tests for @specs/ticket-XX.md covering the happy path and\nevery edge case in the Definition of Done. Do not write implementation.\nRun them and show me them failing for the right reason.",
  },
  {
    n: 8,
    title: "Debug with discipline",
    code:
      "Reproduce this bug first — show me the failing case. Then form three\nhypotheses about the cause, rank them by likelihood, and test the top one.\nDo not fix anything until you can prove which hypothesis is correct.",
  },
  {
    n: 9,
    title: "UX pass with eyes",
    code:
      "Open [url]. Behave like [your actual customer] on a phone. Walk the full\njourney. At each step: what's confusing, what's slow, what's broken in the\nconsole. Report worst-first with severity. Fix nothing yet.",
  },
  {
    n: 10,
    title: "Parallel research fan-out",
    code:
      "Use three Explore agents in parallel: one maps [X], one maps [Y], one finds\nevery place we handle [Z]. Each returns under 200 words. Then synthesise\ninto one picture and flag every inconsistency you found between them.",
  },
  {
    n: 11,
    title: "The pre-commit gate",
    code:
      "Before we commit: run the tests, run the linter, run the type-checker.\nShow me all three outputs. Then git diff --stat and confirm every file\nlisted is one the ticket authorised. If any isn't, explain why.",
  },
  {
    n: 12,
    title: "Session handoff",
    code:
      "Write a handoff note to the next session: what we were doing, what's done,\nwhat's half-done and exactly where, what to watch out for, and the next\nthree actions in order. Save it to specs/handoff.md.",
  },
  {
    n: 13,
    title: "Codebase onboarding (new repo)",
    code:
      "I've never seen this codebase. Give me: the 60-second version of what it\ndoes, the five files that matter most, the architectural decision I'd most\nlikely get wrong, and the part of this code you'd be most nervous about\nchanging. Read only.",
  },
];

/* ——— Appendix: cheat sheet ——— */
export const COMMANDS: [string, string][] = [
  ["/init", "Scaffold a starter CLAUDE.md from your repo"],
  ["/clear", "Wipe conversation context. Between every ticket."],
  ["/compact [instructions]", "Compress the conversation — with instructions, you choose what survives"],
  ["/context", "See exactly what is consuming your context window"],
  ["/rewind", "Roll back code, conversation, or both (also: Esc Esc)"],
  ["/memory", "View and edit stored memory"],
  ["/code-review", "Run a code review on the current diff"],
  ["/agents", "Manage subagents (write the files in .claude/agents/)"],
  ["/plugin", "Browse, install and manage plugins and marketplaces"],
  ["/mcp", "Inspect and authenticate MCP servers"],
  ["/hooks", "View and configure hooks"],
  ["/permissions", "View and edit permission rules"],
  ["/model", "Switch models mid-session — cost control lever"],
  ["/usage", "Where you stand against your plan's limits"],
  ["/doctor", "Full checkup — diagnoses install, settings and setup rot, and offers to fix"],
  ["/status", "Version, auth, model, working directory"],
  ["/resume", "Pick up a previous session"],
  ["/add-dir", "Give the session access to another directory"],
  ["/chrome", "Enable browser control via the Claude in Chrome extension"],
  ["/export", "Export the conversation"],
];

export const FLAGS: [string, string][] = [
  ['-p "..."', "Headless one-shot"],
  ["--permission-mode plan", "Launch straight into plan mode"],
  ['--allowedTools "..."', "Hard-bound the tool surface. Always use this in automation."],
  ["--output-format json", "Machine-readable output for pipelines"],
  ["--model / --fallback-model", "Pick the model, and what to fall back to"],
  ["-w, --worktree <branch>", "Start an isolated parallel session in a new git worktree"],
  ["--tmux", "Create a tmux session for the worktree (requires --worktree)"],
  ["--resume / --fork-session", "Continue or branch a previous session"],
  ["--chrome", "Enable the Claude in Chrome integration"],
  ["--add-dir <dirs...>", "Allow tool access to additional directories"],
];

/* ——— Appendix: anti-patterns ——— */
export const ANTIPATTERNS: [string, string][] = [
  ["It edited fifteen files when you asked for one", "Write an Out of scope section. Add a CLAUDE.md rule capping files per change."],
  ["Quality collapsed halfway through a long session", "Context rot. /clear and restart with a handoff note. Don't push through it."],
  ["It imported a package you don't have", '"Never add a dependency without asking" in CLAUDE.md, plus a verification step that actually runs the code.'],
  ["It says everything works; nothing works", "Never accept a completion claim without stdout. Make a failing test the target instead of its own judgement."],
  ["Its review always approves", "Reviewer must be a separate subagent with a rubric and no write tools."],
  ["CLAUDE.md rules get ignored", "The file is too long. Cut it and move depth into .claude/rules/."],
  ["Bills or limits far higher than expected", "You're not clearing between tasks, or you have unused MCP servers loaded. Run /context."],
  ["Parallel agents overwrote each other", "They shared a folder. Use worktrees."],
  ["It deleted something and /rewind can't get it back", "The change came from a bash command, not an edit tool — checkpoints don't cover those. Commit more often."],
  ["It keeps making the same mistake", "You corrected it in chat instead of in memory. Press # and write the rule."],
];

/* ——— Appendix: cost levers ——— */
export const COST_LEVERS: [string, string][] = [
  ["/clear between tickets", "Biggest single saving. Free. Almost nobody does it consistently."],
  ["Reference files with @, don't paste", "Cheaper and always current"],
  ["Lean CLAUDE.md + path-scoped rules", "Cuts the fixed cost of every single turn"],
  ["Drop unused MCP servers", "Their tool schemas load every turn whether you use them or not"],
  ["Route to a cheaper model", "Haiku for search and formatting; save the big model for architecture"],
  ["Read-only Explore subagents", "They read forty files and return six lines to your main window"],
  ["Scoped tickets", "An unbounded task is an unbounded bill"],
];

/* ——— Capstone ——— */
export const EXAM: string[] = [
  "A CLAUDE.md exists, is under 200 lines, and passes the cold-start test in a fresh session.",
  "At least one path-scoped rules file exists in .claude/rules/ and loads only for its glob.",
  "At least three written tickets exist in specs/, each with an Out of scope section.",
  "Your last three commits each touch only files their ticket authorised.",
  "You can state your current context usage from /context without guessing.",
  "A REVIEW.md exists and a reviewer subagent uses it — with no write tools.",
  "A hook fires automatically on every file write. You can name it.",
  "A hook has blocked an action in front of you, and you know its exit code.",
  "At least three subagents exist, and one has been auto-delegated to without you naming it.",
  "You have run three parallel worktrees and merged all three without conflict.",
  "A Skill exists at .claude/skills/<name>/SKILL.md and someone other than you could use it.",
  "Something runs without you — headless, cron, or CI — and produced output you didn't ask for today.",
];

/* ——— Appendix: the repo template ——— */
export const REPO_TREE = `your-project/
├── CLAUDE.md                  # the brain — lean, opinionated, committed
├── REVIEW.md                  # the quality rubric
├── .mcp.json                  # project-scoped MCP servers, committed
├── context/
│   ├── business.md            # who pays, what they care about
│   └── data-model.md          # the schema and why it looks like that
├── specs/
│   ├── ticket-01.md           # one ticket = one finish line = one PR
│   └── handoff.md             # written at the end of long sessions
└── .claude/
    ├── settings.json          # permissions + hooks (committed)
    ├── settings.local.json    # your personal overrides (gitignored)
    ├── rules/
    │   ├── api-routes.md      # glob-scoped: loads only for app/api/**
    │   └── migrations.md
    ├── agents/
    │   ├── code-reviewer.md
    │   ├── security-auditor.md
    │   └── researcher.md
    ├── skills/
    │   └── teardown/
    │       └── SKILL.md
    ├── commands/              # legacy one-liner slash commands
    └── scripts/
        └── block-secrets.sh   # called by a PreToolUse hook`;

export const TICKET_TEMPLATE = `# Ticket-NN — [one-line title]

## Goal
[One or two sentences. What exists after this is done that doesn't now.]

## Definition of Done
- [ ] [Specific, checkable, testable]
- [ ] [Include the failure cases, not just the happy path]
- [ ] Tests in [path] cover: [list the cases]
- [ ] [lint command] and [test command] both exit 0

## Out of scope
- [The adjacent thing it will be tempted to fix]
- [Anything that belongs to another ticket]

## Verification
Run [exact command] and paste the full output.`;

export const AGENT_TEMPLATE = `---
name: agent-name
description: [Written as a trigger — "Use immediately after X, before Y."
  This field decides whether Claude ever delegates to it.]
tools: Read, Grep, Glob, Bash     # omit to inherit everything
model: sonnet                     # haiku for cheap grunt work
---

[System prompt. Give it a role, a process, and an output format.
Tell it what it must NOT do. Tell it how to say "nothing found."]`;

/* ——— Days 8–30 ——— */
export const LADDER: [string, string, string][] = [
  [
    "Week 2",
    "Depth",
    "Ship every task through the full loop, no exceptions. Add one path-scoped rules file per area of your codebase. Grow your agent roster to five. Rewrite your CLAUDE.md from scratch now that you know what actually matters.",
  ],
  [
    "Week 3",
    "Automation",
    "Move three recurring jobs to headless. Put Claude in your CI with the GitHub action. Write the hooks that make your worst recurring mistake structurally impossible. Package your skills into an internal plugin.",
  ],
  [
    "Week 4",
    "Leverage",
    "Onboard someone else onto your setup — teaching exposes every gap. Build the Skill your whole team uses. Measure: how long did this used to take, how long now, and what does that mean in money?",
  ],
  [
    "Ongoing",
    "Maintenance",
    "Once a month: run /doctor, skim the changelog for ten minutes, delete the rules you never use, and pension off any skill nobody invokes. Setups rot. Maintained setups compound.",
  ],
];
