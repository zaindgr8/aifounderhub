/* ————————————————————————————————————————————————————————————————
   CLAUDE MASTER IN 7 DAYS — NO-CODE TRACK
   For founders and operators who never open a terminal.
   Source: AI Founder Hub Operator Field Guide, Edition 2.0
   Surfaces verified against the Claude apps as of 1 Sept 2026.
———————————————————————————————————————————————————————————————— */

import type { Day, DayZeroSpec } from "./claude7Days";

export const NOCODE_MAX_XP = 1250;

/* ——— Day 0 ——— */
export const NOCODE_DAY_ZERO: DayZeroSpec = {
  title: "Set Up Camp",
  tagline:
    "Twenty minutes. Get on the right plan, flip the three settings that unlock everything else, and teach Claude who you are — once. Skip this and the rest of the week is confusing for reasons you won't be able to name.",
  planHeading: "First: the plan question, answered honestly",
  planIntro:
    "Almost everything in this track needs a paid plan — not because Anthropic is greedy, but because Cowork and Claude Design are the two surfaces that turn Claude from a chatbot into a coworker, and neither is on Free. Pricing moves and varies by region; treat this table as directional and check claude.com/pricing.",
  planNote:
    "Limits stack: a rolling five-hour window plus a weekly cap, shared across the Claude apps and Claude Code together. If you hit them constantly on Pro, that's the signal to move to Max — not a reason to work around it.",
  planTableHead: ["Plan", "Approx. price", "What you actually get"],
  plans: [
    ["Free", "$0", "Chat, up to 5 Projects, limited Artifacts and search. No Cowork, no Claude Code. Days 1–2 only."],
    ["Pro", "~$20/mo (~$17 billed annually)", "The real starting line. Adds Cowork, Claude Design and Claude Code. Everything in this track works."],
    ["Max 5× / 20×", "~$100 / ~$200 per month", "5× or 20× Pro's usage headroom plus priority access. Worth it once Cowork runs your week."],
    ["Team", "roughly $20–25 / $100–125 per seat/mo", "Shared workspace, admin control over what each role can install, central billing."],
    ["Enterprise", "Custom", "SSO, audit logs, compliance API, dedicated support."],
  ],
  installHeading: "Get on the right surfaces",
  blocks: [
    {
      label: "Install the surfaces you'll actually use",
      lang: "ui" as const,
      code:
        "Desktop app   claude.ai/download   ← required for Cowork's work on local folders\nMobile app    iOS / Android        ← capture and approve while you're moving\nWeb           claude.ai            ← everything except local folder access\nChrome ext.   Claude in Chrome     ← lets Claude browse and fill forms for you",
    },
    {
      label: "Settings → Capabilities — turn these on now",
      lang: "ui" as const,
      code:
        "[x] Code execution and file creation   ← ARTIFACTS DO NOT WORK WITHOUT THIS\n[x] Memory                             ← so it stops asking who you are\n[x] Web search\n[ ] Incognito chat                     ← leave off; switch it on per-chat when needed",
    },
    {
      label: "Settings → Model — pick your default, then learn to switch",
      lang: "ui" as const,
      code:
        "Claude Opus 5      hardest thinking — strategy, messy analysis, long documents\nClaude Sonnet 5    the default on most plans — fast, strong enough for 90% of work\nClaude Haiku 4.5   cheapest and quickest — extraction, formatting, bulk tidying\n\nYou can switch models mid-conversation, and set the effort /\nthinking level in Settings. Both dials are free. Use them.",
    },
    {
      label: "Paste this into your very first chat",
      lang: "prompt" as const,
      code:
        "I'm setting you up as my working partner, so learn me once.\n\nMe: [name, role, company, what we sell, to whom]\nMy week: [the five things that eat the most of my time]\nMy voice: [how I write — short sentences? British spelling? no emoji?]\nMy tools: [Gmail / Slack / Notion / Drive / Excel — what you'd need to touch]\n\nAsk me the six questions that would most improve how well you work for me.\nThen write a short profile of me and save it to memory.",
    },
  ],
  installTrap: {
    kind: "trap",
    title: "Artifacts silently do nothing until you flip one switch",
    body:
      "If you ask for a document or a dashboard and Claude just types the content into the chat instead of opening a side panel, that is not a bad prompt. It's Settings → Capabilities → Code execution and file creation being off. It is the single most common \"Claude can't do that\" complaint on the internet, and it takes eight seconds to fix.",
  },
  checks: [
    "I'm on a plan that includes Cowork — or I've consciously decided to run Days 1–3 on Free and upgrade before Day 6.",
    "The desktop app is installed and signed in on the machine where my real work files live.",
    "Settings → Capabilities has code execution and file creation switched ON.",
    "I ran the setup prompt and Claude has written a profile of me to memory.",
  ],
  nonNegotiable: {
    title: "Non-negotiable",
    body:
      "Do this in a real account, on real work — your actual inbox, your actual Drive folder, your actual client. Every day here ends with something you can send to a person. A sandbox with fake data teaches you where the buttons are and none of the judgement, and judgement is the entire difference between someone who uses Claude and someone who runs on it.",
  },
  ctaLabel: "Camp set — start Day 1",
};

/* ——— reference tables, used in Day 1 and in the field kit ——— */
export const SURFACES: string[][] = [
  ["Chat", "Conversation, writing, analysis, research, quick answers", "You need to think something through or draft text"],
  ["Projects", "A persistent workspace with its own files, instructions and memory", "You keep re-explaining the same background"],
  ["Artifacts", "Standalone outputs — docs, tools, diagrams, charts — in a side panel", "You want something you'll keep, reuse or share"],
  ["Skills", "Reusable written procedures that teach Claude one of your workflows", "You've corrected the same thing three times"],
  ["Connectors (MCP)", "Live links to Gmail, Drive, Slack, Notion, Linear, GitHub, Calendar…", "The answer lives inside another app"],
  ["Plugins", "Skills + connectors + sub-agents bundled for a role", "You want a whole toolkit for sales, finance, legal, HR…"],
  ["Cowork", "An agentic workspace that works across your real files, folders and apps", "The job is many steps and ends in a real file"],
  ["Claude Code", "A coding agent for the terminal, IDE or desktop", "The output is source code"],
  ["Claude Design", "Prototypes, mockups, landing pages, slides, brand work", "The output is looked at, not read"],
  ["Memory", "What Claude remembers across chats, scoped per project", "You're tired of introducing yourself"],
];

export const QUICK_PICKS: [string, string][] = [
  ["Think something through, or draft text", "Chat"],
  ["Same context every time you open a topic", "Project"],
  ["A document, tool or chart you'll keep or share", "Artifact"],
  ["Claude to follow your playbook every time", "Skill"],
  ["Read or write inside another app", "Connector"],
  ["A whole toolkit for your role", "Plugin"],
  ["Multi-step work across real files and apps", "Cowork"],
  ["Writing or shipping software", "Claude Code"],
  ["Visual, brand or prototype work", "Claude Design"],
];

export const UI_MAP: [string, string][] = [
  ["Customize (left sidebar)", "One unified home for Skills, Connectors and Plugins — each with a “+ → Browse” that opens the directory"],
  ["Projects", "Its own sidebar section. Each project holds its own chats, knowledge base, instructions and memory pool"],
  ["Artifacts", "Its own sidebar section, holding everything you or Cowork has ever built"],
  ["Settings → Capabilities", "Code execution and file creation (required for Artifacts), memory, and other features"],
  ["Cowork tab", "Desktop primarily, now also web and mobile — where agentic file and folder sessions run"],
  ["Model picker (in the composer)", "Switch models mid-conversation. Effort / thinking level lives in Settings"],
  ["“+” inside any chat", "The fastest route to attaching a file or enabling a connector without leaving the conversation"],
];

/* ——— the seven days ——— */
export const NOCODE_DAYS: Day[] = [
  /* ————————————————— DAY 1 ————————————————— */
  {
    id: 1,
    code: "MISSION 01",
    title: "The Right Door",
    tagline:
      "Claude is not one product — it's nine surfaces sitting on the same brain, and most frustration is people using the wrong one. Learn the map, then learn the one prompt shape that makes any of them behave.",
    time: "45–60 min",
    rankAfter: "Recruit",
    badge: {
      name: "Surface Literate",
      desc: "Named the right surface for six different jobs without guessing, and turned a genuinely messy input into something you sent to a person.",
    },
    concept: {
      heading: "Chat is the lobby, not the building",
      body: [
        "Nearly everyone who says \"Claude is impressive but I couldn't get it to do real work\" has only ever opened one door: a blank chat box. That is like judging a company by its reception desk.",
        "There are nine surfaces layered on the same models. Chat is for thinking out loud. Projects keep context. Artifacts hold deliverables. Skills teach it your process. Connectors give it your apps. Plugins bundle all three for a role. Cowork does multi-step work across real files. Claude Code writes software. Claude Design does the visual work.",
        "This whole track is one skill repeated seven times: look at a job and know which door to open. Get that right and the prompting barely matters. Get it wrong and no prompt in the world saves you.",
      ],
    },
    drills: [
      {
        id: "n1_map",
        xp: 15,
        title: "Learn the nine surfaces — and the escalation ladder",
        body:
          "Read the table once, then close it and try to say what each one is for. The order matters: it's an escalation ladder, and you climb it only when the rung below stops being enough. Chat for talking something through → Projects to keep that context around → Artifacts for a deliverable you'll reuse → Skills, Connectors and Plugins to make the output match your world → Cowork or Claude Code when the task needs many steps across real files and tools.",
        table: {
          head: ["Surface", "What it's for", "Open it when"],
          rows: SURFACES,
        },
        callout: {
          kind: "edge",
          title: "The one line that settles most arguments",
          body:
            "If the deliverable is source code, it's Claude Code. If it's a document, a spreadsheet or a deck, it's Cowork. Both live inside the same paid plans, so the only real question is what you want to be holding at the end.",
        },
      },
      {
        id: "n1_prompt",
        xp: 15,
        title: "The six-part prompt that works on every surface",
        body:
          "Non-technical people almost always fail at prompting in exactly one way: they give the task and nothing else. A plain prompt with all six parts beats a clever prompt with two, every single time. Write one now for a job you'll genuinely do this week, and save it somewhere you'll find it again.",
        blocks: [
          {
            label: "The six-part shape",
            lang: "prompt",
            code:
              "ROLE         You are a [specific role] with [specific experience].\n\nCONTEXT      Here's the situation: [who, what, why it matters, what's\n             happened so far]. [Attach the real files. Do not describe\n             them — attach them.]\n\nTASK         [One clear outcome. Not three.]\n\nCONSTRAINTS  Must: [...]\n             Never: [...]\n             Length: [...]   Audience: [...]\n\nFORMAT       Give it to me as [a table / a one-page memo / five bullets /\n             an artifact I can share].\n\nEXAMPLE      Here's one we did before that worked: [paste it]",
          },
        ],
        callout: {
          kind: "trap",
          title: "The \"be concise\" trap",
          body:
            "\"Be concise\" makes Claude drop reasoning, not words — you get a short answer that's also a worse one. If you want short output, specify the format and the length (\"a table, four columns, one line per row\") and let it think as long as it likes to fill that table well.",
        },
      },
      {
        id: "n1_thinking",
        xp: 15,
        title: "Drive the model, don't accept the default",
        body:
          "You have two dials most people never touch: which model you're on, and how hard it thinks. Switch models mid-conversation from the picker in the composer — start on Opus for the plan, drop to Haiku for the grunt work. Then find effort / thinking level in Settings and raise it for anything strategic. Ask the same hard question twice, once on each setting, and actually read the difference.",
        table: {
          head: ["Model", "Reach for it when", "Note (Sept 2026)"],
          rows: [
            ["Claude Opus 5", "Strategy, messy analysis, long documents, anything you'll act on", "The heavy lifter"],
            ["Claude Sonnet 5", "Most daily work — drafting, summarising, research", "The default on most plans"],
            ["Claude Haiku 4.5", "Extraction, tidying, bulk formatting, quick lookups", "Fastest and cheapest"],
            ["Mythos 5 / Fable 5", "A tier above Opus; Fable 5 is safety-hardened for biology, cybersecurity and LLM research", "First released 9 June 2026 — check what's on your plan"],
          ],
        },
        callout: {
          kind: "edge",
          title: "Ask to see the thinking, then read it",
          body:
            "On anything consequential, add \"think this through before you answer, and show me your reasoning\". The value isn't the better answer — it's that you can see the assumption it made in step two, which is almost always where a wrong answer was born.",
        },
      },
      {
        id: "n1_deliverable",
        xp: 15,
        title: "Turn a mess into a deliverable — the ugly-input drill",
        body:
          "The real skill isn't writing pretty prompts, it's feeding Claude raw material. Find the ugliest input you own — a 40-minute meeting transcript, a screenshot-filled WhatsApp thread, a CSV export nobody has opened, a 30-page contract. Drop it in with this prompt and watch what a well-scoped ask does with bad input. Turn on web search and let it check anything it's unsure about.",
        blocks: [
          {
            label: "The ugly-input prompt",
            lang: "prompt",
            code:
              "Attached is [what it is and where it came from]. It is messy and incomplete.\n\n1. Tell me what this actually is, in three lines.\n2. Pull out every decision, commitment and deadline, with who owns it.\n3. List what's missing or contradictory — don't smooth over the gaps.\n4. Then give me [the deliverable: the client email / the one-page summary\n   / the action list], written in my voice.\n\nFlag anything you inferred rather than read.",
          },
        ],
      },
    ],
    boss: {
      intro:
        "Pick one real job from your actual week. Do the whole thing in Claude, on a surface you chose deliberately — and be able to say out loud why that surface and not another one.",
      checks: [
        "I can name all nine surfaces and what each is for, without looking at the table.",
        "I have a six-part prompt written down and saved, not improvised in the moment.",
        "I ran the same question on two different models and can describe how the answers differed.",
        "I fed Claude a genuinely messy real input and got back something I sent to a person.",
      ],
      xp: 40,
    },
    side: {
      text:
        "Open the model picker mid-conversation on a long thread and drop from Opus to Haiku. Notice the speed, and notice what goes missing. Knowing exactly what you lose is how you know when the expensive model is worth it — and when it isn't.",
      xp: 30,
    },
    founder:
      "Day 1's business value is the audit, not the output. Write down the five tasks that ate the most hours in your last two weeks and put a surface name next to each one. By Day 7 you'll have moved at least three of them off your plate — but only if you wrote them down today.",
  },

  /* ————————————————— DAY 2 ————————————————— */
  {
    id: 2,
    code: "MISSION 02",
    title: "The Company Brain",
    tagline:
      "Stop re-explaining your business every single morning. A Project gives Claude a permanent, self-updating memory of who you are, who you serve and how you write.",
    time: "60 min",
    rankAfter: "Technician",
    badge: {
      name: "Second Brain",
      desc: "Built a project that passes the cold-start test — on-brand, factually right output from a brand-new chat with nothing pasted in.",
    },
    concept: {
      heading: "Context you don't have to carry",
      body: [
        "Count how many times you've pasted the same \"we're a [X] company serving [Y], our tone is [Z]\" preamble into a chat. That paste is a tax you pay on every conversation, and it's the single biggest reason chat-only users plateau.",
        "A Project is a self-contained workspace: its own chat history, its own knowledge base of files, its own instructions, and its own memory pool kept separate from your general chats. Every chat you start inside it already knows all of that.",
        "Two things make it compound. It can sync to a Google Drive folder or a GitHub repo, so the knowledge base updates itself. And you can start a Cowork session from inside a project — so on Day 6, the agent doing your actual work already knows your business.",
      ],
    },
    drills: [
      {
        id: "n2_three",
        xp: 15,
        title: "Create three projects, not one",
        body:
          "One giant \"work\" project is the most common mistake people make — it blends contexts and the output comes out vague. Free accounts get up to five projects; paid plans get more. Start with exactly these three and the reason separation matters will be obvious within a day.",
        table: {
          head: ["Project", "Knowledge base holds", "You'll use it for"],
          rows: [
            ["Company Brain", "Offer, pricing, ICP, positioning, tone-of-voice guide, three best past deliverables", "Anything about the business as a whole"],
            ["Client / Account: [name]", "Their brief, contracts, notes, past deliverables, their tone", "Everything for that one account"],
            ["Content Engine", "Your ten best posts, your banned-words list, audience notes, hook formats", "Writing that has to sound like you"],
          ],
        },
      },
      {
        id: "n2_instructions",
        xp: 15,
        title: "Write project instructions — the highest-leverage 200 words of your year",
        body:
          "Instructions are the standing orders for every chat inside that project. Be blunt and specific: vague instructions produce vague output, and \"be professional\" means nothing to anyone. Use this template and fill in every bracket properly — the brackets are the whole point.",
        blocks: [
          {
            label: "Project instructions",
            lang: "md",
            code:
              "# Who I am\n[Company, what we sell, who buys it, what makes us different — one line each.]\n\n# Who you are in this project\nYou are my [role]. You have [experience]. You care most about [outcome].\n\n# How I write\n- [Sentence length, formality, British or US spelling]\n- Never use: [the words and phrases you hate]\n- Always: [your signature habits — lead with the number, end with one ask]\n\n# Standing rules\n- Ask before assuming a fact about our pricing, clients or numbers.\n- If the knowledge base doesn't answer it, say so instead of inventing.\n- Default output format: [what you want 80% of the time].\n\n# What \"good\" looks like\n[Point at the file in the knowledge base that is your gold standard.]",
          },
        ],
      },
      {
        id: "n2_kb",
        xp: 15,
        title: "Load the knowledge base — and be ruthless about what goes in",
        body:
          "The knowledge base is background context for every chat in that project, which means junk in it costs you on every single message. Upload your best three examples of each deliverable, not your last thirty. The test: if you wouldn't hand a document to a new hire on day one, don't upload it.",
        callout: {
          kind: "trap",
          title: "More files is not more knowledge",
          body:
            "Ten sharp documents beat a hundred mediocre ones. A knowledge base stuffed with outdated decks, duplicate drafts and half-finished notes produces confidently wrong answers, because Claude cannot tell which version you meant. Delete aggressively, and put a date in the filename of everything you keep.",
        },
      },
      {
        id: "n2_sync",
        xp: 15,
        title: "Make it self-updating",
        body:
          "Connect the project to a Google Drive folder or a GitHub repo and the knowledge base refreshes itself as those files change. This is the entire difference between a project that decays in three weeks and one that's still right in six months. Create a single Drive folder named \"Claude — [project]\", sync it, and from now on treat that folder as the source of truth.",
      },
      {
        id: "n2_memory",
        xp: 15,
        title: "Take control of memory",
        body:
          "Memory is what stops you reintroducing yourself every morning. It's project-scoped — each project keeps its own separate pool — and it's fully yours: you can view, edit and delete anything Claude has remembered. Go and read yours now; most people are surprised by what's in there and by what's wrong. And when you're working on something you don't want retained, start an incognito chat: it never saves to memory and doesn't appear in your history.",
        callout: {
          kind: "edge",
          title: "Memory rolled out in waves",
          body:
            "Availability depends on your plan and your organisation's settings — Team and Enterprise first, then Pro and Max, then wider. If you don't see it yet, put the same facts in your project instructions. That's exactly what they're for, and they're arguably more reliable anyway because you can read them.",
        },
      },
    ],
    boss: {
      intro:
        "The cold-start test. Open a brand-new chat inside your Company Brain project and ask for a real deliverable without pasting a single line of background. If it comes out on-brand and factually right, your project is real. If it comes out generic, your instructions are too vague — go and fix them, then run it again.",
      checks: [
        "Three projects exist, each with instructions I wrote myself.",
        "Each knowledge base holds only documents I'd hand a new hire on day one.",
        "At least one project syncs to a Drive folder or a GitHub repo.",
        "A brand-new chat in a project produced on-brand output with zero pasted context.",
        "I've opened my memory, read it, and deleted at least one thing that was wrong.",
      ],
      xp: 50,
    },
    side: {
      text:
        "Write the tone-of-voice document you keep meaning to write — the lazy way. Paste your ten best pieces of writing into a chat and ask Claude to reverse-engineer the rules: sentence length, punctuation habits, words you over-use, things you never do. Edit what comes back and upload it as your voice guide.",
      xp: 30,
    },
    founder:
      "This is the day that pays for the course. Every hour your team spends re-briefing an AI is an hour of margin. Build the Company Brain project once, then share its instructions document with everyone who writes anything for you — including the people who don't use Claude. It doubles as the onboarding doc you never wrote.",
  },

  /* ————————————————— DAY 3 ————————————————— */
  {
    id: 3,
    code: "MISSION 03",
    title: "Things You Keep",
    tagline:
      "Chat is disposable. Artifacts are assets. Make Claude produce a real document, a working tool, a live dashboard or a diagram — one you can edit, version, publish and send.",
    time: "60–75 min",
    rankAfter: "Operator",
    badge: {
      name: "Asset Builder",
      desc: "Shipped four artifacts, including one published and used by a real person who wasn't you.",
    },
    concept: {
      heading: "Output you can put a link on",
      body: [
        "When Claude produces something substantial — a document, an HTML page, an SVG, a Mermaid diagram, a chart, a small app — it opens in a dedicated panel next to the chat instead of being buried in the conversation. That's an Artifact, and it is the closest thing to \"Claude built me software\" that requires zero coding.",
        "Three things make artifacts different from a long chat answer: you can edit them in place by highlighting a section and describing the change, they're kept in an Artifacts library in the sidebar, and on a personal account you can publish one as a link and send it to someone. (Publishing isn't available on Team and Enterprise accounts.)",
        "The advanced move: connect an artifact to your connectors via MCP so it pulls live data instead of a snapshot. That's a dashboard, built by describing it in English.",
      ],
    },
    drills: [
      {
        id: "n3_four",
        xp: 20,
        title: "Turn it on, then build four different shapes",
        body:
          "First confirm Settings → Capabilities → code execution and file creation is on, or none of this works. Then build all four of these today. Different shapes teach you different limits, and the fourth one surprises almost everybody.",
        blocks: [
          {
            label: "Four artifacts, four prompts",
            lang: "prompt",
            code:
              "1 — THE DOCUMENT\nTurn this into a one-page client-ready proposal as an artifact. Sections:\nthe problem, what we'll do, timeline, price, what we need from you.\n\n2 — THE TOOL\nBuild me an artifact: a pricing calculator where I set hours, rate and\nmargin with sliders, and it shows the quote and my profit. No login,\nworks on a phone.\n\n3 — THE DASHBOARD\nHere's my CSV. Build an artifact that charts revenue by month and by\nclient, with a filter for the year. Highlight anything that dropped more\nthan 20% month over month.\n\n4 — THE DIAGRAM\nDraw our client onboarding as a flowchart artifact, from first enquiry to\nfirst invoice paid. Mark every step where a human has to do something.",
          },
        ],
      },
      {
        id: "n3_edit",
        xp: 20,
        title: "Edit in place — stop regenerating",
        body:
          "The amateur move is \"that's not quite right, try again\", which gets you a whole new version with a whole new set of problems. The professional move is to highlight the specific part in the artifact panel and describe only that change. Do it five times on one artifact: change a heading, swap a colour, reword one paragraph, add a column, delete a section. Then find the version history and roll one back.",
        callout: {
          kind: "edge",
          title: "Ask for the change, not the file",
          body:
            "\"Make the third column right-aligned and add a total row\" gets you a surgical edit. \"Can you redo the table\" gets you a new table with new mistakes. The narrower the instruction, the less collateral damage — this is the single habit that separates people who enjoy artifacts from people who give up on them.",
        },
      },
      {
        id: "n3_publish",
        xp: 20,
        title: "Publish it and put it in someone's hands",
        body:
          "An artifact nobody opens is just a screenshot. On a personal account you can publish an artifact as a shareable link — send today's calculator to a colleague and watch them use it. If you're on Team or Enterprise, publishing isn't available, so export instead and note the difference in how it lands. The Artifacts section in the sidebar is your library: everything you or Cowork has ever built lives there, so go and name things properly now rather than in six months.",
      },
      {
        id: "n3_live",
        xp: 15,
        title: "Make one artifact live",
        body:
          "Static artifacts are useful. Connected ones are a product. On Pro, Max, Team and Enterprise (web and desktop) an artifact can be connected to external services via MCP so it pulls real data. Build the shell today and wire it to a connector on Day 4 — or point it at one you already have.",
        callout: {
          kind: "trap",
          title: "A shared live artifact sees the viewer's data, not yours",
          body:
            "When you share a live artifact inside your organisation, it runs on the viewer's own connector access. That's a safety feature, not a bug — they see their data rather than yours. It also means a dashboard that works perfectly for you can look completely empty to a colleague who hasn't connected the same app, which is confusing right up until you know it.",
        },
      },
    ],
    boss: {
      intro:
        "Four artifacts, one of them in someone else's hands. Screenshot-and-paste doesn't count — they need the link, and they need to have actually used it.",
      checks: [
        "Code execution and file creation is ON, and I know that's what makes artifacts appear at all.",
        "A document, a working tool, a chart-based dashboard and a diagram all exist in my Artifacts library.",
        "I edited one artifact five times in place, and rolled back a version.",
        "A real person has opened one of my published artifacts and used it.",
      ],
      xp: 50,
    },
    side: {
      text:
        "Rebuild something you currently pay for. A spreadsheet template, an internal calculator, a form, a checklist app, a simple tracker — ask for it as an artifact and see how close ten minutes gets you. Most people cancel at least one subscription a year because of this drill.",
      xp: 35,
    },
    founder:
      "Artifacts are the fastest way to look expensive in a sales conversation. Build the prospect's calculator or dashboard live on the call, with their numbers in it, and send them the link before you hang up. It costs four minutes and it closes deals, because you demonstrated instead of promising.",
  },

  /* ————————————————— DAY 4 ————————————————— */
  {
    id: 4,
    code: "MISSION 04",
    title: "Plug It In",
    tagline:
      "Claude stops being a clever stranger the moment it can see your inbox, your Drive and your Slack. Connectors are MCP for people who never want to look at a config file.",
    time: "75 min",
    rankAfter: "Foreman",
    badge: {
      name: "Wired In",
      desc: "Ran a real cross-app workflow — read from one system, decided something, wrote into another — inside a single conversation.",
    },
    concept: {
      heading: "The answer is usually in another tab",
      body: [
        "Most business questions aren't hard, they're just scattered. Half the answer is in an email, a quarter in a spreadsheet nobody's opened since April, and the rest in a Slack thread from March. You've been doing the gathering by hand and pasting it in.",
        "Connectors give Claude live access to those services — Gmail, Google Drive, Slack, Notion, Linear, GitHub, Calendar and many more — through the Model Context Protocol. With one enabled, Claude can search your Drive, draft a Slack message or create a Linear issue directly from the conversation.",
        "And they work everywhere: Chat, Cowork, Claude Code and the API. Set one up once and it's available on every surface you learned on Day 1.",
      ],
    },
    drills: [
      {
        id: "n4_connect",
        xp: 25,
        title: "Connect three — and only three",
        body:
          "Go to Customize → Connectors in the sidebar, or hit the \"+\" button inside a chat. Connect the three apps where your work actually lives — for most founders that's email, file storage and team chat. Then stop. Resist connecting everything you recognise.",
        callout: {
          kind: "trap",
          title: "Don't connect what you won't use this week",
          body:
            "An unused connector isn't free. Its tool definitions load on every turn whether you use them or not, and a cluttered tool list makes Claude pick the wrong one — which reads to you as \"it's got worse\". Connect three, live with them for a week, then earn the fourth.",
        },
      },
      {
        id: "n4_ladder",
        xp: 25,
        title: "Work the read → draft → send ladder",
        body:
          "Never give an AI write access to a live system on day one. Climb the ladder deliberately, and only move up a rung when the one below it has been boring for a week. Run one prompt at each rung today, including rung four — even if you only leave it in place for an hour.",
        table: {
          head: ["Rung", "What you allow", "The prompt to try"],
          rows: [
            ["1 · Read", "Search and summarise only", "\"Search my Drive for everything about the [X] account and give me a one-page brief.\""],
            ["2 · Draft", "Produces output you copy across by hand", "\"Read the last 20 emails from [client] and draft the follow-up. Don't send it.\""],
            ["3 · Send, with approval", "Claude acts, you confirm each time", "\"Draft replies to every unanswered email older than three days. Show me each one before sending.\""],
            ["4 · Standing authority", "Narrow, rule-bound, recurring", "\"Every Monday, post the week's numbers to #general. Nothing else, ever.\""],
          ],
        },
      },
      {
        id: "n4_workflows",
        xp: 20,
        title: "Three workflows that pay for the plan on their own",
        body:
          "Run all three today with your real data, not examples. Each replaces a job you currently do by hand, and each is a thing you'll later hand to a Skill on Day 5 or to Cowork on Day 6 — so the time isn't spent twice.",
        blocks: [
          {
            label: "The three",
            lang: "prompt",
            code:
              "INBOX TRIAGE\nGo through everything in my inbox since Friday. Group it into: needs me\ntoday, needs me this week, someone else's job, and noise. For the first\ngroup, draft a reply each. Tell me what I'm at risk of dropping.\n\nTHE ACCOUNT BRIEF\nSearch my Drive, email and Slack for everything about [client]. Build me\na brief: where we are, what we promised, what's overdue, what they've\ncomplained about, and the three things I should raise on Thursday's call.\n\nTHE WEEKLY DIGEST\nRead #[channel] for the last seven days. Summarise decisions made,\nquestions still open, and anything that contradicts what we agreed\nearlier. Post it back to the channel as a thread.",
          },
        ],
      },
      {
        id: "n4_bridge",
        xp: 20,
        title: "Bridge the gap for apps with no native connector",
        body:
          "Not everything has a first-party connector. Zapier's MCP connection reaches roughly 9,000 apps — your CRM, your invoicing tool, your booking system — and once set up it behaves like any other connector. Wire up the one tool you use daily that isn't on Anthropic's list, then run a read-only prompt against it before you trust it with anything.",
        callout: {
          kind: "edge",
          title: "Ask what it can actually see",
          body:
            "Before you trust a connector with anything real, ask: \"Using only the [X] connector, tell me exactly what you can and cannot access in my account.\" You'll learn its real scope in thirty seconds — which is a much better time to learn it than halfway through a client call.",
        },
      },
    ],
    boss: {
      intro:
        "One conversation, three apps, one finished outcome. Read from one system, decide something, write into another — and then go and check the result in the destination app with your own eyes.",
      checks: [
        "Three connectors are live and I can name what each one can and can't see.",
        "I've run a prompt at every rung of the read → draft → send ladder.",
        "One conversation pulled from at least two apps and produced a single brief.",
        "Claude wrote something into another app — a draft, a message, an issue — and I verified it landed.",
      ],
      xp: 60,
    },
    side: {
      text:
        "Do the security pass. Open your connector settings and answer in writing: if this account were compromised tomorrow, what could someone reach through these connectors? Then remove the one that scared you most. Founders who skip this drill find out the answer the expensive way.",
      xp: 35,
    },
    founder:
      "This is the day you can sell. \"Connected AI briefings\" is a real service: you set up a client's connectors, write their three standing prompts, and hand them a Monday-morning digest that used to take their ops person two hours. Price it monthly, deliver it in an afternoon.",
  },

  /* ————————————————— DAY 5 ————————————————— */
  {
    id: 5,
    code: "MISSION 05",
    title: "Teach It Once",
    tagline:
      "If you're explaining the same process for the third time, you've found a Skill. Package your expertise into something Claude follows automatically — and install other people's.",
    time: "75 min",
    rankAfter: "Commander",
    badge: {
      name: "Process Packager",
      desc: "Wrote a skill in plain English that somebody else ran and got your standard output from.",
    },
    concept: {
      heading: "The difference between a prompt and a process",
      body: [
        "A prompt is a request. A Skill is a written-out procedure — \"here's how we do this job, the way we do it\" — that Claude pulls in automatically when it's relevant, instead of you re-explaining it every time.",
        "This is the moment a lot of non-technical people realise they've been doing knowledge work that was never really bespoke. Your proposal process, your client onboarding, your content review, your monthly report: those are procedures you carry in your head and re-explain badly under pressure.",
        "Skills work everywhere Claude does — chat, Cowork, Claude Code — which is what makes them different from Projects, which only apply inside their own project. Write it once and it's with you on every surface.",
      ],
    },
    drills: [
      {
        id: "n5_install",
        xp: 30,
        title: "Install a directory skill and read how it's built",
        body:
          "Go to Customize → Skills and browse the directory. There are pre-built skills there, including partner ones from companies like Notion, Figma and Atlassian designed to work with those companies' connectors. Install one that matches an app you connected yesterday, use it on something real, then open it and read how it's written. Installed directory skills are view-only — if you want to change one, copy it first and modify your copy.",
      },
      {
        id: "n5_write",
        xp: 30,
        title: "Write your own — in plain English, no code anywhere",
        body:
          "Pick the process you've explained most often this year. Write it out with this template. The critical part is not the steps — it's the \"what good looks like\" and \"never\" sections, because that's the judgement you've been carrying that nobody ever wrote down.",
        blocks: [
          {
            label: "Skill template — write this in a document and upload it",
            lang: "md",
            code:
              "# Skill: [Name — say what job it does, e.g. \"Client Proposal\"]\n\n## When to use this\nUse when I ask for [trigger phrases]. Don't use for [the near-miss cases].\n\n## What you need before starting\n- [Input 1 — and where to find it]\n- [Input 2]\nIf any of these are missing, ask me. Do not guess.\n\n## The steps\n1. [Step, with the actual detail — not \"draft it\", but how]\n2. [Step]\n3. [Step]\n\n## What good looks like\n[Describe it. Point at an example. Be specific about length, tone, structure.]\n\n## Never\n- [The mistake you've had to correct before]\n- [The thing that would embarrass us in front of a client]\n\n## Output\nReturn [exact format]. Then ask me [the one question that catches errors].",
          },
        ],
        callout: {
          kind: "edge",
          title: "Let Claude write the skill by watching you",
          body:
            "Much faster than writing it cold: do the job once in a normal chat, correcting Claude as you go. Then say — \"Turn this conversation into a reusable skill. Include every correction I made as an explicit rule, and mark the places where you had to ask me for information.\" Edit what comes back. It's 80% right and it took four minutes.",
        },
      },
      {
        id: "n5_plugins",
        xp: 30,
        title: "Install a plugin — someone else's entire toolkit",
        body:
          "A plugin bundles skills, connectors and sub-agents into one ready-made package for a function — sales, finance, legal, marketing, HR, engineering, design, ops, data analysis — so you're not configuring each piece separately. Available on all paid plans. Browse Customize → Plugins, install the one closest to your role, and use it on a live task before you form an opinion. There's also Plugin Create, a plugin for building your own.",
        callout: {
          kind: "trap",
          title: "A plugin is not a strategy",
          body:
            "Installing five plugins because they sound useful gives you a bloated, confused Claude that's worse than the plain one. Install one. Use it for a week. Keep it only if you can name the specific thing it does better than you did before. On Team and Enterprise, admins can control what's available by role — a feature that exists precisely because of this failure mode.",
        },
      },
    ],
    boss: {
      intro:
        "The handoff test. A skill isn't real until somebody who isn't you can get your standard output from it. Hand it to a colleague — or to yourself on a different device in a completely fresh chat — and see whether it holds up without you in the room.",
      checks: [
        "A directory skill is installed and I've used it on a real task.",
        "A skill I wrote exists, with a \"never\" section and a \"what good looks like\" section.",
        "I used a real chat transcript to have Claude draft one skill for me, then edited it.",
        "Someone other than me ran my skill and got output I'd have been happy to send.",
      ],
      xp: 60,
    },
    side: {
      text:
        "Audit your own week for skill candidates. Any process you've explained more than twice, or that has a \"yes, but not like that\" correction attached to it, is a skill waiting to be written. List five. Then write the second-most-annoying one — save the most annoying for when you're better at this.",
      xp: 40,
    },
    founder:
      "Skills are the productisable asset in this whole track. A client doesn't want \"AI training\" — they want their proposal process, their reporting pack and their onboarding to run without their best person doing it by hand. That's three skills and an afternoon, and it is worth considerably more than an hourly rate.",
  },

  /* ————————————————— DAY 6 ————————————————— */
  {
    id: 6,
    code: "MISSION 06",
    title: "The AI Coworker",
    tagline:
      "The biggest unlock for people who don't code. Not a chat that describes the work — an agent that opens your folder, does the multi-step job and hands you the finished Excel model, deck or document.",
    time: "90 min",
    rankAfter: "Architect",
    badge: {
      name: "Coworker",
      desc: "Shipped a real business deliverable produced end to end by Cowork — from a folder of raw inputs to a finished file somebody received.",
    },
    concept: {
      heading: "It works in the folder, not in the chat",
      body: [
        "Everything up to now has been you asking and Claude answering. Cowork is different in kind: you describe the goal and grant it a scoped folder, it proposes a plan, you approve, and it executes step by step — showing you every file it opens and every choice it makes. Large jobs get split across parallel sub-agents.",
        "What comes out is not a description of a spreadsheet. It's a real Excel file with working formulas. A formatted Word document. A PowerPoint deck. A cleaned dataset. It runs on desktop, web and mobile, with sessions resumable across devices.",
        "The rule that keeps this simple: if the output is source code, that's Claude Code. If it's documents, spreadsheets or decks, that's Cowork. Both are inside the same paid plans, so the only question is what you want to be holding at the end.",
      ],
    },
    drills: [
      {
        id: "n6_first",
        xp: 35,
        title: "Your first session — scope it, read the plan, watch it work",
        body:
          "File access is opt-in and scoped: you grant Cowork one specific folder and it won't touch anything outside it. Make a folder called \"cowork-01\", put genuinely real raw inputs in it — exports, notes, a messy spreadsheet, a PDF or two — and run the brief below. Then read the plan properly before you approve it. This is the one step people skip and then complain about the result.",
        blocks: [
          {
            label: "The Cowork brief",
            lang: "prompt",
            code:
              "GOAL       [The finished thing. Name the file type. \"A client-ready Excel\n           model\", not \"help me with the numbers\".]\n\nINPUTS     Everything you need is in this folder. [Say what each file is\n           and which ones are authoritative.]\n\nSTEPS      I expect roughly: [your rough shape of the work].\n           Tell me if you'd do it differently.\n\nRULES      Never overwrite an input file — write new files.\n           If a number is missing, flag it. Do not estimate silently.\n           Stop and show me after [step N] before continuing.\n\nDONE WHEN  [The check you'd apply if a junior handed this to you.]",
          },
        ],
        callout: {
          kind: "trap",
          title: "Approving the plan without reading it",
          body:
            "The plan step is not a formality — it's the one place a wrong assumption is cheap to fix. If the plan says \"consolidate the three exports into one sheet\" and you actually wanted them kept separate, that costs five seconds now and twenty minutes after it's built. Read it the way you'd read a junior's approach before they spend a day on it.",
        },
      },
      {
        id: "n6_deliverables",
        xp: 35,
        title: "Produce all four output types",
        body:
          "Different formats fail in different ways, and you need to know how each behaves before you rely on one for something that matters. Do all four this week — at least two of them today, and check them the way the table says, not by glancing at them.",
        table: {
          head: ["Output", "A real job to try", "What to actually check"],
          rows: [
            ["Excel model", "Turn 12 months of exports into a P&L with month-on-month and a summary tab", "Open it — are the formulas live, or are they pasted values?"],
            ["Word document", "Turn a messy brief and three sets of notes into a formatted client proposal", "Headings, numbering, styles — does it survive being edited by someone else?"],
            ["PowerPoint deck", "Turn that proposal into a ten-slide pitch with a consistent look", "Does the story hold up if you read only the slide titles?"],
            ["Cleaned dataset", "Deduplicate, normalise and merge two ugly CSV exports", "Spot-check ten rows by hand. Always. Every time."],
          ],
        },
      },
      {
        id: "n6_live",
        xp: 35,
        title: "Live artifacts, and work that runs without you",
        body:
          "Two capabilities that turn Cowork from a helper into infrastructure. Live artifacts are dashboards and trackers built inside Cowork that stay connected to your real connectors and refresh with new data — \"build me a tracker of my top five competitors' pricing changes\" is a real prompt that works. And remote / scheduled sessions (in beta) keep working server-side even with your device closed, and can run on a recurring schedule with nobody watching. Build one live artifact today and schedule one recurring job.",
        callout: {
          kind: "trap",
          title: "Two limits worth knowing before you depend on these",
          body:
            "Live artifacts currently live on the device that created them and don't roam across your devices — so build the one that matters on the machine you actually work on. And a live artifact shared inside your org runs on the viewer's connector access, not yours, so a colleague may legitimately see less than you do.",
        },
      },
    ],
    boss: {
      intro:
        "One real deliverable, produced end to end by Cowork, that leaves your machine. Not a demo and not a test file — something a client, your accountant, your team or your board actually receives.",
      checks: [
        "Cowork has a scoped folder, and I know it can't touch anything outside it.",
        "I read a plan, changed something in it, and then approved it.",
        "At least two of the four output types exist as real files I opened and checked properly.",
        "One live artifact exists and has refreshed with new data at least once.",
        "A deliverable Cowork produced has been sent to a real person.",
      ],
      xp: 70,
    },
    side: {
      text:
        "Start a Cowork session from inside one of your Day 2 projects, so it inherits that project's knowledge base and instructions. Run the same brief you ran outside a project and compare the two outputs side by side. This is the moment the whole system clicks together.",
      xp: 40,
    },
    founder:
      "Cowork is where the hours actually come back. Take the recurring deliverable that eats your month — the client report, the board pack, the monthly reconciliation — and rebuild it as a Cowork brief plus a scheduled session. You spend one morning on it, once, and then get that morning back every month for the rest of the business's life.",
  },

  /* ————————————————— DAY 7 ————————————————— */
  {
    id: 7,
    code: "MISSION 07",
    title: "Claude Everywhere",
    tagline:
      "Stop going to Claude. Put Claude where the work already is — inside Excel, Word, PowerPoint, Outlook, Chrome and Slack — then turn the whole week into an operation that runs without you.",
    time: "90 min",
    rankAfter: "Chief of Staff",
    badge: {
      name: "The Operator",
      desc: "Three recurring jobs now run through a named surface, with a written process anyone on the team could follow.",
    },
    concept: {
      heading: "The best interface is the one you're already in",
      body: [
        "There's a tax on switching apps, and it's bigger than it looks: you don't just lose the seconds, you lose the thread. The last surfaces to learn are the ones that remove the switch entirely.",
        "Claude now lives inside Excel, PowerPoint, Word and Outlook; it browses the web for you through Chrome; and you can tag @Claude in Slack to hand it a job straight from a channel. Claude Design handles the visual half — landing pages, mockups, one-pagers, slides — with a reusable design system so everything stays on brand.",
        "The last step of this track isn't a feature. It's turning what you've built into an operation with a written process behind it, so it survives you being busy, ill, or on holiday.",
      ],
    },
    drills: [
      {
        id: "n7_office",
        xp: 30,
        title: "Put it inside the apps you already have open",
        body:
          "Turn on the ones that match your week and use each at least once today. These aren't \"copy the answer back across\" — Claude works inside the document itself.",
        table: {
          head: ["Where", "What it does there", "First thing to try"],
          rows: [
            ["Claude for Excel", "Formulas, cleanup and modelling directly in the spreadsheet", "\"Explain what this sheet actually calculates, then find the three cells most likely to be wrong.\""],
            ["Claude for PowerPoint", "Turns an idea or a script into a slide deck", "\"Turn this one-page memo into eight slides with speaker notes.\""],
            ["Claude for Word", "Drafting and editing inside Word", "\"Tighten this to 400 words without losing a single commitment or date.\""],
            ["Claude for Outlook", "Inbox triage, drafting replies, scheduling across calendars", "\"Triage today's inbox, then find me 90 minutes of deep work this week.\""],
          ],
        },
      },
      {
        id: "n7_chrome",
        xp: 25,
        title: "Claude in Chrome — hands on the web",
        body:
          "The Chrome extension is a browsing agent: it can navigate, click and fill out forms on your behalf. Use it for web work that's genuinely mechanical — pulling structured details off twenty supplier pages, filling a long application form from a document you already have, checking a competitor's pricing page every week. Start it on something with no consequences and watch every step.",
        callout: {
          kind: "trap",
          title: "Watch the first ten minutes, every time",
          body:
            "A browsing agent acts inside your logged-in session. That's exactly why it's useful and exactly why you supervise the first run of any new task. Never point it at something that spends money, sends messages or deletes records until you've watched it do the harmless version end to end.",
        },
      },
      {
        id: "n7_slack",
        xp: 25,
        title: "Delegate from where your team already talks",
        body:
          "With Claude Tag you can tag @Claude directly in Slack and hand it a task from a channel — no app switch, and the whole team sees both the request and the result, which quietly teaches everyone how to use it. Set it up on one channel and use it three times today: summarise a long thread, answer a question your knowledge base can answer, and turn a decision into a written action list.",
      },
      {
        id: "n7_design",
        xp: 25,
        title: "Claude Design — the visual half",
        body:
          "Landing pages, mockups, one-pagers, slides — Claude Design is the surface for anything whose output is looked at rather than read. The part worth your time is the design system: set your colours, type and components once, and everything stays on-brand across projects instead of looking like a different company each time. Set yours up now, then produce one real thing with it.",
      },
    ],
    boss: {
      intro:
        "Turn the week into an operation. Pick your three most repetitive recurring jobs and, for each one, write down four things: which surface runs it, the exact prompt or skill, what triggers it, and how you know it worked. Then run all three through the new process once.",
      checks: [
        "Claude is live inside at least two of Excel, Word, PowerPoint or Outlook, and I've used each on real work.",
        "Claude in Chrome has completed one mechanical web task that I watched end to end.",
        "@Claude has been used in a real Slack channel by someone other than me.",
        "A design system exists in Claude Design and one on-brand deliverable came out of it.",
        "Three recurring jobs each have a named surface, a written prompt or skill, a trigger and a success check.",
      ],
      xp: 70,
    },
    side: {
      text:
        "Write the one-page \"how we use Claude here\" document and give it to your team: which surface for which job, what's connected, what's off-limits, and who to ask. Ninety percent of companies with Claude have no such document, which is exactly why their rollout quietly dies in month two.",
      xp: 40,
    },
    founder:
      "You now have something more valuable than skill: a documented operating system. Price the outcome, not the hours — a client doesn't want \"AI consulting\", they want their weekly report to arrive without their ops manager building it. Sell the three processes you just wrote, delivered as their setup, on a monthly retainer that reflects the hours you handed back.",
  },
];

/* ——— Appendix: prompt vault ——— */
export const NOCODE_PROMPTS: { n: number; title: string; code: string }[] = [
  {
    n: 1,
    title: "The one-time setup",
    code:
      "I'm setting you up as my working partner, so learn me once.\nMe: [role, company, what we sell, to whom]. My week: [the five time sinks].\nMy voice: [how I write]. My tools: [what you'd need to touch].\nAsk me the six questions that would most improve how well you work for me,\nthen write a profile of me and save it to memory.",
  },
  {
    n: 2,
    title: "Ugly input → deliverable",
    code:
      "Attached is [what it is and where it came from]. It's messy and incomplete.\n1. What is this actually, in three lines?\n2. Every decision, commitment and deadline, with who owns it.\n3. What's missing or contradictory — don't smooth over the gaps.\n4. Then give me [the deliverable], in my voice.\nFlag anything you inferred rather than read.",
  },
  {
    n: 3,
    title: "The cold-start test",
    code:
      "Without me pasting any background: draft [the deliverable] for [client].\nUse only what's in this project. List every fact you had to assume, and\nevery place the knowledge base didn't answer the question.",
  },
  {
    n: 4,
    title: "Reverse-engineer my voice",
    code:
      "Here are ten things I've written that I'm happy with. Reverse-engineer\nthe rules: sentence length, structure, punctuation habits, words I\nover-use, things I never do, how I open and how I close.\nWrite it as a style guide someone else could follow.",
  },
  {
    n: 5,
    title: "The artifact brief",
    code:
      "Build this as an artifact: [what it is]. It must [the one job it does].\nAudience: [who]. It has to work on a phone, with no login.\nUse [my data / this CSV]. Keep it to one screen if you can.\nWhen it's built, tell me the three things most likely to break.",
  },
  {
    n: 6,
    title: "Surgical artifact edit",
    code:
      "In the artifact, change only this: [the exact element].\nMake it [the exact change]. Don't touch anything else, don't restructure,\nand don't 'improve' anything I didn't ask about.",
  },
  {
    n: 7,
    title: "What can you actually see?",
    code:
      "Using only the [X] connector, tell me exactly what you can and cannot\naccess in my account. Be specific about scope, date range and permissions.\nThen tell me the one thing I probably assume you can do that you can't.",
  },
  {
    n: 8,
    title: "The account brief",
    code:
      "Search my Drive, email and Slack for everything about [client].\nBuild a brief: where we are, what we promised, what's overdue, what\nthey've complained about, and the three things I should raise on the\ncall. Cite where each fact came from.",
  },
  {
    n: 9,
    title: "Inbox triage",
    code:
      "Go through everything in my inbox since [date]. Group into: needs me\ntoday, needs me this week, someone else's job, noise. Draft a reply for\neverything in the first group. Then tell me what I'm at risk of dropping.",
  },
  {
    n: 10,
    title: "Turn this chat into a skill",
    code:
      "Turn this conversation into a reusable skill. Include every correction I\nmade as an explicit rule. Mark the points where you had to ask me for\ninformation — those become the required inputs. Add a 'Never' section\nfrom the things I told you not to do.",
  },
  {
    n: 11,
    title: "The Cowork brief",
    code:
      "GOAL: [the finished file, named by type].\nINPUTS: everything is in this folder — [what each file is].\nRULES: never overwrite an input; flag missing numbers rather than\nestimating; stop and show me after step [N].\nDONE WHEN: [the check a reviewer would apply].\nPropose the plan first. I'll approve before you start.",
  },
  {
    n: 12,
    title: "Argue against this",
    code:
      "Argue against this [plan / document / price]. Give me the three\nstrongest objections a sceptical [client / CFO / investor] would raise,\nthen tell me which one you think is actually right and what I should\nchange because of it.",
  },
  {
    n: 13,
    title: "The decision memo",
    code:
      "I have to decide [X] by [date]. First ask me the five questions you need\nanswered. Then give me a one-page memo: the options, what each costs,\nwhat I'd be betting on in each case, your recommendation — and the\nreason your recommendation might be wrong.",
  },
  {
    n: 14,
    title: "The process write-up",
    code:
      "Write the SOP for [the job we just did], for someone who has never done\nit. Include: which Claude surface to use, the exact prompt or skill, what\ntriggers it, what good output looks like, and the two mistakes a first\ntimer will make. One page.",
  },
];

/* ——— Appendix: templates ——— */
export const WORKSPACE_TREE = `Claude — [your business]/          ← one Drive folder, synced to your project
├── 00-brain/
│   ├── offer-and-pricing.md       # what we sell, to whom, for how much
│   ├── icp-and-positioning.md     # who buys, why, and who doesn't
│   └── voice-guide.md             # reverse-engineered from your best writing
├── 01-gold-standard/              # the 3 best examples of each deliverable
│   ├── proposal-2026-03.pdf
│   ├── monthly-report-best.xlsx
│   └── onboarding-email-best.md
├── 02-clients/
│   └── [client]/                  # brief, contract, notes, past work
├── 03-skills/                     # your written procedures, one file each
│   ├── skill-client-proposal.md
│   └── skill-monthly-report.md
└── cowork/                        # the scoped folder you grant to Cowork
    ├── inputs/                    # raw exports — Cowork reads, never writes
    └── outputs/                   # where the finished files land`;

export const PROJECT_INSTRUCTIONS_TEMPLATE = `# Who I am
[Company, what we sell, who buys it, what makes us different — one line each.]

# Who you are in this project
You are my [role]. You have [experience]. You care most about [outcome].

# How I write
- [Sentence length, formality, British or US spelling]
- Never use: [the words and phrases you hate]
- Always: [your signature habits]

# Standing rules
- Ask before assuming a fact about our pricing, clients or numbers.
- If the knowledge base doesn't answer it, say so instead of inventing.
- Default output format: [what you want 80% of the time].

# What "good" looks like
[Point at the file in the knowledge base that is your gold standard.]`;

export const SKILL_TEMPLATE = `# Skill: [Name — say what job it does]

## When to use this
Use when I ask for [trigger phrases]. Don't use for [the near-miss cases].

## What you need before starting
- [Input 1 — and where to find it]
- [Input 2]
If any of these are missing, ask me. Do not guess.

## The steps
1. [Step, with the actual detail]
2. [Step]
3. [Step]

## What good looks like
[Describe it. Point at an example. Be specific about length, tone, structure.]

## Never
- [The mistake you've had to correct before]
- [The thing that would embarrass us in front of a client]

## Output
Return [exact format]. Then ask me [the one question that catches errors].`;

export const COWORK_BRIEF_TEMPLATE = `GOAL       [The finished thing. Name the file type.]

INPUTS     Everything you need is in this folder.
           [What each file is, and which ones are authoritative.]

STEPS      I expect roughly: [your rough shape of the work].
           Tell me if you'd do it differently.

RULES      Never overwrite an input file — write new files.
           If a number is missing, flag it. Do not estimate silently.
           Stop and show me after [step N] before continuing.

DONE WHEN  [The check you'd apply if a junior handed this to you.]`;

export const SOP_TEMPLATE = `# SOP: [The recurring job]

Surface       [Chat / Project / Artifact / Cowork / Claude in Excel / …]
Trigger       [Every Monday 9am / when a new client signs / on request]
Runs as       [The prompt, or the name of the skill]
Inputs        [What must exist first, and where it lives]
Success check [How you know it worked — the thing you'd look at]
Owner         [Who fixes it when it breaks]
Fallback      [What we do the week it doesn't work]`;

/* ——— Appendix: anti-patterns ——— */
export const NOCODE_ANTIPATTERNS: [string, string][] = [
  ["Claude describes the document instead of building one", "Settings → Capabilities → code execution and file creation is off. Artifacts cannot appear without it."],
  ["Output is generic and off-brand no matter how you prompt", "You're in a bare chat. Move the work into a Project with written instructions and three gold-standard examples."],
  ["It states something about your business that's confidently wrong", "Your knowledge base holds two versions of the truth. Delete the old one and date the one you keep."],
  ["Every answer needs the same paragraph of background pasted first", "That paragraph is your project instructions. Write it once, there, and stop paying the tax."],
  ["You correct the same mistake every week", "Stop correcting in chat — it doesn't persist. That's a Skill: write the rule into its \"Never\" section."],
  ["A connector \"doesn't work\"", "Ask it what it can see. Usually the scope is narrower than you assumed, or it's connected to a different account than the one you're looking at."],
  ["Answers got slower and vaguer after you connected lots of apps", "Every connector's tools load on every turn. Disconnect anything you haven't used in a fortnight."],
  ["Cowork produced the wrong thing after a long run", "You approved a plan you didn't read. The plan step is where a wrong assumption costs five seconds instead of twenty minutes."],
  ["Cowork's Excel file has pasted values instead of formulas", "Say it in the brief: \"live formulas, no hard-coded values, and show me the formula in the summary cells.\""],
  ["Your live dashboard looks empty to a colleague", "Shared live artifacts run on the viewer's connector access, not yours. They need the same app connected."],
  ["A long chat starts contradicting itself", "Context rot. Start a fresh chat inside the same project — you keep the knowledge and lose the confusion."],
  ["The team stopped using it after two weeks", "Nobody wrote the \"how we use Claude here\" page, so everyone reinvented it badly and gave up. Day 7's side quest."],
];

/* ——— Appendix: cost & limits levers ——— */
export const NOCODE_LEVERS: [string, string][] = [
  ["Start a fresh chat between unrelated jobs", "Long threads re-send everything every turn. A new chat inside the same project keeps the knowledge and drops the baggage."],
  ["Route the grunt work to Haiku", "Extraction, formatting and tidying don't need Opus. Switching model mid-conversation is one click."],
  ["Disconnect connectors you don't use", "Their tool definitions load on every message whether you use them or not."],
  ["Keep knowledge bases small and current", "Everything in a project's knowledge base is background context on every single message in that project."],
  ["Attach files instead of pasting content", "Cheaper, cleaner, and Claude reads the real thing rather than your lossy summary of it."],
  ["Write the brief before you start Cowork", "An unbounded agentic session is an unbounded bill. A brief with a \"done when\" is a bounded one."],
  ["Schedule recurring jobs instead of babysitting them", "Remote sessions run server-side. You're not paying attention to something that doesn't need you."],
];

/* ——— Capstone ——— */
export const NOCODE_EXAM: string[] = [
  "Three projects exist, each with instructions I wrote myself, and each passes the cold-start test.",
  "At least one project's knowledge base updates itself from a synced Drive folder or repo.",
  "I have opened my memory, read it, and corrected something that was wrong in it.",
  "Four artifacts exist — a document, a working tool, a chart-based dashboard, and a diagram.",
  "A real person has opened a published artifact of mine and used it.",
  "Three connectors are live and I can state exactly what each can and cannot see.",
  "One conversation has read from two apps and written into a third, and I verified the result.",
  "A skill I wrote is being used by someone who isn't me.",
  "Cowork has produced a deliverable that left my machine and reached a real person.",
  "One live artifact or scheduled session runs without me starting it.",
  "Claude is live inside at least two apps I already had open every day.",
  "Three recurring jobs each have a named surface, a written prompt or skill, a trigger and a success check — written down where my team can read it.",
];

/* ——— Days 8–30 ——— */
export const NOCODE_LADDER: [string, string, string][] = [
  [
    "Week 2",
    "Depth",
    "Run every repeated task through the surface you chose for it — no falling back to a blank chat because it's quicker in the moment. Write your second and third skills. Rewrite your project instructions now that you know what actually mattered. Add the fourth connector, and only the fourth.",
  ],
  [
    "Week 3",
    "Delegation",
    "Move three recurring deliverables to Cowork with written briefs, and schedule one so it runs without you. Get one other person using your skills and watch where they get stuck — that's your instructions failing, not them. Fix the instructions, not the person.",
  ],
  [
    "Week 4",
    "Leverage",
    "Put a number on it: what did these jobs cost in hours before, what do they cost now, and what is that worth monthly? Turn the best two workflows into either a service you can sell or a process you can hand to a hire. Build the design system so everything that leaves the building looks like you.",
  ],
  [
    "Ongoing",
    "Maintenance",
    "Once a month: prune the knowledge bases, delete connectors you stopped using, re-read your memory, and spend ten minutes on what shipped. Anthropic moves fast and half of what's new is sitting in a sidebar you stopped looking at. Setups rot; maintained setups compound.",
  ],
];
