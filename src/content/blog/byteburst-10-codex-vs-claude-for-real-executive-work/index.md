---
title: "BYTEBURST #10: Codex vs. Claude for Real Executive Work"
description: "A one-day field report on OpenAI Codex with GPT-5.5, Claude Code/Desktop with Fable 5, dynamic workflows, tool use, and the kind of work technical leaders actually need to finish."
pubDate: 2026-06-12T21:18:56.000Z
lang: en
tags: ["anthropics", "fable", "xcode", "leadership", "openai"]
series: byteburst
seriesOrder: 10
status: imported
canonical: "https://blog.trukhin.com/byteburst-10-codex-vs-claude-for-real-executive-work-e1c2d2f737d2"
medium:
  id: "e1c2d2f737d2"
  url: "https://medium.com/trukhinyuri/byteburst-10-codex-vs-claude-for-real-executive-work-e1c2d2f737d2"
  oldPaths: ["/byteburst-10-codex-vs-claude-for-real-executive-work-e1c2d2f737d2", "/p/e1c2d2f737d2"]
  textHash: "8a72cf30be208304e6681806ffafcf7598056637a8fe16db7f55e49aa328a127"
---
**A one-day field report on OpenAI Codex with GPT-5.5, Claude Code/Desktop with Fable 5, dynamic workflows, tool use, and the kind of work technical leaders actually need to finish.**

I don’t grade AI agents on toy coding puzzles.

On June 12, 2026, I ran OpenAI Codex and Anthropic Claude through the kind of work that fills a technical executive’s day: queue triage, source reconstruction, data verification \& collection, identifying trends for decision-making, analysis and verification of complex systems, leadership updates and work where private context cannot leak.

This was not a “which model is smarter?” exercise.

The real question was: **which system helps a technical leader turn messy, cross-system work into verified outcomes, safely and economically?**

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*Wv73_B_L2OFXXpSTHS01Zw.png" alt="Image from the original post" loading="eager" fetchpriority="high" decoding="async"></figure>

## The Verdict

In this one-day, redacted local workflow sample, **Codex with GPT-5.5 delivered the better cost-to-closure loop for my executive work**.

Not because it was universally smarter. Claude Fable 5 was often stronger as a strategic investigator: architecture, decomposition, root-cause framing, and high-ambiguity thinking.

Codex won the day because it was better at the full operating loop:

**gather context -> use tools -> produce an artifact -> verify it -> stop at the right boundary.**

Claude Fable 5 did not look weaker as a model. It looked like a higher-cost planner and investigator that needs deliberate routing. This is a workflow-systems verdict, not a universal model benchmark.

My current routing rule is simple:

-   **Codex / GPT-5.5 High** for most serious daily execution.
-   **Codex / GPT-5.5 Extra High** for high-value ambiguity, risk, and cross-system verification.
-   **Claude Fable 5** for expensive strategic investigation and decomposition.
-   **Claude Opus 4.8 or cheaper models** when Fable-level reasoning is not justified.
-   **Computer/browser automation** only when the UI itself is part of the evidence or output.

## Method: Not a Benchmark, a Workday

This is not a controlled benchmark.

I analyzed local session history from my machine: task classes, tool usage, token usage, model usage where available, and directional API-equivalent cost. I excluded raw prompts, raw tool arguments, customer data, internal names, and private message content.

The workloads were similar enough to compare operating behavior, but not identical enough to claim a universal model ranking. The claim here is narrower: for my technical executive workflow, Codex produced more reliable closure per unit of attention and cost.

Daily consumption snapshot:

-   **Stack:** Codex sessions, priced as GPT-5.5; **Scope:** 59 day-sliced sessions; **Token picture:** 345.7M input, 319.9M cached input, 1.35M output, 440k reasoning output; **Directional API-equivalent cost:** **$329.66**
-   **Stack:** Claude Code / Desktop; **Scope:** 56 day-sliced JSONL files including subagents; **Token picture:** 1.18M fresh input, 19.16M cache creation, 201.16M cache read, 1.04M output; **Directional API-equivalent cost:** **$372.69**

Claude’s cost split in that snapshot:

-   **Claude Fable 5**: **$239.66**
-   **Claude Opus 4.8**: **$133.03**

The task categories were broad: work queue coordination, workstation and GUI operations, internal reporting drafts, public writing, mail/source reconstruction, operational research without production changes, product/vendor research, data analysis and decision-making support. Session/file counts should be read as shape-of-work indicators, not as equal experimental units.

## A Small Scene From the Day

One task started with a deceptively simple request: prepare a leadership-ready update.

That kind of task is never just “write a summary.” A useful update has to reopen the source of truth, reconcile conflicting signals, distinguish noise from actual escalation, preserve owner/date/next-step structure, avoid exposing unnecessary details, and verify the final artifact after it is written.

Codex handled this style of work well because it stayed inside the operating loop. It gathered from the allowed sources, kept a concise plan, produced a usable artifact, then checked whether the output matched the requested format. When the task touched a UI, Browser/Chrome/Computer-style tools were available explicitly. When the task needed parallel judgment, subagents could run review lanes without me manually re-prompting every branch.

Claude could do parts of this very well, especially analysis and decomposition. But in the same class of work it was easier for Claude to spend heavily on planning, workflow machinery, and browser/computer mediation. When the task truly needed strategic breadth, that was valuable. When the task needed a finished operational handoff, it could slow the loop down.

That was the recurring pattern of the day.

The model matters. The loop matters more.

## What the Official Docs Say

OpenAI positions GPT-5.5 for difficult coding, research, professional work, tool use, and computer use. OpenAI’s GPT-5.5 announcement describes a model that can plan, use tools, check its work, navigate ambiguity, and continue across messy multi-part tasks. It also reports strong agentic coding and knowledge-work evaluations and says GPT-5.5 is more token-efficient on Codex tasks than GPT-5.4.

OpenAI documents GPT-5.5 access across paid ChatGPT/Codex plans and API availability. The Codex rate card now exposes token-type economics, and GPT-5.5 API pricing is listed at **$5/M input**, **$0.50/M cached input**, and **$30/M output**. GPT-5.5 Pro is also priced for API use in OpenAI’s April 24 update.

Anthropic positions **Claude Fable 5** as its most capable widely released model for demanding reasoning and long-horizon agentic work. Claude Code docs describe Fable as a non-default model selected with /model fable, with effort levels from low through max. ultracode is more than a reasoning label: it sends xhigh effort to the model and orchestrates dynamic workflows for substantive tasks.

Fable pricing is materially higher: **$10/M input**, **$50/M output**, **$12.50/M 5-minute cache write**, **$20/M 1-hour cache write**, and **$1/M cache hit**. Opus 4.8 is half the base token price at **$5/M input** and **$25/M output**.

For infrastructure and security-adjacent work, Fable also has deployment caveats: Anthropic’s API notes describe required 30-day retention for Fable 5 and classifier/fallback behavior in sensitive domains. That may be acceptable for some workflows and unacceptable for others.

The legal/product framing also matters. OpenAI’s current individual terms include output-ownership language, while business/developer offerings such as APIs, ChatGPT Business, Enterprise, and related services are governed by separate business terms. The right answer for work use depends on account type, region, workspace controls, data-handling obligations, and employer policy.

Anthropic’s picture is different. For EEA/Swiss consumer services, Anthropic’s consumer terms restrict use to non-commercial purposes. API/Console and offerings that reference Anthropic’s Commercial Terms are separate paths. Usage credits may solve overage billing, but they do not by themselves answer commercial-use, procurement, privacy, or employer-policy questions.

<figure><img src="https://cdn-images-1.medium.com/max/789/1*Mno1HL9YobPp_sJAQNRhHw.jpeg" alt="Image from the original post" loading="lazy" decoding="async"></figure>

In fact, this distinction is critically important to me. In addition to my work subscriptions, I have several OpenAI Pro subscriptions because I want to create without limitations, while also ensuring that the vendor does not dictate whether I can use the results of my work for commercial purposes.

With OpenAI, this is possible, the costs are predictable, and I know these subscriptions will be enough for a full month of work and creativity.

With Anthropic, if you really wanted to, you could spend several of your own monthly salaries in a single week even just on your personal computer. This makes using their token-based economy impossible for individuals.

## Computer Use: The Non-Model Difference

The most underrated part of this comparison is the operator interface.

In Codex, I can explicitly ask for Computer interaction. That matters.

When we do something with a team of agents, it is very important to be able to look at the result not only through the computer’s eyes in the terminal, but also through human eyes — and to perform all the necessary actions with human hands to understand what is going on, and then go into another work iteration.

This is the key difference between the technologies at the moment: Claude is still blind. No matter how smart it is, it stops and assumes everything is fine, while missing the obvious.

For it, there is still an insurmountable barrier: after navigating computer systems, working with MCP servers and tools, it cannot look at the result from the user’s perspective on the desktop and use systems that were never designed for AI.

This capability enables much longer agentic cycles, where Codex can verify what it has done, or not just go and look at the data in Grafana, but find “that exact mountain” the team is talking about, look nearby to understand why the user is facing a problem while the alerts remain silent, reproduce the user’s actions, and then decide to move forward.

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*IonEQQNaPVkSKFUn8ei_mw.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

*Computer Use in Codex is currently not available in Europe yet, but it is available via VPN, including with split tunneling, which is very convenient.*

What is the problem with Anthropic?

They acquired the excellent Vy — the company that was building a great AI tool for desktop control — killed the product, but apparently did not want to properly integrate it into Claude. So we got what we got.

In Codex, you can explicitly ask it to use @Computer at the right step. In Claude, you cannot do that.

Anthropic says: we have an intelligent product; it will find the most effective way to solve the task by itself, and if needed, it can use Computer Use.

But the most powerful model, Fable, when told “use Computer here,” says something like: “Well, I tried via MCP, tried this and that, I cannot do more, and anyway it seems everything is fine.”

The same applies to the permissions system. If the model eventually realizes that there is no way forward without Computer Use, it asks for explicit permission to use it — with the exact permissions it decided are minimally necessary. And at that step, you cannot choose different permissions.

Then it starts working, hits the very limitations it chose itself, and says: “Well, I do not have the permissions for this, please continue manually.”

In moments like this, both the model and Anthropic’s product decisions look very foolish. If you cannot make your product work reliably, give the steering wheel to the user.

Anthropic also decided that businesses do not really need Computer Use yet, so it is only available in personal subscriptions, which cannot be used for commercial purposes.

Of course, you can set up third-party Computer Use tools — I even built one myself for cases where I really need to use it from Claude — but all of that works worse.

> For a leader, the failure mode is not “the model is unsafe.” The failure mode is “the model is almost doing the work, then cannot complete the loop.”

Codex is not magically safe. It still requires judgment around credentials, private data, publishing, payments, and irreversible actions. But its tool invocation feels more controllable as an operator interface. A good safety model should be explicit without being paralyzing.

## Where Fable 5 Was Better

Fable 5 deserves respect.

It was strongest when the task was genuinely ambiguous and shallow work would be expensive later:

-   root-cause investigations,
-   architecture decisions,
-   decomposing a vague mission into concrete work,
-   reviewing whether the user’s plan is underspecified,
-   long sessions where the model must hold a large state space.

Fable has a useful strategic posture. It pushes outward. It wants to investigate more surfaces. It asks more structural questions. It is less content to do the narrow mechanical thing.

It is wasteful when you need a clean operational handoff.

The mistake is to use Fable 5 as the default worker. The better pattern is to use it as a senior investigator or planner, then hand execution to cheaper agents or to a tool surface that is better at completion.

## Where Codex Was Better

Codex was better at what I call **executive closure**.

It was more often able to:

-   gather evidence,
-   reconcile sources,
-   perform an action.
-   check it (synchronously, the model can see systems both from the inside and through human eyes),
-   reasoning
-   improve
-   etc (loop or branching)
-   …
-   and explain what was done.

That sounds mundane. It isn’t.

The world is full of AI demos that produce impressive intermediate artifacts and leave the human to do the final 20%.

> In leadership work, that final 20% is where trust is built.

Codex’s combination of local workspace access, app plugins, browser tools, Computer Use, subagents, and /goal made it more likely to finish the loop.

## Cost: The Part Nobody Can Ignore

The directional API-equivalent reconstruction of the day was:

-   **Codex sessions, priced as GPT-5.5:** about **$330**
-   **Claude / Fable 5 + Opus 4.8:** about **$373**

Those numbers are not invoices. They are a magnitude check.

If I were paying pure API billing for every token, both stacks would be serious line items. Subscription packaging changes the decision, but it does not eliminate governance or usage limits.

For an individual professional, plan-integrated Codex can be extremely attractive when used within the applicable terms, plan limits, and employer policy. For enterprise work, the correct path is not “whatever personal plan happens to work today”; it is the right account type, data policy, auditability, and procurement model.

Claude Fable 5 can absolutely be worth the money. But it needs routing discipline:

-   Fable for high-value ambiguity.
-   Opus or cheaper models when Fable is overkill.
-   Dynamic workflows only when breadth is actually required.
-   Computer use only when connectors and APIs cannot do the job.

Codex also needs routing:

-   Medium or High for most implementation and operational work.
-   Extra High for risky, ambiguous, cross-system tasks.
-   Subagents when independent review lanes reduce risk.
-   Browser/Computer only when the UI is part of the evidence or output.
-   Stop before secrets and irreversible actions.

## What Was Token Burn

The waste patterns were clear.

Codex wasted tokens when I gave it too much global context and the task only needed a small local decision. Extra High can over-read. Subagents can over-review. Browser or Computer calls can become expensive if the real answer is available through a structured API or local file.

Claude wasted tokens when dynamic workflows or Fable-level reasoning were used for tasks that were not genuinely broad. For tasks like “go into the system and check what is there” — the kind of thing a human would do in five minutes — it created 47 agents. It did not look like intelligence; it looked more like a junior engineer trying to call a helicopter just to take out the trash.

The antidote is the same for both:

-   define the outcome,
-   name the authoritative sources,
-   choose the minimum sufficient reasoning model,
-   prefer structured connectors over screen automation,
-   and set a stop condition.

On a cost-to-outcome basis, the optimal reasoning level for both GPT-5.5 and Fable 5 is high. Lower than that does not produce significant savings, but it greatly reduces the probability of achieving the goal. Higher than that, the cost increases threefold while accuracy improves by only 2%.

## What Actually Improved My Effectiveness

The productivity gain was not “AI wrote faster.”

The real gain was that I could operate at a higher level of abstraction:

-   Instead of reading every message manually, I could ask for a verified queue delta.
-   Instead of remembering every source, I could ask the agent to reopen the source of truth.
-   Instead of drafting from memory, I could ask for a source-backed data from hundreds sources.
-   Instead of context-switching into every UI, I could delegate navigation and verification.
-   Instead of doing one analysis at a time, I could run multiple review lanes.

The human does not disappear. The human moves up the stack:

-   define the outcome,
-   decide what sources are allowed,
-   judge the tradeoff,
-   verify sensitive claims,
-   accept or reject the result,
-   own the final action.

The best AI system is not the one that feels most magical. It is the one that increases the quality and throughput of that human judgment loop.

## My Current Ranking

For real technical leadership work today:

## 1\. Codex with GPT-5.5 High / Extra High

**Best overall daily operating system.** Strongest at end-to-end completion across tools, local files, browser, app plugins, and verification. Best explicit control surface for Computer/Chrome/Browser-style work.

## 2\. Claude Code with Fable 5

Best expensive planner/investigator. Strong for architecture, decomposition, root cause, and ambiguous long-running problems. Risky as a default worker because cost and orchestration overhead can outrun value.

## 3\. Claude Desktop / Cowork with computer use

Promising for knowledge work beyond code, but still early. The product direction is right; the operator ergonomics need work.

## 4\. Claude Opus 4.8

Still capable and often a better default than Fable when you want serious reasoning without paying Fable prices.

## The Executive Lesson

AI agents are no longer just coding assistants.

They are becoming executive leverage systems.

But leverage cuts both ways. A bad AI workflow helps you create more noise, faster. A good one reduces ambiguity, compresses coordination, and finishes work that crosses systems.

For me, the winning pattern is:

1.  Use AI as an amplifier, not an autopilot.
2.  Give it outcomes, not vague wishes.
3.  Force source verification for time-sensitive facts.
4.  Keep private data out of public artifacts.
5.  Route expensive reasoning only to expensive problems.
6.  Prefer structured connectors over screen automation.
7.  Use browser/computer control for verification and UI-only work.
8.  Stop before secrets, payments, publishing, destructive changes, and irreversible actions.
9.  Measure token burn against business value, not curiosity.
10.  Judge the tool by finished outcomes.

The next technical leadership skill is not “prompting.”

It is designing reliable human-agent operating loops: source discipline, tool routing, verification, cost control, security boundaries, and judgment under uncertainty.

That is why Codex is currently ahead for my workflow. Fable 5 is the model I want for a hard architectural or strategic investigation. Codex is the system I want beside me for the working day.

**P.S.** Codex has become practically my only interface for interacting with the computer.

I think it could very well become the heart of a next-generation operating system — a new type of interface where programming itself is no longer that important, because together with a human it achieves the goal more effectively.

> Fable 5 xhigh with dynamic workflow is especially strong in programming.

> It fixed a problem in my MCP servers that I knew how to fix, but no agent before it had been able to solve. I even had a joke that whoever fixed it would have achieved AGI.

> Apparently, AGI has been achieved :)

> I walked into the next room, and my wife was using Codex to create a scene in Cinema 4D.

> Not because she cannot do it herself, but because that is how they work as a team, complementing each other’s strengths.

Yuri Trukhin, #Byteburst #10
