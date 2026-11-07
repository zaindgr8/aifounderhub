---
title: Your AI Agent Says It's Done. Here's How to Know.
seoTitle: AI Agent Says It's Done? How to Check the Work
description: AI agents report work as done when it isn't. The failures we hit building with agents, why passing tests miss them, and five checks that catch them.
tldr: When an AI agent says done, treat it as a claim and check the thing itself: the live page, the real device, the changed file. Agents report from proxies such as logs and passing tests, and those can be green while the work is missing. Write down what done means before the work starts, make silent failure impossible, and have a second reader check.
category: AI agency guides
date: 2026-11-06
cover: /gallery/ai-agent-says-done-cover.jpg
coverAlt: The word DONE with a question mark, beside a log where seven edits say applied and five of them show zero matches
authorName: Ahmed Yahya Al Kindi
authorRole: Cofounder, AI Founder Hub
authorPhoto: /ay2.png
authorUrl: https://www.ahmedyahyak.com/
authorBio: Cofounder of AI Founder Hub and author of The System Builder. Writes about building real systems with AI agents.
---

Seven edits. One small script. It printed "applied" seven times, and the AI agent said done.

Five of those edits had changed nothing.

The typecheck passed. The tests passed. The deploy went through. The feature was not on the server.

An AI agent wrote that script while working for us in September. It wasn't lying. It reported what it could see, and what it could see was its own print statement. If your AI agent says done and you take that at face value, you will ship a gap like this sooner or later.

Anthropic has written about the same pattern in Claude running as a long running coding agent. Its [engineering note on long running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) lists this failure: "Claude marks features as done prematurely." Its fixes are a structured feature list the agent works through, and testing end to end the way a user would.

Here is what our own misses taught us, and the checks we run now.

## Why an AI agent says done when it isn't

Agents rarely check the work itself. They check something next to it: a log line, an exit code, a green test run, a config file. We went back through a run of our own mistakes and found one pattern under all of them. A fact was asserted from a proxy, not from the thing itself.

| WHAT WAS TRUSTED | WHAT WAS TRUE |
|---|---|
| A script printed "applied" seven times | Five edits had matched nothing |
| A shell command printed "pushed" | The push had failed; `&&` after a pipe reports the pipe |
| A board "worked" because it was built | It had never completed a single run |
| A config looked locked down | Strangers still received pairing codes |
| A checker reported a 404 | The checker was wrong; the page returned 200 |
| A research report said a tool was already installed | It was not on the machine |

Two things stand out. The errors are not in the hard parts. They sit wherever everyone felt sure. And proxies fail in both directions: that 404 would have sent us to fix a page that was fine.

The script in the opening shows how easy this is. Python's [`str.replace`](https://docs.python.org/3/library/stdtypes.html#str.replace) returns a copy of the string. When nothing matches, the copy is identical and no error is raised. The script printed "applied" whatever happened, so nothing in the chain could fail loudly.

## The crash our tests could not see

Passing tests are the proxy people trust most, so here is the one that cost us the most.

We were building a client mobile app with React Native and Expo. Builds one and two both reached testers and both crashed in their hands: the first on launch, the second on the screens that needed a plural. Unit tests, typecheck and lint had passed both times.

The second error read `undefined cannot be used as a constructor`, at `new Intl.PluralRules`. On iOS, Hermes, the JavaScript engine running the app, had Collator, DateTimeFormat and NumberFormat, and no PluralRules. The [Hermes Intl page](https://github.com/facebook/hermes/blob/main/doc/IntlAPIs.md) does not list it at all. That was the page on 6 November 2026. Check your own version, because this moves.

Our tests ran on Node, which has the full API. So every test could call a function the phone did not have. "All tests pass" was true, and it said nothing about the phone. Nobody had walked the real build on a device, so testers found it before we did.

## Five checks for an AI agent's work

### 1. Name the source of every claim

Before you accept "done", ask how the agent knows. If the answer is a log, a memory, a document or a config file, either check the thing itself or mark the claim unverified out loud. The thing itself means opening the live page, reading the row in the database, or running the build.

### 2. Make silent failure impossible

Any step that can do nothing without saying so will eventually do nothing. For patches, require exactly one match and stop loudly otherwise:

```python
def patch(text, old, new):
    hits = text.count(old)
    if hits != 1:
        raise SystemExit(f"expected 1 match, found {hits}: {old[:40]!r}")
    return text.replace(old, new)
```

Afterwards, search each file for a word only the new code contains and print the count. The step is not done until that count is right.

### 3. Test where the user runs

Walk the exact build on a device or simulator before anyone else sees it. Then make your test setup as limited as the target. Ours now deletes the Intl APIs Hermes lacks, so a test fails the same way the phone would. One trap: Jest fake timers swapped their own Intl back in for us, so we set `fakeTimers: { doNotFake: ['Intl'] }`.

### 4. Write down what done means first

Done should be something a person can observe. This URL returns this. This row exists. This button is visible in both themes. The [Claude Code docs](https://code.claude.com/docs/en/costs#work-efficiently-on-complex-tasks) make the same point: give the agent test cases, screenshots or expected output so it can check its own work. Without a target, it is checking its own story.

### 5. Have a second reader who did not do the work

In November one of our research agents reported a tool as already installed. A second agent looked, and it wasn't. The same report called a paid analytics feature free on our plan, and the vendor's page said otherwise. The reader who did not write the claim had no reason to believe it.

Second readers need the real thing too. One of our review passes read a stale local copy of the code. Point them at the latest version and at primary sources.

## Fix the system, not the prompt

Asking an agent to be more careful lasts one session. What lasts is turning each miss into a check that fails next time: name the class of mistake, write the rule, add the mechanical test. The patch helper above exists because of that script. The Intl guard exists because of that crash.

Our rule now fits in one line, and it is the opposite of instinct: verify what you are most sure of. Doubt already triggers checking. Certainty is what ships wrong.

## What this means if you sell AI work

Clients pay for done. They never see your tests. If you are selling [finished results rather than software access](/blog/saas-is-dead-what-it-means-for-your-business), a false done is the thing that ends the contract.

So hand over a short receipt with every delivery: what changed, how it was checked, and what was not checked. That last line feels risky to write, and it is the one that earns trust. If you are [starting an AI automation agency](/blog/how-to-start-an-ai-automation-agency), make it part of your delivery from the first client.

We build AI systems live on screen in our [free masterclass](/freemasterclass), if you want to see this kind of work up close.

## Frequently asked questions

### Why do AI agents say a task is done when it isn't?

Because they usually check a proxy and not the work: their own log output, an exit code, or a test run in a different environment. Each of those can look fine while the change is missing or broken. The agent is reporting honestly from what it can see.

### How do I verify an AI coding agent's work?

Check the thing itself. Open the live page, run the exact build on a device, or search the file for a word only the new code contains. Write down what done means before the work starts, and have a second agent or person check claims against primary sources.

### Are passing tests enough to trust an AI agent?

No. Tests prove the code works where the tests ran. Ours ran on Node while the app ran on Hermes on a phone, so every test passed and the app crashed. Make the test setup match the target, then walk the real build as well.

### Will better models fix this?

We don't know. They may do it less often, but we would not plan around that. The checks above are cheap, they work with any model, and they catch mistakes that have nothing to do with the model, such as a stale copy of the code.

### Does this apply if I don't write code?

Yes. A research agent can report a price, a feature or an install that isn't real. Ask where each fact came from, then open that source yourself for anything you are about to act on.
