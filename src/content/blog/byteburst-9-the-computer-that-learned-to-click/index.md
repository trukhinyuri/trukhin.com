---
title: "BYTEBURST #9: The Computer That Learned to Click"
description: "Computer Use, MCP, and the new operating model for agents that work where humans work"
pubDate: 2026-05-04T18:07:34.000Z
lang: en
tags: ["openai", "ai", "computer-use", "claude", "xcode"]
series: byteburst
seriesOrder: 9
status: imported
canonical: "https://blog.trukhin.com/byteburst-9-the-computer-that-learned-to-click-8be1aa44066f"
medium:
  id: "8be1aa44066f"
  url: "https://medium.com/trukhinyuri/byteburst-9-the-computer-that-learned-to-click-8be1aa44066f"
  oldPaths: ["/byteburst-9-the-computer-that-learned-to-click-8be1aa44066f", "/p/8be1aa44066f"]
  textHash: "82a0a6a537baac7c2daad5c22a51bef84c1ad6f6150da70cf55a2e772913ba04"
---
## Computer Use, MCP, and the new operating model for agents that work where humans work

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*bvh2N_cW9zGkJZSAgvEphw.png" alt="Image from the original post" loading="eager" fetchpriority="high" decoding="async"></figure>

*The most important question in AI agents is no longer “Can the model think?” It is “Can the model safely do the work in the places where work already lives?”*

## Editorial

Imagine a small but very real workflow.

An agent reads the ticket, checks the linked discussion, opens the web app, notices that the API says the setting is enabled, but the UI still shows the old state. It changes the filter, sees that the chart is empty because the time range is wrong, corrects it, captures the visible evidence, drafts the update, and stops before sending because the next click would speak as a human in a shared channel.

That is not science fiction. It is also not full autonomy.

It is the shape of useful Computer Use: the agent does the messy interface work, verifies what only the interface can show, and stops at the risk boundary.

For most of the software industry, the agent story has been told in the wrong direction.

We started with chat. Then we added tools. Then we added function calling. Then we added retrieval. Then we added long context, memory, background tasks, and multi-agent orchestration. Each step made the model more useful, but the architecture still had a hidden assumption: if we want AI to do real work, the world must expose clean APIs, structured data, predictable schemas, and automation-friendly workflows.

Anyone who has actually run infrastructure, support, security, HR, finance, product operations, or engineering management knows the problem with that assumption.

The real world is not an API.

The real world is a half-documented admin console behind SSO. It is a Jira ticket with critical context in comments. It is a Slack thread where the important sentence is three messages above the link someone pasted. It is a cloud dashboard that only exposes the useful state visually. It is a vendor portal with a broken export button. It is a browser profile already logged into ten tools. It is a desktop application with a canvas, layers, keyboard shortcuts, and modal dialogs. It is Blender, Photoshop, Figma, Excel, Chrome, Terminal, Slack, an IDE, a password manager, a monitoring dashboard, and a dozen internal systems that were never designed to be driven by an LLM.

This is why Computer Use matters.

Not because moving a mouse is impressive. It is not. We solved mouse automation decades ago.

Computer Use matters because it gives AI agents a universal fallback interface: when there is no API, when the API is incomplete, when the useful state is visual, when the application is local, when the workflow crosses several tools, the agent can still operate in the same environment as a human.

That changes the shape of agent architecture. It also changes the risk.

This issue of ByteBurst is not a catalog of every tool that can move a cursor. It is a field report on the architecture that is starting to emerge underneath them: OpenAI’s Operator, CUA, Codex Computer Use, and the Sky acquisition; Anthropic’s Computer Use, MCP, Claude Desktop, and the Vercept/Vy story; the open-source ecosystem; the research benchmarks; and the enterprise operating model that decides when an agent should use an API, a browser, a native app interface, a screenshot, or a human handoff.

My thesis is simple:

> The winning Computer Use architecture is not “AI controls the screen everywhere.” It is a layered work system: structured tools first, browser automation second, accessibility and application-native control third, vision-and-pixel control last, all wrapped in isolation, approval, audit, and deterministic replay.

The future is not a screenshot agent wildly clicking through your laptop.

The future is an agentic workstation where MCP-connected systems provide structured authority, desktop applications expose action surfaces, browser and GUI control cover the gaps, and human supervision moves from typing every step to governing intent, risk, and outcome.

That is a much bigger idea than “the model can use a computer.”

It is the beginning of software becoming an environment that agents can inhabit.

## TL;DR for the impatient

-   **Computer Use is not a product category. It is an action substrate.** The same label now covers browser agents, API-level computer-use models, host-desktop agents, VM/container desktops, accessibility-tree controllers, RPA hybrids, and developer workstations.
-   **OpenAI’s public path is Operator -> CUA -> ChatGPT agent -> API Computer Use -> Codex Computer Use.** Operator launched in January 2025 as a browser-based research preview, then was folded into ChatGPT agent in July 2025. Codex Computer Use is the macOS desktop surface for Codex, with launch-region limitations documented by OpenAI, and OpenAI has not publicly confirmed that it is directly built from Sky.
-   **Sky matters, but facts matter more.** OpenAI officially acquired Software Applications Incorporated, maker of Sky, on October 23, 2025, to bring deep macOS integration and product craft into ChatGPT. It is tempting to draw a straight line from Sky to Codex Computer Use. As of May 3, 2026, that direct implementation link is not publicly confirmed.
-   **Anthropic’s path is Computer Use -> MCP -> Desktop Extensions/local MCP surfaces -> Vercept acquisition.** Anthropic acquired Vercept, the company behind Vy, on February 25, 2026, to advance Claude’s computer-use capabilities. But the statement “Vy became Claude Desktop” is not publicly confirmed.
-   **The research field is progressing fast, but production reliability is still the hard part.** Some 2026 claims approach human-level results on selected OSWorld-style tasks, while long-horizon robustness, professional UI grounding, recovery, state tracking, and safety remain open engineering problems.
-   **The practical pattern is already clear.** Use APIs and MCP where possible. Use browser automation for web workflows. Use accessibility/CDP/app-native interfaces where available. Use screenshot/pixel control only as the fallback. Then convert repeated successful runs into deterministic workflows.
-   **Security is the main architecture, not a feature.** Prompt injection, tool poisoning, hidden UI instructions, broad desktop permissions, browser profile exposure, and destructive actions are the real blockers to enterprise adoption.
-   **The best current use cases are not fully autonomous companies.** They are QA, visual debugging, browser verification, legacy portals, multi-app admin work, candidate/research workflows, creative-app assistance, and “last mile” operations where a human still owns the decision.

## Table of contents

-   Part I: The missing interface
-   Part II: The lineage — OpenAI, Anthropic, Sky, Vercept, Vy
-   Part III: How Computer Use actually works
-   Part IV: The taxonomy nobody can skip
-   Part V: The current product landscape
-   Part VI: The research reality check
-   Part VII: What already works
-   Part VIII: What breaks
-   Part IX: Security, governance, and trust boundaries
-   Part X: Field notes from real work
-   Part XI: The next 24 months
-   Conclusion: The agentic workstation
-   Sources and further reading

## Part I: The missing interface

Before Computer Use, most agent systems had a clean mental model:

```
User intent
   |
   v
LLM planner
   |
   +--> tool call
   +--> API call
   +--> database query
   +--> shell command
   +--> code edit
```

This model works beautifully when the world is structured.

It works for a Git repository. It works for a database. It works for a well-designed SaaS API. It works for a cloud provider with stable SDKs. It works for a ticketing system where every operation is a predictable JSON request. It works for a coding agent because a repository is almost an ideal agent substrate: text files, command-line tools, tests, logs, diffs, version control, and repeatable execution.

But professional work is not limited to ideal substrates.

The moment the workflow enters a graphical interface, the old model cracks. The agent can reason about what should happen, but it cannot see the modal. It can know that a button should exist, but not that the button is disabled. It can call an API, but not verify that the chart rendered correctly. It can summarize a design task, but not adjust a layer in Photoshop. It can propose a Blender animation, but not inspect the scene from the artist’s viewport. It can tell you how to fill a form, but not handle the vendor portal where the form only exists as a web UI with no documented endpoint.

Computer Use fills that gap:

```
User intent
   |
   v
LLM planner
   |
   +--> structured tools where possible
   |
   +--> browser/app/desktop observation
   |       screenshot
   |       DOM
   |       accessibility tree
   |       OCR
   |       app state
   |
   +--> action
           click
           type
           scroll
           drag
           hotkey
           wait
           verify
```

The important part is not the click.

The important part is observation plus action plus verification in an environment the model did not design.

That is why Computer Use feels closer to robotics than to API automation. A robot does not get a perfect JSON representation of a kitchen. It gets sensors, noisy state, physical constraints, safety rules, and partial feedback. A GUI agent gets the same thing in software form.

This is also why Computer Use is harder than it looks.

Clicking a button is easy. Knowing that it is the right button, at the right time, in the right session, for a permitted action, with a verified result, under a policy boundary, after resisting hostile page content, is the actual problem.

## Part II: The lineage — OpenAI, Anthropic, Sky, Vercept, Vy

The public history of Computer Use is already confusing because the same idea has appeared through several product surfaces: consumer browser agents, developer APIs, desktop apps, coding agents, MCP-connected assistants, and research harnesses.

## OpenAI: Operator, CUA, ChatGPT agent, Codex Computer Use, and Sky

OpenAI launched [Operator](https://openai.com/index/introducing-operator/) on January 23, 2025 as a research preview for Pro users in the United States. Operator used its own browser and could perform web tasks on behalf of the user. Under the hood, OpenAI described the model as a [Computer-Using Agent](https://openai.com/index/computer-using-agent/), or CUA: it could see screenshots and interact with a graphical interface using mouse and keyboard actions.

This was not just another browsing mode. It was a statement that the model should learn an interface humans already understand: the screen.

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*KROLc7kalkPTBFmJFx6vMw.webp" alt="OpenAI Operator" loading="lazy" decoding="async"><figcaption>OpenAI Operator</figcaption></figure>

OpenAI also published an [Operator System Card](https://openai.com/index/operator-system-card/) that is still worth reading because it framed the risk model early: mistakes, harmful tasks, prompt injection, takeover mode, confirmations, monitoring, and refusal boundaries.

Then the product line changed. On July 17, 2025, OpenAI introduced [ChatGPT agent](https://openai.com/index/introducing-chatgpt-agent/), combining pieces of Operator, deep research, and ChatGPT into a broader agent system. The standalone Operator product was later deprecated, with OpenAI’s Help Center noting that access ended on August 31, 2025.

For developers, OpenAI’s [Computer Use API guide](https://developers.openai.com/api/docs/guides/tools-computer-use) now describes the basic loop: provide a screenshot, let the model choose an action, execute it in your environment, return the next screenshot, and repeat. The old computer-use-preview model line exists as a specialized preview model, while newer OpenAI documentation positions more recent GPT models as trained for broader computer-use tasks.

Codex adds a different surface. OpenAI introduced [Codex](https://openai.com/index/introducing-codex/) in May 2025 as a cloud software-engineering agent, and then progressively expanded it from coding into broader workstation workflows. The current [Codex Computer Use documentation](https://developers.openai.com/codex/app/computer-use) describes a macOS desktop capability: Codex can see and operate graphical user interfaces after the user installs the Computer Use plugin and grants Screen Recording and Accessibility permissions. OpenAI also documents launch availability limits, including that the capability was not available in the EEA, the UK, or Switzerland at launch (works with US VPN).

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*G_oQpTUigKEd5Qki3FuC6g.jpeg" alt="@Computer in Codex Desktop (also supported in codex cli)" loading="lazy" decoding="async"><figcaption>@Computer in Codex Desktop (also supported in codex&nbsp;cli)</figcaption></figure>

This is a major boundary shift. A coding agent that can inspect a web app visually, interact with a signed-in browser, or operate a desktop tool becomes more than a repository agent. It becomes an engineering operator.

Then there is Sky.

On October 23, 2025, OpenAI officially announced that it had [acquired Software Applications Incorporated, maker of Sky](https://openai.com/index/openai-acquires-software-applications-incorporated/). OpenAI described Sky as a natural-language Mac interface that understands what is on the screen and can act across apps. The acquisition announcement said the team would join OpenAI and that Sky’s deep macOS integration and product craft would help bring AI into everyday workflows.

That is the confirmed fact.

The tempting story is: Sky was acquired, then Codex Computer Use appeared, therefore Codex Computer Use is Sky.

That may be directionally plausible. It is not publicly confirmed.

For a serious analysis, the distinction matters. We can say:

> OpenAI acquired the team and technology behind Sky to strengthen macOS-native AI interfaces. Codex Computer Use is OpenAI’s current macOS desktop control surface for Codex. A direct implementation lineage from Sky to Codex Computer Use has not been publicly confirmed as of May 3, 2026.

That is the accurate version.

## Anthropic: Computer Use, MCP, Claude Desktop, Vercept, and Vy

Anthropic’s public path started earlier at the model level.

On October 22, 2024, Anthropic introduced [Computer Use](https://www.anthropic.com/news/3-5-models-and-computer-use) for Claude 3.5 Sonnet as a public beta. Anthropic also published a research post on [developing computer use](https://www.anthropic.com/news/developing-computer-use), explaining how Claude could look at a screen, move a cursor, click buttons, and type text. Anthropic was unusually direct about the limitations: the feature was experimental and error-prone.

One month later, on November 25, 2024, Anthropic introduced the [Model Context Protocol](https://www.anthropic.com/news/model-context-protocol), or MCP. MCP is not the same as Computer Use, but the combination is powerful. MCP lets agents connect to data and tools through a standard protocol. Computer Use lets agents operate software when structured tools are insufficient.

Together they suggest a full work architecture:

```
MCP for authority and structured operations
Computer Use for observation and last-mile GUI action
Human approval for risk boundaries
Audit logs for accountability
```

In June 2025, Anthropic introduced [Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions), simplifying local MCP server installation for Claude Desktop. Later, .dxt packaging was renamed to .mcpb, but the important product direction remained the same: make desktop-connected capabilities easier to install and govern.

On February 25, 2026, Anthropic announced that it had [acquired Vercept](https://www.anthropic.com/news/acquires-vercept) to advance Claude’s computer-use capabilities. Vercept was the company behind Vy, a computer-use agent discussed publicly on Product Hunt and in press coverage. Vercept’s external services were discontinued by March 25, 2026 according to the company’s public terms and privacy references.

<figure><img src="https://cdn-images-1.medium.com/max/932/0*AZ1V8ww2r5MRqqcC" alt="Image from the original post" loading="lazy" decoding="async"></figure>

But here again, accuracy matters.

The phrase “Vy was acquired by Anthropic and became part of Claude Desktop” is too strong.

The precise version is:

> Anthropic acquired Vercept, the company behind Vy, to advance Claude’s computer-use capabilities. Vercept’s external product line was shut down. Anthropic has not publicly confirmed that Vy itself was renamed into, or directly integrated as, Claude Desktop Computer Use.

That distinction is not pedantry. The whole field is moving fast enough that false lineage turns into bad architecture decisions.

## Why acquisitions matter

Sky and Vercept/Vy are important for the same reason: Computer Use is not only a model problem.

It is also a product problem.

You need OS permissions. You need event injection. You need screenshot capture. You need window focus. You need app selection. You need latency control. You need user handoff. You need safe confirmations. You need recovery when the UI changes. You need a mental model for what the agent can and cannot touch. You need the user to trust an assistant that can literally operate their machine.

That is not solved by an API endpoint alone.

The frontier labs are acquiring teams that understand the desktop as a product surface because the desktop is where the remaining high-value workflows still live.

## Part III: How Computer Use actually works

At the simplest level, a Computer Use agent runs a loop:

> Figure 2: The Computer Use control loop.

<em>1\.</em> <strong><em>Observe</em></strong><em>  
Capture screenshot, DOM, accessibility tree, OCR, focused app, URL, window state.</em>

<em>2\.</em> <strong><em>Interpret</em></strong><em>  
Build a state model: what screen is this, what changed, what is actionable?</em>

<em>3\.</em> <strong><em>Plan</em></strong><em>  
Decide the next action or ask for clarification/approval.</em>

<em>4\.</em> <strong><em>Act</em></strong><em>  
Click, type, scroll, drag, press a hotkey, wait, or call a structured tool.</em>

<em>5.</em> <strong><em>Verify</em></strong><em>  
Observe again and check whether the intended state changed.</em>

<em>6\.</em> <strong><em>Continue or stop</em></strong><em>  
Repeat until done, blocked, unsafe, or ready for human confirmation.</em>

There are four details that determine whether this loop is useful or useless.

## 1\. Observation quality

Screenshot-only agents are universal, but expensive and brittle. They can work with almost anything a human can see, but they must infer meaning from pixels.

DOM-based browser agents are more precise, but only inside web pages.

Accessibility-tree agents can inspect semantic UI elements in native applications, but only when applications expose useful accessibility metadata.

CDP and automation APIs can be excellent for Chromium and Electron applications, but require the target app or browser to expose the right control surface.

The best systems combine signals:

*screenshot + DOM/accessibility tree + OCR + app/window metadata + tool results*

This hybrid observation is why many practical agents are not pure “vision agents.” They use vision for grounding and verification, but structured state whenever possible.

## 2\. Action precision

The action layer can be high-level or low-level.

**High-level:**

-   “Click the Submit button with element id 42.”
-   “Set the text field value to this string.”
-   “Run the Playwright selector.”
-   “Call the Slack MCP tool.”

**Low-level:**

-   “Move to x=742, y=318.”
-   “Mouse down.”
-   “Mouse up.”
-   “Type this text.”

Low-level actions are universal but fragile. High-level actions are safer but require structure.

This is why accessibility and browser automation matter. The more the agent can act on semantic elements rather than coordinates, the more reliable the system becomes.

## 3\. Verification

Most failed Computer Use demos fail because the agent acts but does not verify.

A human does not just click “Save” and assume the work is saved. A human looks for the confirmation toast, checks that the button is disabled, sees the changed status, notices that an error banner appeared, or realizes that the wrong tab is active.

Computer Use needs the same discipline.

For production work, every meaningful action should have a postcondition:

<strong><em>Action:</em></strong> <em>click “Save”  
</em><strong><em>Expected state:</em></strong> <em>visible confirmation, updated timestamp, changed status, no error banner</em><strong><em>If not true:</em></strong> <em>stop, retry, or escalate</em>

Without postconditions, Computer Use is just a confident intern with a mouse.

## 4\. Risk classification

Not every action is equal.

Scrolling a page is not sending an email. Opening a file is not deleting a file. Drafting a reply is not posting it. Filling a form is already data transmission if the fields contain sensitive data. Clicking “Purchase” is not a UI event; it is a financial action.

OpenAI’s Computer Use documentation explicitly recommends isolated environments, allowlists, and human confirmation for risky actions. Anthropic’s Computer Use documentation similarly recommends dedicated VM/container environments and warns about sensitive data exposure.

This is the right mental model:

**Read/observe** -> acceptable only in scoped or isolated environments  
**Draft/prepare** -> agent can do most of the work  
**Write/send/delete** -> approval at the point of risk  
**Financial/legal/HR** -> stronger confirmation and audit  
**Password/CAPTCHA** -> human handoff

The future of Computer Use is not less governance. It is better governance with less manual labor.

## Part IV: The taxonomy nobody can skip

The field is confusing because people use “Computer Use” to describe at least five different things.

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*sqOQ9l1lxTA6xQrFxbbexg.png" alt="The layered Computer Use stack." loading="lazy" decoding="async"><figcaption>The layered Computer Use&nbsp;stack.</figcaption></figure>

The mistake is to compare tools across layers as if they were equivalents.

They are not.

A browser agent is not a desktop agent. A VM desktop is not your host laptop. An MCP tool is not a screenshot clicker. A coding agent with a browser is not a general RPA platform. A coordinate-based PyAutoGUI script is not the same as an accessibility-aware controller.

The correct architecture is not choosing one layer.

It is routing work to the lowest-risk layer that can complete the task.

<strong><em>Can an API/MCP tool do it?</em></strong><em>  
Use that.  
</em><strong><em>Else can browser automation do it?</em></strong><em>  
Use that.  
</em><strong><em>Else can accessibility/app-native control do it?</em></strong><em>  
Use that.  
</em><strong><em>Else can vision/pixel control do it safely?</em></strong><em>  
Use that, isolated if possible.  
</em><strong><em>Else</em></strong><em>  
hand off to a human.</em>

This routing logic is the difference between a toy demo and a production operating model.

## Part V: The current product landscape

As of May 2026, the Computer Use landscape looks less like a single market and more like a set of overlapping control surfaces.

## OpenAI Computer Use and Codex Computer Use

OpenAI’s [Computer Use API guide](https://developers.openai.com/api/docs/guides/tools-computer-use) is the model-level interface: the developer provides an environment, screenshots, and an action executor.

Codex Computer Use is the desktop product surface for Codex. The [Codex Computer Use docs](https://developers.openai.com/codex/app/computer-use) describe macOS app control after plugin installation and macOS permissions, with documented launch-region limitations. OpenAI also recommends its [Codex in-app browser](https://developers.openai.com/codex/app/browser) for local web-app testing where a browser surface is enough.

## Anthropic Computer Use, Claude Desktop, Claude Code, and MCP

Anthropic’s [Computer Use tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) exposes model-level computer actions through the API, with the application responsible for the execution environment. Claude Desktop and Claude Code add local product surfaces for users, while Desktop Extensions make MCP packaging and installation more approachable.

Anthropic’s advantage is philosophical consistency: MCP for tools and data, Computer Use for screen-oriented action in controlled environments, and Claude Desktop as the local shell for user-facing MCP-connected workflows.

The risk is the same as everyone else’s: broad desktop access must be treated as a high-trust operation.

## Goose

[Goose](https://github.com/aaif-goose/goose), now under the Agentic AI Foundation ecosystem, is one of the most interesting open-source agent workstations because it combines a CLI, desktop app, MCP extensions, recipes, and multiple model providers. Its [Computer Controller with Peekaboo](https://goose-docs.ai/blog/2026/04/29/computer-controller-peekaboo) is a practical move toward host-desktop control on macOS.

Goose matters because it is not trying to be only a browser agent. It is closer to an extensible local agent shell.

The maturity warning: desktop control is a fast-moving feature, and local provider/configuration behavior matters. This is not a “install once and trust forever” class of software.

## OpenClaw

[OpenClaw](https://github.com/openclaw/openclaw) represents the more ambitious personal-assistant direction: channels, skills, gateway, daemonized operation, and host tools. It is interesting because it treats agents less as single-task automators and more as ambient operators across communication channels and desktop surfaces.

That ambition comes with a large attack surface. Messaging channels are untrusted input. Host tools are powerful. Skills need review. A personal assistant that can read DMs and act on a host machine is also a prompt-injection amplifier unless sandboxing, allowlists, and approval gates are designed first.

## Browser Use

[Browser Use](https://github.com/browser-use/browser-use) is one of the strongest open-source web-agent projects. It focuses on browser workflows, not native desktop automation. That is a feature, not a weakness. Many real workflows live in web apps, and a browser-only surface can be easier to isolate, replay, and debug than full desktop control.

The Browser Use Cloud direction adds managed browser sessions, profiles, proxies, CAPTCHA/session handling, and MCP access. That makes sense: browser automation is valuable enough to deserve its own infrastructure layer.

## Touchpoint MCP

[Touchpoint MCP](https://github.com/Touchpoint-Labs/touchpoint) points toward a promising middle path: use native accessibility APIs and browser/CDP signals to give agents semantic access to windows, apps, and elements. This is generally better than pure screenshots because it lets the agent act on UI structure rather than only coordinates.

The catch is application quality. Accessibility APIs are only as good as what the application exposes. Electron apps, custom canvases, professional tools, and complex browser embeddings can still degrade into screenshot fallback.

## Open Interpreter OS Mode

[Open Interpreter OS Mode](https://docs.openinterpreter.com/guides/os-mode) and its [Computer API](https://docs.openinterpreter.com/code-execution/computer-api) are useful because they expose the raw idea clearly: screenshots, OCR, mouse, keyboard, and code execution under a Python/CLI-oriented assistant.

It is powerful and understandable. It is also experimental. That makes it a good lab and power-user tool, not a governance-ready enterprise desktop agent by itself.

## Stagehand, Skyvern, and browser RPA

[Stagehand](https://github.com/browserbase/stagehand) from Browserbase wraps Playwright with AI primitives such as act, extract, and observe. [Skyvern](https://github.com/Skyvern-AI/skyvern) sits closer to agentic browser RPA. Both reinforce the same point: browser automation is becoming an AI-native workflow layer.

The best browser agents will not run an LLM for every click forever. The winning production path is agent-assisted discovery, then deterministic Playwright or workflow code for the stable path.

## Bytebot, OmniParser, and VM desktops

[Bytebot](https://github.com/bytebot-ai/bytebot) and Microsoft’s [OmniParser/OmniTool](https://github.com/microsoft/OmniParser) represent the isolated-desktop direction. Instead of giving the agent your actual laptop, you give it its own machine: a browser, files, terminal, password manager, and GUI environment in a container or VM.

For risky web automation, this is often the right answer.

It is not the same as host desktop Computer Use. If the task requires your signed-in local Photoshop, your real Slack Desktop, or your local IDE, a VM agent has to recreate that state. But for untrusted websites, repeated scraping, form workflows, and lower-trust execution, isolation is a virtue.

## RPA did not disappear

UiPath, Power Automate, Robot Framework, Robocorp/Sema4, and related RPA systems are not obsolete. They are the older, more deterministic side of the same spectrum.

LLM agents are excellent at handling ambiguity, discovery, instruction following, and adaptation. RPA systems are excellent at scheduling, audit, selectors, credentials, retries, governance, and predictable execution.

The mature stack will combine them:

<em>Agent discovers and generalizes the workflow.  
Human approves the target behavior.  
Automation compiler turns the stable path into code.  
RPA/workflow runner executes repeatably.  
Agent handles exceptions and ambiguous cases.</em>

That is the production future: agents as workflow authors, verifiers, exception handlers, and supervisors, not just perpetual clickers.

## Part VI: The research reality check

The research literature gives us a necessary antidote to product demos.

The demos are impressive. The benchmarks are humbling.

Taken together, these papers prove three things that product pages usually hide.

First, **GUI agents are no longer toys**: they can operate browsers, mobile apps, and desktop environments well enough to matter.

Second, benchmark numbers are moving quickly, with some 2026 claims approaching **human-level performance** on selected OSWorld-style tasks, but the **hard gap has shifted to long workflows, authentication, dense professional interfaces, recovery, safety, and changing state**.

Third, **the winning systems are not pure screenshot agents**. They combine planning, grounding, memory, environment design, verification, and often a structured interface next to vision.

For builders, the inference is direct: evaluate the whole workflow, not a single click. For buyers, the question is not “what is the OSWorld score?” but “what happens when the UI drifts, the login expires, the modal appears, or the action becomes risky?”

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*JjRhzYaDuhlDs_R0JWD3Rw.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

The pattern is consistent:

1.  The model can often understand the user’s goal.
2.  The model can often plan a plausible next step.
3.  The system fails on grounding, state tracking, recovery, or verification.

In other words, the bottleneck is not always intelligence. It is operational reliability.

This is the same lesson infrastructure engineers learn the hard way: a system that is correct 85% of the time is not close to production-ready if the task has ten dependent steps.

<em>0.85 success per step over 10 steps = 19.7% end-to-end success  
0.95 success per step over 10 steps = 59.9% end-to-end success  
0.99 success per step over 10 steps = 90.4% end-to-end success</em>

Computer Use needs boring engineering: retries, state machines, assertions, logs, policies, test environments, canaries, and rollback.

That is not less exciting than a demo. It is how demos become work.

## Part VII: What already works

Computer Use is not ready to replace a careful professional. It is already useful in several narrow but important categories.

## 1\. Visual debugging and QA

This is one of the best current use cases.

A coding agent can modify a web app, start it locally, open it in a browser, inspect what actually rendered, notice layout problems, click through flows, and generate tests. The agent does not need to imagine the UI from files. It can see the UI.

For software teams, this changes the feedback loop:

<strong><em>Before:</em></strong><em>  
developer edits code -> human opens app -> human finds visual bug -> developer fixes</em>

<strong><em>After:</em></strong><em>  
agent edits code -> agent opens app -> agent sees visual bug -> agent fixes -> human reviews</em>

The human still owns quality. But the agent can remove many manual loops.

This is especially powerful for:

-   local web-app testing;
-   onboarding flows;
-   design-system regressions;
-   Playwright test generation;
-   bug-report reproduction;
-   screenshot-based acceptance checks;
-   mobile/responsive layout verification;
-   accessibility smoke checks.

The important design principle: if the agent finds a stable UI path, turn it into a deterministic test.

Do not make the model rediscover the same button every build.

## 2\. Legacy portals and no-API workflows

Every organization has systems that will never get a good API.

Vendor portals. Government forms. Banking exports. Old admin consoles. Internal dashboards. SaaS products where the public API lacks the one action you need. Workflows where a human has to log in, navigate, download a file, click through a report, or copy state from a UI.

Computer Use is useful here because the alternative is not a clean API. The alternative is a human doing repetitive UI labor.

The correct pattern is:

<em>Use a dedicated browser profile.  
Restrict allowed domains.  
Keep credentials scoped.  
Let the agent navigate and prepare.  
Require human confirmation for final submissions.  
Log screenshots and actions.  
Convert repeated paths into browser automation.</em>

This is not glamorous. It is economically important.

## 3\. Live verification

Agents are good at summarizing. They are less good at knowing whether a web page, price, capacity, or option is currently real.

Computer Use helps with live verification:

-   Is this product in stock?
-   Does the checkout price include fees?
-   Does this SaaS admin page show the setting applied?
-   Does this monitoring dashboard show the expected state?
-   Did the comment actually appear after saving?
-   Is the report export available?
-   Does the UI show an error banner?

The value is not only gathering data. It is reconciling claims against the visible state of a real system.

This is why browser and desktop agents are useful even when structured APIs exist. APIs often tell you what should be true. The UI tells you what a user or operator will experience.

## 4\. Communication workflows

Computer Use can fill gaps where connectors can read or post, but cannot perform a specific edit operation.

For example, a Slite connector may expose reading, posting, and replying, but not comments reading. A UI agent can open the real desktop app, inspect the surrounding context, edit only the user’s own message, and verify the edited marker.

That kind of work is dangerous if done casually. It is valuable when done with a strict rule:

<em>Connector reads context.  
Model drafts replacement text.  
Human or policy confirms scope.  
Computer Use performs the missing UI action.  
Agent verifies visible result.</em>

The point is not to let agents speak for humans without control.

The point is to remove mechanical friction while preserving ownership.

## 5\. HR and research workflows

Candidate review, sourcing, vendor research, market scans, and due diligence often cross many surfaces:

-   job requirements;
-   applicant tracking systems;
-   resumes;
-   LinkedIn;
-   GitHub;
-   blogs;
-   publications;
-   search results;
-   internal notes;
-   comments in a hiring system.

APIs rarely cover the whole path. Computer Use can help by keeping the browser and ATS as the shared visual workspace while structured tools handle summarization and scoring.

Again, the safe pattern is not “agent decides and submits.” The safe pattern is:

<em>Agent gathers evidence.  
Agent applies a rubric.  
Agent drafts a concise recommendation.  
Human reviews.  
Agent writes the approved comment where the workflow lives.</em>

For senior hiring, this is not about replacing judgment. It is about making judgment evidence-backed and repeatable.

## 6\. Creative and professional applications

Blender, Photoshop, Figma, CAD tools, video editors, DAWs, spreadsheets, IDEs, and observability tools are where Computer Use becomes more than web automation.

But professional apps also expose the limits of pure vision.

Photoshop is not just pixels. It has layers, masks, selections, actions, history, brushes, blend modes, and file formats.

Blender is not just a viewport. It has a scene graph, Python API, geometry nodes, materials, cameras, animations, constraints, and render settings.

The best architecture for creative apps is hybrid:

<strong><em>MCP/app plugin/API:</em></strong><em>  
inspect structured state  
create objects  
modify layers  
run scripts  
export files</em>

<strong><em>Computer Use:</em></strong><em>  
inspect the visible canvas  
navigate UI panels  
verify the result visually  
handle plugin gaps  
operate tools that have no API</em>

In other words, the agent should not click 200 buttons in Blender if it can create the scene through Python. But it should be able to look at the render, notice that the camera framing is wrong, and adjust the UI or script accordingly.

This is where the future gets interesting: agents connected by MCP to corporate systems and application-native APIs, then using Computer Use for the human-visible last mile.

## 7\. Operations and incident work

Infrastructure work is often a mixture of structured systems and visual interfaces:

-   alerts;
-   dashboards;
-   tickets;
-   chat;
-   runbooks;
-   cloud consoles;
-   logs;
-   terminal sessions;
-   status pages.

The safest path remains structured first: query metrics, fetch logs, inspect tickets, use read-only connectors, and only then act.

But Computer Use adds something important: visual situational awareness. An agent can see the same dashboard layout an operator sees, notice the selected time range, detect whether a panel is empty, and verify that a filter changed the expected chart.

This is valuable for triage, but dangerous for autonomous remediation unless the environment has strong policy gates.

The right initial use cases are:

-   prepare incident summaries;
-   gather cross-system evidence;
-   verify dashboards after changes;
-   compare actual UI state to a runbook;
-   create draft status updates;
-   open relevant pages for the human;
-   run low-risk diagnostic workflows.

Autonomous production changes should be the last frontier, not the first demo.

## Part VIII: What breaks

Computer Use fails in recognizable ways.

## 1\. Grounding errors

The agent sees the screen but clicks the wrong thing.

This happens because UI elements are small, dense, visually similar, overlapped, or partially hidden. It is especially common in professional applications, high-resolution desktops, and complex admin dashboards.

Grounding is the reason ScreenSpot and ScreenSpot-Pro matter. The hard part is not deciding that “Settings” should be clicked. It is finding the exact UI target in the actual image.

## 2\. State drift

The agent believes it is on one screen, but the application is in another state.

A modal opened. A tab changed. A spinner is still loading. A toast disappeared. A button became disabled. A filter changed the data. A login session expired. The page scrolled. The selected item changed.

Humans recover from state drift constantly. Agents need explicit state checks.

## 3\. Authentication and permissions

Login flows, SSO prompts, OS permission dialogs, security confirmations, CAPTCHA, 2FA, and password changes are not just UX obstacles. They are trust boundaries.

A mature Computer Use system must hand off or confirm at these boundaries.

The system should not “solve” CAPTCHA. It should not save passwords silently. It should not approve new OAuth access without explicit user intent. It should not click through security prompts as if they were cookie banners.

## 4\. Prompt injection

Computer Use agents read hostile environments.

A web page can contain hidden text. An email can instruct the agent to exfiltrate data. An issue comment can tell the agent to ignore prior instructions. An accessibility label can include text the user does not see. A tool output can poison the shared reasoning context.

This is not theoretical. Anthropic has published research on prompt-injection defenses, and MCP discussions have repeatedly surfaced tool poisoning and tool shadowing as core risks.

The operating rule is simple:

> Everything the agent reads from a webpage, email, document, ticket, UI, accessibility tree, or MCP tool output is untrusted input.

The agent must distinguish instructions from data.

## 5\. Main-profile exposure

The easiest demo is to give an agent your main browser profile and full desktop access.

It is also the scariest demo.

Your main browser profile contains sessions, cookies, admin consoles, personal accounts, internal tools, password-manager extensions, cloud dashboards, email, banking, and social accounts. Full desktop access often includes files, notifications, clipboard, screenshots, and other apps.

For serious use, isolation is not optional.

Use separate browser profiles, separate OS users, remote browsers, containers, VMs, scoped tokens, and allowlists. Treat screenshots as sensitive data. Log actions, but protect the logs.

## 6\. Latency and cost

Humans are good at using computers because perception and motor control are continuous. LLM-driven Computer Use is often turn-based:

*screenshot -> model -> action -> screenshot -> model -> action*

That loop can be slow and expensive.

Batching helps. Better grounding helps. Deterministic scripts help. Specialized GUI models help. But the economics still matter.

If a workflow can be completed with one API call, do not spend 40 model turns clicking through a UI.

## 7\. No durable memory of the workflow

An agent can complete a workflow once and learn nothing operationally unless the system records what happened.

The mature design captures:

-   goal;
-   environment;
-   observations;
-   actions;
-   confirmations;
-   postconditions;
-   failures;
-   recovery steps;
-   final state;
-   versioned recipe or test generated from the run.

Without this, Computer Use stays artisanal.

With it, Computer Use becomes a workflow compiler.

## Part IX: Security, governance, and trust boundaries

The Computer Use security model should start from one assumption:

> The model will eventually read hostile instructions, misunderstand a screen, or attempt an unsafe action.

That assumption does not make Computer Use unusable. It makes architecture necessary.

> Figure 4: Risk boundaries for practical Computer Use.

## The layered control plane

For enterprise use, I would design the control plane like this:

<strong><em>Policy layer</em></strong><em>  
allowed apps  
allowed domains  
allowed directories  
allowed commands  
allowed MCP servers  
action categories  
approval rules</em>

<strong><em>Identity layer</em></strong><em>  
per-user auth  
scoped tokens  
OAuth audience binding  
no token passthrough  
short-lived credentials</em>

<strong><em>Execution layer</em></strong><em>  
isolated browser/VM/container when possible  
separate profiles  
sandboxed filesystem  
network allowlists  
no main desktop by default</em>

<strong><em>Observation layer</em></strong><em>  
screenshots  
DOM/accessibility  
OCR  
app state  
redaction for sensitive regions</em>

<strong><em>Audit layer</em></strong><em>  
tool calls  
screenshots  
action logs  
approvals  
result verification  
replay links</em>

<strong><em>Human control layer</em></strong><em>  
confirmation at point of risk  
takeover mode  
pause/stop  
final review for submissions</em>

This sounds heavy because the risk is real.

MCP makes the structured-tool side more powerful. Computer Use makes the UI side more powerful. Combined, they let agents read and act across a company. That is exactly why governance has to be part of the core design.

## Approval should be late and specific

Bad approval UX asks the user at the beginning:

> “Can I do the task?”

Good approval UX asks at the risky boundary:

> “I am about to send this message to these recipients.”

or:

> “I am about to grant this OAuth application access to these resources.”

or:

> “I am about to submit this form containing these fields.”

Computer Use needs approvals that describe the mechanism and consequence. A click is not the risk. The business action behind the click is the risk.

## Screenshots are sensitive

Audit logs are necessary, but screenshots can contain secrets, personal data, customer data, medical data, legal data, private messages, tokens, URLs, or internal infrastructure details.

Do not treat Computer Use logs as harmless telemetry.

They need retention rules, redaction, access control, and incident handling.

## MCP servers are not automatically safe

An MCP server is a tool provider. It can expose powerful actions. It can also describe those actions in text that enters the model context.

Security guidance from the MCP ecosystem emphasizes OAuth-style authorization, scoped tokens, audience validation, secure storage, and avoiding token passthrough. That is the minimum.

Enterprise MCP should also require:

-   server allowlists;
-   package pinning;
-   code review for local servers;
-   least-privilege scopes;
-   separation of read and write tools;
-   per-tool audit;
-   prompt-injection testing;
-   environment isolation.

An agent with a desktop controller and a pile of unreviewed MCP servers is not a productivity tool. It is a remote-control surface with a language model attached.

## Part X: Field notes from real work

I have been using agent systems in exactly the place where they become interesting: not toy tasks, but daily professional workflows that cross code, communication, browsers, dashboards, documents, calendars, tickets, and local applications.

I will keep this section deliberately generic. The details of corporate systems, incidents, tickets, mail, candidates, and internal tools are not the point.

The useful patterns are.

## Pattern 1: Connector first, Computer Use for the missing action

Structured connectors are excellent for reading context, searching, summarizing, and drafting. But they do not always expose the exact write operation you need.

In practice, the best flow is:

<em>Use connectors to read the real context.  
Use the model to draft or reason.  
Use Computer Use only for the UI action the connector cannot perform.  
Verify visibly that the result happened.</em>

This is how a UI agent becomes useful without becoming reckless.

A sanitized example: the connector can read a conversation and prepare a professional rewrite, but it cannot edit an already-posted message. The agent uses the connector for context, opens the real desktop app only for the missing edit operation, changes only the user’s own text, and verifies the visible edited state. The risky part is not “typing into Slack.” The risky part is changing an artifact that other people will read as the user’s words.

## Pattern 2: Live browser verification beats speculative research

For time-sensitive workflows such as products, bookings, availability, prices, or dashboards, agents should not stop at search results or summaries.

They should open the actual page, apply the exact filters, check the final state, and report what is verified versus uncertain.

This is one of the clearest near-term wins: agents that do not just research, but verify.

A sanitized example: a search result says an option is available, but the actual page changes after selecting dates, guests, filters, taxes, or required fees. A useful agent does not summarize the search result. It opens the page, applies the real constraints, reaches the final visible state, and separates “verified” from “plausible.”

## Pattern 3: HR and screening workflows need evidence, not vibes

An agent can help evaluate candidates or vendors when it works from a real rubric, reads the actual materials, checks public evidence, and drafts a concise recommendation.

It should not pretend to be the hiring manager.

The useful output is not “AI says yes.” It is:

<em>Evidence found  
Evidence missing  
Fit against rubric  
Risk  
Recommendation  
Draft comment</em>

Computer Use matters because the evidence often lives in web pages and systems that are not cleanly integrated.

A sanitized example: a screening system shows the resume, a public profile is open in the browser, and the rubric lives in a note. The agent can collect evidence across all three, but the final recommendation still has to be framed as accountable human judgment, not a mysterious model verdict.

## Pattern 4: Visual state matters in infrastructure work

Dashboards, admin consoles, and monitoring views are not always reducible to APIs. Operators often reason from visual state: a time range, a panel, an annotation, a color change, an empty chart, a selected filter.

An agent that can see the same state can help prepare better summaries and verification steps.

But production write actions still need stronger gates.

A sanitized example: an API can return a metric series, but the operator’s actual question is whether the dashboard view used by the team is filtered correctly and whether the visible panel supports the incident narrative. That is a UI verification task, not only a data query.

## Pattern 5: The agent becomes useful when it can resume

Computer Use is much more valuable when combined with memory of prior attempts:

-   what was tried;
-   what failed;
-   what page was open;
-   which tool was broken;
-   what assumption was wrong;
-   what verification remained.

Without memory, every agent run starts from zero.

With memory, agents become operational collaborators.

That does not mean storing everything forever. It means preserving the right task state with the right privacy boundaries.

## Part XI: The next 24 months

The next phase will not be one magical universal agent. It will be a convergence of several engineering lines.

## 1\. Native GUI action models

Models such as UI-TARS, CogAgent-style VLMs, and future frontier models will become better at grounding, UI reasoning, and action prediction. Screenshot-only systems will improve.

But screenshot-only will not be the final architecture. It will be one modality.

## 2\. Hybrid observation as the default

The strongest agents will observe:

<em>pixels  
DOM  
accessibility tree  
OCR  
app metadata  
logs  
API state  
tool outputs  
history</em>

They will learn when each signal is trustworthy.

## 3\. Specialist decomposition

The monolithic “one model decides every click” design will give way to systems with roles:

-   planner;
-   grounder;
-   verifier;
-   policy checker;
-   memory retriever;
-   workflow compiler;
-   exception handler;
-   human-approval broker.

This is already visible in research systems like Agent S and in production tools that separate observation, action, and verification.

## 4\. Workflow compilation

The mature Computer Use system will not run every task from scratch.

It will watch a successful run, extract a workflow, generate a deterministic script or recipe, run it in a sandbox, test it, version it, and only use LLM reasoning for exceptions.

The line between Computer Use, RPA, Playwright, and runbooks will blur.

## 5\. Application-native MCP

The most interesting future is not an agent clicking menus in Blender or Photoshop forever.

It is Blender exposing a scene graph through MCP, Photoshop exposing layers and actions, Figma exposing design nodes, IDEs exposing code intelligence, observability platforms exposing metrics, and the agent using Computer Use to visually verify the result.

Application-native MCP plus Computer Use is the real unlock:

<em>Structured app state for correctness.  
Visual interface for human alignment.  
Computer Use for gaps and verification.</em>

## 6\. Autonomous work cells

The end state is not “one agent does my job.”

The plausible end state is an autonomous work cell:

```
Goal owner
   |
   v
Agent supervisor
   |
   +--> research agents
   +--> coding agents
   +--> browser agents
   +--> desktop agents
   +--> MCP tool agents
   +--> deterministic workflow runners
   +--> policy/audit system
   +--> human approval checkpoints
```

This work cell can execute a project, not just answer a question.

It can read the backlog, inspect the code, run the app, test the UI, update the ticket, draft the release note, verify the dashboard, prepare the stakeholder update, and stop at the boundaries where a human decision is required.

That is the future worth building.

## 7\. The profession changes

For engineers, infrastructure leaders, and product builders, the skill is no longer only “can you use AI?”

The skill becomes:

-   Can you decompose work into agent-safe layers?
-   Can you distinguish API work from GUI fallback?
-   Can you design approval boundaries?
-   Can you build evals for workflows?
-   Can you turn successful agent runs into deterministic automation?
-   Can you audit what happened?
-   Can you keep secrets and sensitive data out of unsafe contexts?
-   Can you supervise agents without becoming their manual babysitter?

The professionals who learn this will not merely be faster.

They will operate at a different level of leverage.

## Conclusion: The agentic workstation

Computer Use is easy to misunderstand because the interface looks primitive.

The model sees a screen. The model clicks. The model types.

That sounds like a parlor trick until you place it inside the real architecture:

```
MCP-connected enterprise systems
        +
application-native APIs
        +
browser automation
        +
desktop accessibility
        +
vision-based fallback
        +
human approval
        +
audit and replay
        =
agentic workstation
```

The agentic workstation is not a chatbot. It is not an RPA bot. It is not a coding agent. It is not a browser scraper. It is a coordinated work environment where models reason, tools act, applications expose state, the UI remains visible, and humans govern intent and risk.

That is why the acquisitions of Sky and Vercept matter. That is why MCP matters. That is why OSWorld and WebArena matter. That is why Goose, OpenClaw, Browser Use, Touchpoint, Stagehand, Bytebot, Open Interpreter, and the RPA ecosystem all matter.

They are different attempts to answer the same question:

> How does an AI agent work in the world we already have, not the clean world we wish we had?

The answer will not be one model and one mouse.

The answer will be layered control, structured authority, visual verification, isolation, memory, workflow compilation, and human judgment at the right boundaries.

The computer has learned to click.

Now we have to teach it when not to.

*Iurii Trukhin, #ByteBurst #9*
