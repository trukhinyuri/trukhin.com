---
title: "BYTEBURST #7: Ralph, Beads, and bv — A Practicum for Autonomous Software Development"
description: "A field practicum on running autonomous multi-agent software engineering loops with Ralph, Beads issue graphs, and deterministic verification."
pubDate: 2026-03-22T22:07:20.000Z
lang: en
tags: ["programming", "ralph", "ai", "beads", "vbs"]
series: byteburst
seriesOrder: 7
status: imported
canonical: "https://blog.trukhin.com/byteburst-7-ralph-beads-and-bv-a-practicum-for-autonomous-software-development-5ad7829194d9"
medium:
  id: "5ad7829194d9"
  url: "https://medium.com/trukhinyuri/byteburst-7-ralph-beads-and-bv-a-practicum-for-autonomous-software-development-5ad7829194d9"
  oldPaths: ["/byteburst-7-ralph-beads-and-bv-a-practicum-for-autonomous-software-development-5ad7829194d9", "/p/5ad7829194d9"]
  textHash: "8ff0f4eea44c05c51d682334e61f2e9abd7b7cb1dfddfad02606a9bb0f496b0a"
---
A team rarely discovers autonomous development in the abstract. It discovers it on a deadline, when the backlog is blocked, the repository is too large for one person to hold in working memory, the test suite is only half-trusted, and the real bottleneck is no longer typing but coordination. Someone knows what the system should do. Nobody wants to spend the next six hours hand-holding an agent across twenty files, several test runs, and a merge-worthy review cycle.

That is the problem this stack is trying to solve.

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*ac5thw0rmynRZkkXBWyLrQ.png" alt="Ralph-Tui with beads and bv" loading="eager" fetchpriority="high" decoding="async"><figcaption>Ralph-Tui with beads and&nbsp;bv</figcaption></figure>

Taken together, Ralph, Beads, and bv form something closer to an operating model than a toolchain. Ralph gives you an unattended loop with checkpoints and review. Beads gives you a state layer for work: tasks, dependencies, routes, pins, formulas, and recovery. bv gives you a way to see the graph once the backlog becomes too tangled to hold in your head.

Used well, this approach can turn “I know what needs to be done, but I cannot stay in the loop for every step” into an auditable process. Used badly, it becomes a more elaborate way to generate uncertain code at higher speed.

This article is about the difference. It is a practicum first — a concrete guide to getting one loop working and deciding whether to scale it. It also maps the full landscape of alternatives, so you can choose the stack that fits your constraints, not the one with the most hype.

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*LE34O0fnRBUs4mNcWZsuiw.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

**Lifehack:** **We can also manage ralph/beads/bv using AI agents and this will significantly reduce the entry threshold for you, but it is necessary to understand how it works.**

## Why This Article, Why Now

Something shifted between late 2025 and early 2026, and it was not just another model release.

According to Anthropic’s 2026 Agentic Coding Trends Report, 95% of professional developers now use AI coding tools at least weekly, and 75% rely on AI for at least half their engineering work. Those are survey-based numbers from a vendor with a stake in the outcome, so take the exact figures with appropriate skepticism — but the direction is consistent across independent surveys from Stack Overflow, JetBrains, and GitHub. The industry has moved from experimentation to infrastructure.

The qualitative shift matters more than the percentages. The industry moved from single-agent pair programming — a human typing alongside a model — to multi-agent autonomous workflows where agents plan, write, test, and ship code with minimal supervision. PwC’s analysis of the agentic software development lifecycle describes the same transition from the enterprise side: coordinated squads with specialized roles now mirror real engineering teams in structure, if not yet in reliability.

Three standardization efforts landed almost simultaneously. Google’s Agent2Agent Protocol (April 2025) standardized agent-to-agent communication. Anthropic’s Model Context Protocol (MCP) — now with 97 million monthly SDK downloads and universal provider adoption — formalized how agents use tools. The Agentic AI Foundation under the Linux Foundation (late 2025) began establishing shared governance, anchored by MCP and Block’s Goose. These are not competing visions. They are complementary infrastructure that signals agentic development has crossed the threshold from “interesting demo” to “thing people build production processes around.”

The Ralph-Beads-bv stack sits at the intersection of two of these shifts. It gives you the loop (Ralph), the persistent work state (Beads), and the graph visibility (bv) to actually operate an autonomous workflow rather than just run one prompt at a time. The reason to write about it now is not that the stack is finished. It is that the stack is usable enough to be worth the discipline, and the ecosystem is moving fast enough that practitioners need a grounded map rather than another hype cycle.

## The Trade-offs Nobody Should Hide

Before any practicum, the honest move is to name the costs. Autonomous app building is not a free productivity multiplier. It moves costs around. If any of these are deal-breakers for your team, you should know before you install anything.

**The specification cost.** You save supervision time later by spending design time earlier. Teams that dislike writing explicit acceptance checks often experience this as bureaucracy. In practice it is the price of not having the loop invent success criteria on your behalf.

**The verification cost.** The more autonomy you want, the better your test harness, migration checks, and review gates need to be. If your repository has weak tests and vague boundaries, agent loops do not fix that. They amplify it. The paper “Speed at the Cost of Quality?” (arXiv:2511.04427) quantified this: without proper verification, agent-assisted code shows increased static analysis warnings and code complexity. The transient velocity increase comes with a persistent quality cost.

**The state management cost.** A chat interface lets you pretend work state lives in conversation. A graph-based workflow does not let you pretend. You have to decide what is an epic, what is a bead, what blocks what, what can be closed, and what requires human approval. That discipline pays off, but it is work.

**The enforcement cost.** Instruction files such as AGENTS.md and CLAUDE.md are useful, but they are not the same thing as executable guarantees. The ContextCov framework (Sharma, arXiv:2603.00822) showed that agents follow instruction file constraints faithfully, which broadens their exploration space and increases reasoning cost without improving outcomes. An empirical study of 138 real-world repositories (arXiv:2602.11988) found that LLM-generated context files actively reduce agent success while increasing inference cost by 20%+. The lesson: if a rule really matters, encode it in tests, linters, sandbox policy, or hard review gates — not in prose alone.

**The tooling maturity cost.** Ralph Workflow is already useful as a concrete local pipeline, but the surrounding ecosystem is still moving. Beads is improving quickly, and that is exactly why you need to standardize versions and document local conventions rather than building on assumptions.

**The coordination cost.** Multi-agent and multi-repo workflows are not “free parallelism.” The Beads docs themselves warn about race conditions in multi-clone workflows and say the tool is a poor fit for large teams, real-time collaboration, and non-developer-heavy environments.

**The security cost.** Anthropic’s security article makes the trade-off clear: permission prompts slow work down, but removing them without sandboxing is dangerous. The only honest way to buy more autonomy is to narrow the environment in which autonomy is allowed.

If a vendor or consultant describes autonomous development as a way to remove engineering discipline, they are selling theater. The real effect is the opposite. The better the autonomy, the more legible and enforceable your engineering process has to become.

## Readiness Checklist

Your team is ready for autonomous workflows if:

-   80%+ of engineers write and run their own tests regularly (not “QA runs tests”).
-   Your test suite covers >70% of business logic.
-   Pull request review is a required gate, not optional.
-   Your on-call and incident response process is documented and regularly exercised.

Your team is **not** ready if “we’ll add tests later” is a common phrase, most tests are manual or UI-only, code reviews are frequently skipped, or incidents are treated as surprises rather than systemic issues. If this is your situation, spend 4–6 weeks on test infrastructure and review discipline first. Autonomous agents amplify whatever engineering culture you already have — good or bad.

## What This Stack Actually Does

The first useful distinction is between the idea of Ralph and the implementation of Ralph Workflow.

Geoffrey Huntley’s “Ralph loop” writing gave the industry a language for a real shift: software development had stopped being only a conversation with a model and had become a loop that plans, executes, verifies, and tries again. Huntley named the pattern after Ralph Wiggum from The Simpsons — emblematic of persistent, undeterred effort — and the name stuck because it captured something true: naive, stubborn iteration with proper feedback often outperforms sophisticated single-shot architectures in practice.

The core pattern is deceptively simple. A bash loop reads PROMPT.md, passes it to a coding agent, and repeats. Each loop cycle starts with a fresh context window, reading specifications from disk. Progress lives in git history, progress files, and structured task trackers. External verification — tests, linting, type-checking — determines actual completion, not LLM self-assessment. Huntley's four principles drive the pattern's effectiveness: **constrained context** (full specification per iteration), **backpressure** (feedback loops verify progress), **autonomous action** (the agent picks its own next task), and **human oversight over the loop** (not human-in-the-loop for each step, but human deciding when to run and stop iterations).

The mature version is not “stick a model in while true." It is what Ralph Workflow documents today: a local, git-native CLI that runs a structured PROMPT.md → Planning → Development → Review → Commit pipeline, saves checkpoints in .agent/checkpoint.json, and resumes with ralph --resume if the run is interrupted.

Beads solves a different problem. It is not the execution harness. It is where work becomes legible. Created by Steve Yegge, Beads addresses what he calls the “50 First Dates” problem: AI agents lose all memory between sessions and must reconstruct context from scratch. A bead is a single reviewable unit of work — small enough to review, clear enough to verify, explicit enough to route.

Think of Beads as a distributed issue tracker designed for machines, not humans. It differs from GitHub Issues in three ways that matter for autonomous development. First, it lives in your repository (backed by Dolt, a version-controlled SQL database), so it works offline and survives rebases. Second, it enforces a dependency graph: you cannot mark a bead as ready if its blockers are still in progress. Third, it generates context automatically — bd prime produces roughly 80 lines of dynamic context per session, telling the agent exactly what is ready, what is blocked, and what files are involved. This structured readiness information is what makes Beads useful for agents rather than just another task list.

The dependency types are: blocks (hard prerequisite — prevents task readiness until resolved), discovered-from (links discovered work to parent tasks), parent-child (hierarchical relationships), and related-to (loose associations for reference). Hash-based IDs like bd-a1b2 prevent merge collisions in multi-agent workflows.

bv, finally, is not the source of truth and it is not an oracle. Built by Jeffrey Emanuel, it is a graph-aware sidecar. Its real contribution is that it precomputes and renders the structural facts that LLMs are bad at inferring reliably from raw issue text. In practical terms: **Critical Path** tells you which tasks control delivery. **Bottleneck Centrality** tells you which tasks are dependency choke points. **Cycle Detection** warns you of circular dependencies that will block everything. These are exposed via --robot-\* flags for programmatic agent consumption, and via an interactive TUI with Vim-style navigation for humans. Graph metrics expose blind spots. They do not outsource judgment.

This stack is for a specific class of work. Use it when four conditions are true simultaneously:

(1) the work is long enough that hand-holding is the real bottleneck,

(2) the task can be decomposed into reviewable units,

(3) success can be checked by something other than model confidence,

(4) the people using it are comfortable with Git, terminals, and explicit recovery procedures.

If your task fits in one prompt, use a direct coding agent. If the task is exploratory, use a chat assistant. If you have no credible test or review gate, do not call the system autonomous — call it optimistic.

## Critical Caveat: Beads Storage Is Still in Motion

This caveat appears early because it matters before your first install. The only honest way to use Beads is to pin the exact version you install and document which backend is canonical in your workflow.

As of pages indexed in February 2026, the documentation is not perfectly uniform. The Quick Start and Architecture Overview describe a Dolt backend (.beads/dolt/). The Introduction and JSONL Sync pages describe a SQLite plus .beads/issues.jsonl architecture. The bv README documents a discovery order that prefers issues.jsonl, then beads.jsonl, then beads.base.jsonl. As of v0.58.0, Dolt is mandatory — SQLite and embedded backends were removed — but documentation lag means older guides may still reference the previous architecture.

On day 1, do four things. Run bd info and inspect .beads/metadata.json. Write down, in AGENTS.md or team docs, which backend is your canonical operational state. Pin versions of bd and bv in whatever environment you are standardizing. Rehearse recovery on a disposable clone before you need it.

One more warning the Beads docs earn credit for: <strong>do not use</strong> <strong>bd doctor --fix casually</strong>. After analysis of 54 GitHub issues, the Architecture docs state that bd doctor --fix often caused more damage than the original problem.

## What Is Proven, What Is Promising, and What Is Still Experimental

One reason the discourse around agentic coding gets distorted is that people mix mature lessons, promising patterns, and research prototypes into one breathless story. That makes it hard for a practitioner to know what to trust. Here is a candid triage.

**Four claims the research supports.**

**Claim 1: Interface design matters as much as raw model quality.** SWE-agent (Yang et al., arXiv:2405.15793) and AutoCodeRover (Zhang et al., arXiv:2404.05427) both demonstrated this: repository-aware tools, search, shell access, and test feedback are essential. Programming with Pixels (arXiv:2502.18525) sharpened the finding: direct access to development tools still outperforms pure computer-use agents. From these papers, one practical consequence follows: if a task can be expressed as a repository operation, a test run, or a structured edit, give the agent those affordances directly.

**Claim 2: Context is a finite resource.** Anthropic’s “Effective context engineering for AI agents” made the mental model clear: the challenge is curating the entire state that reaches the model, not just writing a good prompt. PAACE (arXiv:2512.16970), CodeScout (arXiv:2603.05744), and Context as a Tool (arXiv:2512.22087) all validate this from the research side. The multi-agent context engineering paper (arXiv:2508.08322) established that coordinated multi-agent systems with proper context management achieve higher single-shot success rates than single agents with larger context windows. Huntley's Ralph pattern formalizes this as "intentional inefficiency" — repeating the full specification each iteration prevents compaction events where LLMs lose track of requirements. Rotate to fresh context around 80k tokens; past 60–70% context capacity, LLM performance degrades into what Huntley calls the "Dumb Zone."

**Claim 3: Verification is not optional overhead.** Anthropic’s evaluation guidance names the failure mode: teams go far on instinct and manual testing, then discover too late that they are flying blind. SWE-Gym (arXiv:2412.21139) and SWE-bench Goes Live! (arXiv:2505.23419) make the same point formally. If you cannot say what success looks like before a run starts, you are not building a reliable harness.

**Claim 4: Test-driven development is the natural enforcement mechanism for autonomous agents.** The TDFlow system (arXiv:2510.23761) demonstrated an 88.8% pass rate on SWE-Bench Lite and 94.3% on SWE-Bench Verified using an agentic TDD workflow. TDAD — Test-Driven Agentic Development (arXiv:2603.17973) — improved issue resolution rates from 24% to 32% and code generation rates from 40% to 68% using graph-based impact analysis. But TDAD also found something counterintuitive: procedural "do TDD" instructions in prompts increased regressions by 9.94%. What works is not telling the agent to do TDD — it is giving the agent specific tests to verify and letting it figure out the implementation.

**What is promising but not yet settled:** verifier-guided search, smaller specialists with escalation, graph-native planning, and durable long-horizon memory. SWE-Replay (arXiv:2601.22129), SWE-Protégé (arXiv:2602.22124), Agyn (arXiv:2602.01465), and ContextCov (arXiv:2603.00822) all contain useful ideas. The broad direction is persuasive. The exact production shape is not yet standardized.

**What remains experimental:** many agents coordinating across repositories with minimal oversight, graph metrics driving scheduling automatically, and unattended changes marching all the way to production. SeaView (arXiv:2504.08696) is a good reminder: even analyzing agent trajectories remains hard work. If understanding failure is still expensive, scaling failure is reckless.

The right posture in March 2026 is neither skepticism nor hype. It is **disciplined opportunism**. Use what is stable. Pilot what is promising. Treat the rest as research, not as process.

## Day 1: Build the Smallest Reliable Loop

The mistake most teams make is starting with the grand version: multiple agents, multiple branches, multiple repos, a thick prompt file, and a backlog imported wholesale into a new graph. That is too much surface area for a first run.

The better move is to get one safe unattended loop working in one repo on one bounded task.

**Prerequisites.** Before the first run, verify you have: Git with worktree support (git worktree --version), Bash or similar shell, a model provider API key (Claude, OpenAI, etc.) with active quota, and basic familiarity with your test suite — how to run a single test and interpret pass/fail. If any of these are unfamiliar, complete the prerequisite sections in the Ralph Workflow docs first.

Start from a clean Git repository or, better, a dedicated worktree. Do not experiment in the same checkout where humans are doing active feature work. When the first run goes wrong, you want recovery to be obvious.

```
git worktree add ../workspace-invites feature/workspace-invites
cd ../workspace-invites
```

```
# Install the loop and the state layer
cargo install ralph-workflow --locked
brew install beads
```

```
# Initialize Beads and verify both tools
bd init --quiet
bd doctor
```

```
# Don't forget to add export PATH="$HOME/.cargo/bin:$PATH" if you haven't done this before, for example in ~/.zshrc
ralph --diagnose
```

If your editor or agent surface has shell access, the Beads documentation recommends CLI plus hooks over MCP because it is more context-efficient. If you are in an MCP-only environment, use uv tool install beads-mcp and wire it into the client.

Before the first unattended run, define the safety boundary. Anthropic’s security guidance is blunt and correct: autonomous coding without filesystem and network isolation becomes a prompt-injection problem quickly. Keep production credentials out, scope writable directories tightly, and make destructive operations require explicit human approval. This is part of the minimum viable setup, not an add-on.

## Write the Spec the Way a Reviewer Would Want to Read It

Create the first PROMPT.md:

```
ralph --init feature-spec
```

The official template library forces the right questions: goal, acceptance checks, constraints, context, compatibility, security, and likely files. Use it. Then cut it down to the smallest statement that is still complete.

For a first real run, choose a feature that is substantial enough to need a loop but narrow enough to review in one sitting. A good PROMPT.md begins like this:

```
# Workspace invite flow
```

```
## Goal
Add a workspace invite flow so an admin can invite a user by email
and the recipient can accept the invite from a signed link.
```

```
## Acceptance Checks
- An admin can create an invite from workspace settings.
- Invite links expire after 72 hours.
- Existing users can accept the invite without duplicate account creation.
- The end-to-end test suite covers create, expire, and accept paths.
```

```
## Constraints
- Do not modify billing or unrelated authentication flows.
- Use the existing email delivery abstraction.
- Keep the database migration backward-compatible.
```

```
## Context
- Backend lives under `services/api/`.
- UI lives under `apps/web/`.
- Existing workspace membership tests live under `tests/integration/workspaces/`.
```

That is not poetry, and it should not be. It is a handoff artifact. The standard is whether a reviewer could tell what “done” means without another meeting.

If the initial request is vague, spend ten minutes refining it before you run anything. CodeScout (arXiv:2603.05744) formalizes what experienced engineers already do: lightweight pre-exploration before execution improves convergence. Read the code paths, identify likely files, write acceptance checks before you ask the loop to move.

## Write Failing Tests Before You Run Anything

The research is clear enough that TDD deserves to be part of your first run — not as an optional add-on, but as the primary verification strategy.

Ralph’s feedback loop needs an external signal that is unambiguous, fast, and mechanical. Tests are that signal. Human review is valuable but slow and subjective. Linting catches style but not logic. Type-checking catches types but not behavior. Tests catch behavior, and they do it in a way that both the agent and the human can evaluate without ambiguity.

Before the agent runs, your spec should include failing tests — not “write tests,” but actual test stubs that assert the expected behavior and currently fail:

```
# tests/integration/workspaces/test_invites.py
```

```
def test_create_invite(client, admin_user, workspace):
    """Admin can create an invite; invite is persisted with 72h expiry."""
    response = client.post(
        f"/api/workspaces/{workspace.id}/invites",
        json={"email": "new@example.com"},
        headers=auth_header(admin_user),
    )
    assert response.status_code == 201
    invite = response.json()
    assert invite["email"] == "new@example.com"
    assert invite["expires_at"]  # must have an expiry
```

```
def test_invite_expiry(client, admin_user, workspace, time_machine):
    """Expired invites cannot be accepted."""
    invite = create_invite(client, admin_user, workspace)
    time_machine.advance(hours=73)
    response = client.post(f"/api/invites/{invite['token']}/accept")
    assert response.status_code == 410  # Gone
```

```
def test_accept_invite(client, admin_user, workspace, existing_user):
    """Existing user accepts invite without duplicate account."""
    invite = create_invite(client, admin_user, workspace)
    response = client.post(
        f"/api/invites/{invite['token']}/accept",
        headers=auth_header(existing_user),
    )
    assert response.status_code == 200
    assert existing_user.id in get_workspace_members(workspace.id)
```

During the agent’s execution, Ralph runs these tests as part of its review phase. A green test suite is the signal that the bead is done. A red test suite is the signal to iterate. After the agent finishes, the human reviewer evaluates not “does this code look right?” but “do these tests pass, and do the tests themselves test the right things?” Test quality is where human judgment remains irreplaceable.

## Turn the Feature Into Beads

A bead should usually be one commit-sized unit of change with one obvious success condition. If the resulting diff would take more than ten minutes to review carefully, the bead is probably too large.

The invite flow is not one bead. It is an epic with several dependencies. In Beads, create the graph explicitly:

```
EPIC=$(bd create "Workspace invite flow" \
  -t epic -p 1 \
  --description="End-to-end invite flow for workspace admins and invitees" \
  --json | jq -r .id)
```

```
DB=$(bd create "Create invite_tokens table" \
  --parent "$EPIC" -t task -p 1 \
  --description="Backward-compatible migration for invite storage" \
  --json | jq -r .id)
```

```
API=$(bd create "Add POST /api/workspaces/:id/invites" \
  --parent "$EPIC" -t task -p 1 \
  --description="Create invite, persist token, enqueue email" \
  --json | jq -r .id)
```

```
UI=$(bd create "Add invite UI in workspace settings" \
  --parent "$EPIC" -t task -p 2 \
  --description="Form for sending invite and status table for pending invites" \
  --json | jq -r .id)
```

```
TESTS=$(bd create "Add integration tests for invite flow" \
  --parent "$EPIC" -t task -p 1 \
  --description="Cover create, expire, and accept flows end to end" \
  --json | jq -r .id)
```

```
bd dep add "$API" "$DB"
bd dep add "$UI" "$API"
bd dep add "$TESTS" "$API"
```

```
bd ready
bd blocked
bd dep cycles
```

In this graph structure, the epic sits at the root with four child beads. The API bead blocks the UI bead (UI cannot proceed until the endpoint exists). Both the UI and API beads block the test bead. Beads enforces this — you cannot mark a bead as ready if its blockers are still in progress.

The practical mapping that matters on day 1:

Product reality Beads primitive feature or initiative epic reviewable unit of work bead / task hard blocker dependency edge (blocks) person or agent currently responsible claim or pin repeatable workflow formula human sign-off human step or gate work in another repo route or external dependency

## Build a Context Pack, Not a Memory Dump

Once bd ready returns something useful, do not hand Ralph the entire epic. Hand it the first ready bead.

For the bead Create invite\_tokens table, the context pack should be narrow:

```
BEAD: Create invite_tokens table (bd-a1b2)
STATUS: ready
BLOCKED_BY: none
BLOCKS: POST /api/workspaces/:id/invites
```

```
GOAL
Add a backward-compatible migration and the minimal persistence code
needed by the invite API.
```

```
FILES LIKELY INVOLVED
services/api/db/migrations/
services/api/invites/
tests/integration/workspaces/
```

```
DO NOT TOUCH
apps/web/
billing/
existing login flows
```

```
CHECKS
- migration applies cleanly on a copy of production schema
- old code paths still run
- new persistence path has tests
```

Context is not “everything that might matter.” Context is the smallest packet of information that allows the next run to make a correct local decision. If you hand an agent the whole repository and the whole feature every time, you are spending tokens to buy confusion.

Beads has an elegant solution to this problem. Its two-tier context model keeps a minimal snippet in AGENTS.md (under 500 characters) that points to workflow context, and bd prime generates roughly 80 lines of dynamic context per session. If you use Claude Code, bd setup claude installs hooks that run bd prime at session start and bd sync at session end automatically.

## Run the First Ralph Cycle

With a ready bead and a scoped PROMPT.md, run the loop in preview mode first:

```
ralph --dry-run
```

If the preview looks sane, choose the depth deliberately: ralph -Q for a small fix, ralph for most real work, ralph -T only when the bead is genuinely tricky.

Then run it:

```
ralph
```

Ralph generates PLAN.md, iterates through development and review, stages changes, prepares a commit message, and leaves checkpoints behind so you can continue with ralph --resume if the run is interrupted. Two underrated flags to use early: --diagnose to verify setup before a run, and --with-rebase when the branch has drifted.

Keep the first version boring. If you need configuration, keep it local and minimal in .ralph-workflow.toml:

```
max_dev_continuations = 5
idle_timeout_seconds = 300
```

```
[backoff]
initial_delay_ms = 1000
max_delay_ms = 60000
multiplier = 2.0
```

Do not set max\_dev\_continuations too high too early. Typical implementations run 10–50 iterations per session, with token rotation at roughly 80k to prevent entering the quality degradation zone. Long runs feel productive because they keep moving. In practice they often accumulate drift.

When the run finishes, review what Ralph leaves behind:

```
git diff
git log --oneline -5
cat PLAN.md
cat ISSUES.md
ls .agent/logs
```

The standard is not “Did the model write code?” The standard is stricter: Is the diff bounded and coherent? Did it touch only the files it needed to touch? Are the tests it claims to have run actually persuasive? Did review find anything useful in ISSUES.md? Would you merge this if a human on your team had opened the PR?

If the answer is yes, close the bead and sync state:

```
bd close "$DB" --reason "Implemented and reviewed in commit $(git rev-parse --short HEAD)" --json
bd sync
```

If the answer is no, do **not** simply run the same loop again and hope. Either split the bead, tighten the context pack, add the missing verifier, or create a discovered issue linked to the current bead. The most common failure mode in autonomous development is not dramatic failure. It is unprincipled repetition.

## Add bv When the Backlog Stops Fitting in Your Head

### Why bv exists and why you should care

Beads gives you a graph of tasks. That graph is the single source of truth for what needs to happen, what blocks what, and what has already been done. But a graph stored in a Dolt database is invisible. You cannot reason about something you cannot see.

bd list shows a flat list. bd ready shows what is unblocked. That is enough for five or ten beads. It stops being enough the moment any of the following happens: you have parallel tracks where a silent cycle in the dependency graph means no task will ever become ready, your agents pick work in the wrong order because they cannot see that one particular bead sits on the critical path of six others, a bead has been stuck for two days and nobody noticed because nobody scrolled down far enough, or you want to estimate when a feature will ship but the chain of dependencies is four levels deep and crosses two repositories.

bv (beads\_viewer) solves all of these. It is a TUI and a set of --robot-\* CLI modes written by Jeffrey Emanuel that takes the raw Beads database and turns it into actionable intelligence — for humans through an interactive terminal interface, and for agents through structured JSON output.

The core insight is that a task graph is not just a to-do list; it is a network. Networks have properties that flat lists do not: critical paths, bottleneck nodes, cascading failures, and emergent priorities. bv applies graph analytics (PageRank, betweenness centrality, HITS, k-core decomposition) to surface these properties automatically. A bead can look unimportant in isolation but be the single node whose completion unblocks an entire subtree. Without bv, you would need to trace that by hand. With bv --robot-next, the agent gets the right task in one call.

## When to install it

You do not need bv on the first afternoon. A practical threshold: once your graph exceeds 20 beads, spans more than two developers or agents, or has any non-trivial blocking structure, install bv:

```
brew install dicklesworthstone/tap/bv     # macOS
```

## What it gives humans

The interactive TUI (bv with no flags) provides five views, each answering a different question:

-   **List view** (l) — all beads with a detail panel. The fastest way to scan status, assignees, and descriptions.
-   **Kanban board** (b) — Open → In Progress → Blocked → Closed. The quickest visual health check for the project.
-   **Dependency graph** (g) — an interactive DAG. The only way to see cascading dependencies that are impossible to understand from a flat list. Nodes are color-coded by status; edges show blocking relationships. If a cluster of nodes is red, you have a bottleneck.
-   **Insights dashboard** (i) — PageRank scores, betweenness centrality, critical path, cycle detection. This is where you discover that a seemingly minor bead is actually the linchpin of the entire sprint.
-   **History timeline** (h) — bead events correlated with git commits. Invaluable during post-mortems or when onboarding a new team member who needs to understand what happened and in what order.

Navigation is Vim-style: j/k to move, r to filter ready-only, / to fuzzy-search, t for time-travel (compare the graph at any past git revision), C to copy a bead as Markdown.

## What it gives agents

For automation, bv provides --robot-\* modes that output structured JSON. These are the commands an agent calls instead of trying to parse human-readable output:

```
bv --robot-next                    # One task + the exact command to claim it
bv --robot-plan | jq '.plan.summary'    # Parallel execution tracks for multi-agent
bv --robot-triage | jq '.recommendations'  # Full triage: bottlenecks, quick wins, health
bv --robot-insights | jq '.Cycles, .CriticalPath[:5]'  # Graph health metrics
bv --robot-alerts                  # Stale tasks, cascading blocks, mismatches
bv --robot-forecast bd-a1b2        # ETA accounting for dependency chains
bv --robot-burndown current-sprint # Burndown with scope-change tracking
```

The difference between bd ready and bv --robot-next is the difference between "here are all unblocked tasks" and "here is the single highest-impact task you should work on right now, and here is the command to claim it." The former requires judgment; the latter encodes judgment into the graph analytics.

Add --toon (Token-Optimized Output) to any robot command to reduce JSON verbosity for agents operating in constrained context windows. Or set export BV\_OUTPUT\_FORMAT=toon globally.

## The honest caveat

bv is powerful but not infallible. The README warns you not to trust heavy metrics blindly: some phase-two metrics may be computed, approx, timeout, or skipped. A task can be low-centrality and still be the most important thing in the company that day. PageRank tells you what the graph thinks matters; it does not tell you what the customer thinks matters. Use graph metrics to expose blind spots, not to outsource judgment.

## Working Effectively with Beads and bv

In the Day 1 section, the graph was built manually with long chains of bd create and bd dep add. That was intentional: the first graph needs to be understood by hand. But day-to-day work with Beads is simpler, and everything below is what you need to use the stack efficiently rather than heroically.

## Quick Reference for bd: The Commands You Use Every Day

Most sessions fit into seven commands. The rest are needed when something goes wrong or when the graph grows complex.

**Creating beads.** The minimal form is shorter than the Day 1 example suggests:

```
# Create a bead — a title is enough
bd create "Add rate limiting to invite endpoint"
```

```
# Add priority and type if known
bd create "Add rate limiting to invite endpoint" -t task -p 1
```

```
# Set description and acceptance criteria in one command
bd create "Add rate limiting" -t task -p 1 \
  --description="Limit POST /invites to 10 req/min per workspace" \
  --acceptance="Integration test verifies 429 on 11th request"
```

The --json flag returns JSON with an id field — useful for scripts and agents:

```
ID=$(bd create "Rate limiting" -t task -p 1 --json | jq -r .id)
```

**Reviewing state.** Three commands that replace the morning standup:

```
bd ready              # What can be worked on right now (no open blockers)
bd blocked            # What is blocked and by what exactly
bd list               # All open beads, any status
```

All three support --json for programmatic processing. bd ready --json | jq '.\[0\].id' is how an agent picks its next task.

**Working with a specific bead.** Before starting work, claim the bead:

```
bd show bd-a1b2                    # View details and audit trail
bd update bd-a1b2 --claim          # Atomic: assignee = you, status = in_progress
```

\--claim is not a decorative gesture. In multi-agent mode it prevents the situation where two agents pick up the same bead simultaneously. Without --claim you get a race condition.

**Closing.** When the work is done and tests pass:

```
bd close bd-a1b2 --reason "Implemented in commit $(git rev-parse --short HEAD)"
```

The --reason is not bureaucracy. It is context for the next agent that will work on a dependent task.

**Syncing.** At the end of every session:

```
bd sync
```

If you are on Claude Code, bd setup claude installs SessionStart and PreCompact hooks that automatically call bd prime on start and bd sync on exit. This eliminates the most common beginner mistake: forgetting to sync before leaving.

## Dependencies Without Pain

Manual bd dep add for every link, as shown in Day 1, is necessary for understanding the model. For daily work there are shorter paths.

**Add a dependency at creation time:**

```
bd create "Add invite UI" -t task -p 2 --parent "$EPIC" --blocks "$TESTS"
```

**Four dependency types and when to use them:**

TypeWhat It DoesWhen to UseblocksBlocking bead prevents dependent from becoming readyHard prerequisite: "DB migration before API"parent-childHierarchy: epic contains tasksGrouping: "invite flow" → 4 subtasksdiscovered-fromAudit trail: "we found this while working on that"Bug discovered during feature implementationrelated-toLoose association, does not affect ready status"This refactoring is related to that ticket"

**Check the graph for cycles** — critically important before launching agents:

```
bd dep cycles
```

A cyclic dependency means nothing in the cycle will ever become ready. bv --robot-insights | jq '.Cycles' will show them visually.

**View a bead’s dependency tree:**

```
bd dep tree bd-a1b2
```

## Scenario: Adding a New Feature Mid-Project

Suppose you are working on the invite flow and realize you also need email notifications when an invite is accepted. Here is what it looks like in practice:

```
# 1. Create a new bead, immediately linking to epic and dependency
NOTIFY=$(bd create "Send email notification on invite accept" \
  -t task -p 2 \
  --parent "$EPIC" \
  --description="Enqueue notification email when existing user accepts invite" \
  --json | jq -r .id)
```

```
# 2. This task depends on the accept API already in the graph
bd dep add "$NOTIFY" "$API"
```

```
# 3. Verify the graph is not broken
bd dep cycles
bd ready
```

```
# 4. If mid-session — let bv refresh the picture
bv --robot-triage | jq '.recommendations[:3]'
```

The entire process takes 30 seconds. No need to rebuild the graph, no need to edit files manually.

## Scenario: Discovering a Bug During Work

An agent or a human discovers a bug while implementing an API endpoint:

```
# Create a bug, linking to the current task via discovered-from
bd create "Race condition in invite token generation" \
  -t bug -p 0 \
  --description="Two concurrent requests can generate same token" \
  --deps "discovered-from:$API"
```

The discovered-from type is an audit trail. It does not block the current task, but records where the bug was found. The next agent calling bd ready will see this P0 bug at the top.

## Scenario: Repeatable Tasks with Formulas

If the same work pattern repeats — for example, “for every new microservice: create CI pipeline, add health check, write integration tests” — Beads supports formulas. A formula is a TOML template that creates a set of beads with predefined dependencies:

```
# Apply a formula from the .beads/formulas/ catalog
bd pour new-microservice --var service_name=notifications
```

The bd pour command instantiates the formula and generates a complete task graph in one command. This replaces hand-scripting bd create in a loop.

## Scenario: Cross-Repository Coordination

When a task in one repository depends on a task in another, use external dependencies:

```
# In the frontend repository:
bd create "Update invite UI for new API" -t task \
  --deps "external:backend-repo#bd-x7y8"
```

Beads tracks external dependencies but cannot automatically check their status — this is manual coordination. The Beads documentation honestly warns: the tool is not designed for large teams and real-time coordination.

## Pins: Preventing Conflicts in Multi-Agent Mode

When multiple agents work in parallel, a pin prevents two agents from grabbing the same bead:

```
bd pin bd-a1b2 agent-1          # Reserve bead for agent-1
bd pin bd-c3d4 agent-2          # Another bead for agent-2
```

When combined with Ralph TUI (ralph-tui run --tracker beads-bv), bv automatically selects the task with the highest score by PageRank, betweenness, and staleness, while the pin locks the assignment.

## The Full bv Arsenal: Beyond --robot-triage

bv is more than the three flags from Day 1. Here is the complete picture of robot modes, each solving a specific problem:

**Task selection:**

CommandWhat It DoesWhen to Usebv --robot-triageFull report: recommendations, quick\_wins, blockers\_to\_clear, project\_healthStart of day, full overviewbv --robot-nextOne task + command to claim itAgent picks next beadbv --robot-planParallel execution tracksPlanning for multiple agentsbv --robot-priorityDetect priority mismatchesPrioritization audit

**Graph health analysis:**

CommandWhat It DoesWhen to Usebv --robot-insightsPageRank, betweenness, HITS, critical path, cycles, k-coreWeekly health checkbv --robot-alertsStale tasks, cascading blocks, mismatchesMorning monitoringbv --robot-suggestDuplicates, missing dependencies, label suggestionsGraph hygienebv --robot-label-healthHealth by labels: velocity, staleness, blocked\_countDomain monitoring

**Forecasting and history:**

CommandWhat It DoesWhen to Usebv --robot-forecast \<id>ETA accounting for dependenciesDeadline estimationbv --robot-burndown \<sprint>Burndown, scope changes, at-risk itemsSprint reviewbv --robot-historyBead↔commit correlationPost-mortem, auditbv --robot-diff --diff-since HEAD~10What changed: new/closed/modifiedSession handoff

**Export and visualization:**

```
# Interactive HTML graph visualization — open in browser
bv --export-graph dependencies.html
```

```
# Export to Mermaid for documentation
bv --robot-graph --graph-format=mermaid > graph.mmd
```

```
# Export to Markdown with diagrams
bv --export-md
```

## Token-Optimized Output (TOON)

For agents working within a limited context window, bv supports a compressed output format:

```
bv --robot-triage --format toon
# Or via environment variable for all calls:
export BV_OUTPUT_FORMAT=toon
```

TOON reduces JSON volume by stripping verbose descriptions and keeping only actionable data. This saves tokens for an agent that needs facts, not prose.

## Interactive TUI: When a Human Wants to See for Themselves

For humans, bv without flags opens a full TUI with Vim-style navigation:

KeyWhat It Doesj / kNavigate up/downlList all beads with detail panelbKanban: Open → In Progress → Blocked → ClosedgDependency graph — visual DAG navigationiMetrics dashboard: PageRank, betweenness, critical pathhTimeline: correlate beads with git commitstTime-travel: compare graph with any git revisionrFilter: show only ready (unblocked) tasks/Fuzzy search by ID, title, contentCCopy current bead as MarkdownqQuit

Kanban view (b) is the fastest way to visually assess project state. Graph view (g) is the only way to see cascading dependencies that are impossible to understand from a flat list.

## bd prime: The Context an Agent Gets Automatically

bd prime is the command you do not run by hand but which makes the whole system work. At every session start (automatically via hooks or manually), bd prime generates ~80 lines of dynamic context:

```
bd prime
```

The output includes: which beads are ready, what is blocked, which files are involved, and a brief reference for key commands. This context is injected at the beginning of the agent session, solving the “50 First Dates” problem — the agent starts every session with a complete understanding of the current graph state.

If you are working with Claude Code, bd setup claude installs everything automatically. For other agents, add to AGENTS.md or the agent configuration:

```
At session start, run: bd prime
At session end, run: bd sync
```

## bd doctor: When Something Goes Wrong

```
bd doctor              # Diagnostics: show problems
```

bd doctor checks database integrity, finds orphaned issues (commits without closed beads), detects metadata inconsistencies, and suggests fixes.

**Important warning, repeated from the section above:** bd doctor --fix applies fixes automatically, but the Architecture docs, based on analysis of 54 GitHub issues, warn that automatic fixing often creates more problems. Use bd doctor (without --fix) for diagnostics and fix manually.

## Commit Convention: Linking Beads and Git

Beads tracks the relationship between beads and commits through a convention in commit messages:

```
git commit -m "Add rate limiting to invite endpoint (bd-a1b2)"
```

The bead ID in parentheses lets bd doctor find orphaned issues — work that was committed but whose bead was never closed. bv --robot-history uses the same link for bead↔commit timeline correlation.

## Cheatsheet: A Typical Session from Start to Finish

```
# Session start (automatically via hooks or manually)
bd prime                                    # Load context
```

```
# Pick work
bd ready --json                             # What is ready?
bv --robot-next                             # Or: let bv decide
```

```
# Start work
bd update bd-a1b2 --claim                   # Claim the bead
# ... agent or human work ...
```

```
# Discovered a new issue along the way
bd create "Found: missing index on tokens" -t bug -p 1 \
  --deps "discovered-from:bd-a1b2"
```

```
# Work complete
git commit -m "Add rate limiting (bd-a1b2)"
bd close bd-a1b2 --reason "Implemented in $(git rev-parse --short HEAD)"
```

```
# Session end
bd sync                                     # Sync state
```

The entire cycle — create, claim, work, discover, close, sync — becomes routine after three or four sessions. The complexity is not in the commands; the complexity is in the discipline of using them consistently.

## The First Week Operating Rhythm

Once the first bead has landed, the right question is not “How do I scale this immediately?” The right question is “What daily rhythm makes this reliable?”

In the morning, inspect the graph before you start any agent:

```
bd ready --json
bd blocked --json
bv --robot-plan | jq '.plan.summary'
```

Pick one or, at most, two ready beads that do not touch the same files. If there is a cycle, fix the cycle before spawning more work. If the graph says nothing is ready, repair the graph — do not ask a planner model to improvise.

For each bead, create an isolated workspace. Run the worker loop. Then review the result as if it came from a colleague you trust but do not merge blindly: inspect the diff, run the narrowest convincing test set, check the claimed acceptance criteria, decide whether the bead is complete, retryable, or wrongly scoped.

At the end of the session, sync state:

```
bd sync
```

If you use Claude Code, bd setup claude installs SessionStart and PreCompact hooks that handle this automatically.

By the end of the week, you want three things to be true. First, your graph should be getting healthier, not just smaller — fewer hidden blockers, fewer cycles, clearer routes, more beads that are small enough to run unattended. Second, your verifier should be getting stricter — the more trust you put in unattended execution, the less you can afford hand-wavy checks. Third, your context packs should be getting shorter — if they are growing, it is usually because the beads are too large or your boundaries are wrong.

## Debugging When the Loop Goes Wrong

When a Ralph loop produces a bad result, the debugging workflow has four steps.

**Step 1: Classify the failure.** Is it a specification failure, a context failure, an execution failure, or a verification failure? Here is what each looks like in practice:

**Specification failure:** PLAN.md makes logical sense but solves the wrong problem. Example: the agent planned a "quick migration" that skipped backward compatibility, violating the constraint "Do not modify billing." The agent did what you asked — but what you asked was wrong. Fix: rewrite the bead's acceptance checks with tighter constraints.

**Context failure:** the agent spent iterations re-reading files to understand the codebase. In .agent/logs, you see repeated requests for "give me the data model structure" before writing code. The agent lacked information it needed. Fix: use bd prime to inject the missing context, or create a CODE\_MAP.md listing key files and their relationships.

**Execution failure:** PLAN.md is sensible but tests fail. The agent understood the task but could not translate intent to code. Example: tests expect POST /invite to return 201; agent returns 200. Fix: split the bead into smaller pieces — "just the happy path" before "all error cases."

**Verification failure:** code passes tests locally but fails in staging. The tests themselves are wrong. Example: migration passes locally but fails in production due to data volume. Fix: update the test environment to model reality more faithfully.

**Step 2: Check the artifacts.** PLAN.md tells you what the agent intended. ISSUES.md tells you what it noticed. .agent/logs tells you what it actually did. The git diff tells you what changed.

**Step 3: Fix the right layer.** Specification failures are fixed by rewriting the bead. Context failures by adjusting the context pack. Execution failures may require splitting the bead or switching models. Verification failures by improving the test suite.

**Step 4: Create a discovered issue.** In Beads, link the new issue to the current bead with discovered-from. This preserves the failure context and prevents the same failure mode from recurring.

The anti-pattern to avoid: running the same loop again with the same inputs and hoping for a different result. Each failure reveals tunable patterns. Update the spec, the context, or the constraints. Document discovered patterns in AGENTS.md. Then retry.

## Multi-Agent Patterns: When and How to Add Coordination

The single-agent Ralph loop is where you start. Multi-agent coordination is where teams eventually need to go — but only after the single-agent case is reliable.

**Weeks 1–2:** Single-agent loop. One bead at a time. Get the rhythm right. This is the sequential pipeline: your spec is the planner, Ralph is the implementer, your test suite is the reviewer.

**Weeks 3–4:** Add bounded specialization within the loop. In practice, this means configuring different model tiers for different phases: a stronger model (Opus) for planning and review, a faster model (Sonnet) for implementation. Ralph’s configuration supports this. You are not running separate agents — you are using one loop with role-appropriate model selection.

**Month 2+:** If your work graph genuinely has independent parallel tracks, run multiple Ralph loops in separate worktrees on separate ready beads. Use bv --robot-insights to identify parallel tracks. Use Beads pins (bd pin \<bead-id> \<agent-identifier>) to prevent two agents from working on the same bead. Research shows +81% performance on genuinely parallel tasks versus sequential execution — but -70% degradation if misapplied to tasks with hidden dependencies. The dependency graph is your safety net.

**Only after that works:** Consider cross-repo coordination using Beads routes and external: dependencies. The Beads multi-agent docs give you the primitives, but they also warn about race conditions in multi-clone workflows.

## Operational Monitoring for Ralph Workflows

When Ralph runs at any significant scale, you need observability at three levels.

**Level 1: Loop Health (per Ralph run).** Track duration (alert if >4 hours), token consumption (alert if >150k — indicates runaway loop), iterations completed (alert if >50), and exit status (success, failure, timeout, manual interrupt). Ralph should export metrics; scrape them into your existing monitoring stack.

**Level 2: Code Quality Impact (per merged PR).** Compare agent-generated PRs against human-generated PRs on the metrics that matter: cyclomatic complexity, static analysis warnings, test coverage delta, and post-merge defect rate within 30 days. If agent-generated PRs have 2x the defect rate, your verification gate is too loose.

**Level 3: Production Impact (post-deployment).** Track rollback rate for agent-generated features (target: \<5%), incident attribution (which agent-generated PR caused this incident?), and human review rejection rate (target: \<10%; above 25% means the loop is producing unreviewable output).

**Alert rules that matter:**

```
RalphLoopTimeout: duration > 4 hours
  → Check PLAN.md and ISSUES.md. Likely needs context tightening or bead split.
```

```
RalphTokenOverage: tokens > 150,000
  → Stop loop. May indicate hallucination loop. Classify the failure.
```

```
AgentPRDefectRate: defects/total_prs > 15% (trailing 30 days)
  → Review recent failures. Tighten test suite or widen context pack.
```

## Integrating Ralph into CI/CD

Ralph was designed as a local tool, but production deployments require CI/CD integration. The operational model:

**Architecture:** Each Ralph run executes in its own isolated environment — containerized, with read-only production code and read-write workspace. Mount credentials from CI/CD secret store, not embedded in image. Restrict outbound to approved APIs only.

**Git branching:** Use agent/\<bead-id>-\<timestamp> naming. Require at least one approval from a CODEOWNERS team. Require status checks (tests, linting, type-checking) to pass. **Never auto-merge agent-generated code.** Require a human to explicitly click "merge."

**High-risk paths:** Use CODEOWNERS to require security team review for agent changes to payment, authentication, or customer data paths. Autonomous development is not autonomous deployment.

**Race condition prevention:** When multiple beads run in parallel, use Beads pins to prevent file conflicts. If two agents modify the same file, the second run’s CI job should detect the conflict, rebase, and either resolve automatically or fail with manual escalation.

**Incident response playbook:** When an agent-generated PR causes a production incident: (1) correlate which PR caused it via git log, (2) rollback with git revert, (3) notify the agent's owner and platform team, (4) in postmortem, do not blame the agent — ask "why did our verification gates miss this?", (5) update tests, update AGENTS.md, disable autonomous deployment for the affected area until fixed.

## The Economics

**Use maximum subscriptions without paying for tokens! Lots of subscriptions.**

A typical Ralph loop running Claude Opus 4.6 consumes roughly 80,000–120,000 tokens per iteration. At current API pricing, that is approximately $1.50–$3.00 per iteration. A 50-iteration session runs $75–$150 in API costs. For comparison, a senior engineer’s loaded cost for six hours of focused work is typically $300–$600 at US rates.

If the Ralph session produces a reviewed, tested, merge-ready feature, the economics are favorable. If it produces three hours of cleanup work, the economics are roughly neutral. If it produces a mess that takes longer to fix than to rewrite, the economics are negative.

**The economic value of Ralph is almost entirely determined by the quality of your specification and verification, not by the cost of tokens.** Bad specs produce cheap iterations that waste expensive human review time. Good specs produce slightly more expensive iterations that save days of coordination.

Industry data from early 2026: average time savings of 3.6 hours/week per developer (conservative). Annual license and API costs per developer: ~$3,000. Annual time savings at $100K loaded cost: ~$7,500. ROI is strongly positive with conservative assumptions, but first-year overhead (training, setup, workflow redesign) adds 30–40%.

**Budget guidance for experimentation:** $500–$1,000 in API costs for the first month, with the explicit goal of determining whether the stack saves more human time than it costs in tokens and setup. If it does not break even in the first month on real work, either the work is not suited to the pattern or the verification infrastructure is not ready.

## So What Should a Reader Actually Do Tomorrow?

**If you are an engineer with working tests and Git discipline:**

Pick one real task in one repository that is too large for a one-prompt fix and too small to justify a project manager. Create a dedicated worktree. Install Ralph Workflow and Beads. Initialize Beads. Write failing tests for the acceptance criteria. Write a proper PROMPT.md. Break the task into three to five beads with explicit dependencies. Pick the first ready bead. Run ralph --dry-run, then ralph. Review PLAN.md, ISSUES.md, the diff, and the tests. If the result is good, close the bead and sync. If it is bad, classify the failure and retry. Do that three times before you try anything more ambitious.

If those three runs are clean, add bv and start watching the graph. If those three runs are messy, do not scale out. Strengthen the spec, the verifier, and the recovery path first.

**If you are a manager evaluating this for your team:**

Start with the Readiness Checklist. If your team passes, budget $500–$1,000 for first-month experimentation. Choose one feature team, not the whole department. Success metric: the first three unattended runs should require less than 15% human intervention to produce merge-worthy output. Measure: how often does human review reject agent work? Do agent-generated PRs have higher defect rates post-merge? Are tests catching regressions? If velocity gains are real and quality metrics are stable after four weeks, expand. If not, invest in test infrastructure first.

**If your team does not yet have the preconditions:**

Do not start with Ralph. Start with test coverage. Get your suite above 70% on business logic. Implement required code review gates. Document your incident response process. Then come back to this article in 6–8 weeks. Autonomous agents amplify whatever engineering culture you already have.

That is the practical dividing line. This approach works when the work can be decomposed honestly, the runtime is bounded tightly enough to be safe, and the reviewer has enough evidence to reject a bad run without debate. It breaks when the graph is fake, the verifier is weak, or the team mistakes instructions for enforcement.

Autonomous development is useful only when it reduces hidden coordination. If Ralph gives you a loop, Beads gives you a graph, and bv gives you visibility, the remaining job is still ordinary engineering: define the task, isolate the run, verify the result, update the state, and recover cleanly when the system is wrong. The next move for a serious team is not to add more agents. It is to make one loop honest enough that autonomy can actually help.

That is less romantic than the usual agent discourse. It is also what gets software shipped.

## References

## Ralph and Ralph Workflow

1.  Geoffrey Huntley, **“Ralph Wiggum as a ‘software engineer’”** (July 14, 2025). [https://ghuntley.com/ralph/](https://ghuntley.com/ralph/)
2.  Geoffrey Huntley, **“everything is a ralph loop”** (January 17, 2026). [https://ghuntley.com/loop/](https://ghuntley.com/loop/)
3.  Ralph Workflow official site. [https://ralphworkflow.com/](https://ralphworkflow.com/)
4.  Ralph Workflow, **Quick Start**. [https://ralphworkflow.com/docs/quickstart](https://ralphworkflow.com/docs/quickstart)
5.  Ralph Workflow, **Core Concepts**. [https://ralphworkflow.com/docs/concepts](https://ralphworkflow.com/docs/concepts)
6.  Ralph Workflow, **CLI Commands**. [https://ralphworkflow.com/docs/cli-commands](https://ralphworkflow.com/docs/cli-commands)
7.  Ralph Workflow, **Configuration File**. [https://ralphworkflow.com/docs/config-file](https://ralphworkflow.com/docs/config-file)
8.  Ralph Workflow, **Template Library**. [https://ralphworkflow.com/docs/templates](https://ralphworkflow.com/docs/templates)
9.  Clayton Farr, **The Ralph Playbook**. [https://claytonfarr.github.io/ralph-playbook/](https://claytonfarr.github.io/ralph-playbook/)
10.  LinearB, **“Mastering Ralph loops”**. [https://linearb.io/blog/ralph-loop-agentic-engineering-geoffrey-huntley/](https://linearb.io/blog/ralph-loop-agentic-engineering-geoffrey-huntley/)
11.  Alibaba Cloud, **“From ReAct to Ralph Loop”**. [https://www.alibabacloud.com/blog/from-react-to-ralph-loop-a-continuous-iteration-paradigm-for-ai-agents\_602799](https://www.alibabacloud.com/blog/from-react-to-ralph-loop-a-continuous-iteration-paradigm-for-ai-agents_602799)

## Beads and bv

1.  Steve Yegge, Beads documentation root. [https://steveyegge.github.io/beads/](https://steveyegge.github.io/beads/)
2.  Beads, **Installation** (last updated February 14, 2026). [https://steveyegge.github.io/beads/getting-started/installation](https://steveyegge.github.io/beads/getting-started/installation)
3.  Beads, **Quick Start**. [https://steveyegge.github.io/beads/getting-started/quickstart](https://steveyegge.github.io/beads/getting-started/quickstart)
4.  Beads, **Architecture Overview** (last updated February 25, 2026). [https://steveyegge.github.io/beads/architecture](https://steveyegge.github.io/beads/architecture)
5.  Beads source repository and architecture docs. [https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md](https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md)
6.  Beads, **CLI Reference**. [https://steveyegge.github.io/beads/cli-reference](https://steveyegge.github.io/beads/cli-reference)
7.  Beads, **Formulas**. [https://steveyegge.github.io/beads/workflows/formulas](https://steveyegge.github.io/beads/workflows/formulas)
8.  Beads, **Multi-Agent Coordination**. [https://steveyegge.github.io/beads/multi-agent](https://steveyegge.github.io/beads/multi-agent)
9.  Beads, **Claude Code Integration**. [https://steveyegge.github.io/beads/integrations/claude-code](https://steveyegge.github.io/beads/integrations/claude-code)
10.  Beads, **MCP Server**. [https://steveyegge.github.io/beads/integrations/mcp-server](https://steveyegge.github.io/beads/integrations/mcp-server)
11.  Jeffrey Emanuel, beads\_viewer repository. [https://github.com/Dicklesworthstone/beads\_viewer](https://github.com/Dicklesworthstone/beads_viewer)
12.  Steve Yegge, **Beads Medium Series**. [https://steve-yegge.medium.com/](https://steve-yegge.medium.com/)
13.  DoltHub, **“Long-Running Agentic Work with Beads”** (January 27, 2026). [https://www.dolthub.com/blog/2026-01-27-long-running-agentic-work-with-beads/](https://www.dolthub.com/blog/2026-01-27-long-running-agentic-work-with-beads/)

## Official best-practice guidance

1.  Anthropic, **Building effective agents** (December 19, 2024). [https://www.anthropic.com/engineering/building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents)
2.  Anthropic, **Effective context engineering for AI agents** (September 29, 2025). [https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
3.  Anthropic, **Effective harnesses for long-running agents** (November 26, 2025). [https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
4.  Anthropic, **Beyond permission prompts** (October 8, 2025). [https://claude.com/blog/beyond-permission-prompts-making-claude-code-more-secure-and-autonomous](https://claude.com/blog/beyond-permission-prompts-making-claude-code-more-secure-and-autonomous)
5.  Anthropic, **Demystifying evals for AI agents**. [https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
6.  Anthropic, **2026 Agentic Coding Trends Report**. [https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
7.  Anthropic, **Claude Code Best Practices**. [https://www.anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices)
8.  Claude Code documentation. [https://code.claude.com/docs](https://code.claude.com/docs)

## Industry analysis and standards

1.  PwC, **“Future of Solutions Development in the Rise of Gen AI”** (2026). [https://www.pwc.com/m1/en/publications/2026/docs/future-of-solutions-dev-and-delivery-in-the-rise-of-gen-ai.pdf](https://www.pwc.com/m1/en/publications/2026/docs/future-of-solutions-dev-and-delivery-in-the-rise-of-gen-ai.pdf)
2.  Google, **Eight Essential Multi-Agent Design Patterns** (January 2026). [https://www.infoq.com/news/2026/01/multi-agent-design-patterns/](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/)
3.  LangChain, **Choosing the Right Multi-Agent Architecture**. [https://blog.langchain.com/choosing-the-right-multi-agent-architecture/](https://blog.langchain.com/choosing-the-right-multi-agent-architecture/)
4.  LangChain, **Open SWE** (March 17, 2026). [https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/](https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/)
5.  DevOps.com, **“Open SWE: Architecture from Stripe, Coinbase, Ramp”**. [https://devops.com/open-swe-captures-the-architecture-that-stripe-coinbase-and-ramp-built-independently-for-internal-coding-agents/](https://devops.com/open-swe-captures-the-architecture-that-stripe-coinbase-and-ramp-built-independently-for-internal-coding-agents/)
6.  Faros AI, **“Best AI Coding Agents 2026”**. [https://www.faros.ai/blog/best-ai-coding-agents-2026](https://www.faros.ai/blog/best-ai-coding-agents-2026)

## Research on software engineering agents

1.  Yang et al., **SWE-agent** (arXiv:2405.15793, 2024). [https://arxiv.org/abs/2405.15793](https://arxiv.org/abs/2405.15793)
2.  Zhang et al., **AutoCodeRover** (arXiv:2404.05427, 2024). [https://arxiv.org/abs/2404.05427](https://arxiv.org/abs/2404.05427)
3.  Huang et al., **AgentCoder** (arXiv:2312.13010, 2023). [https://arxiv.org/abs/2312.13010](https://arxiv.org/abs/2312.13010)
4.  Yang et al., **CodeAgent** (arXiv:2401.07339, 2024). [https://arxiv.org/abs/2401.07339](https://arxiv.org/abs/2401.07339)
5.  Ishibashi and Nishimura, **SoA: Self-Organized Agents** (arXiv:2404.02183, 2024). [https://arxiv.org/abs/2404.02183](https://arxiv.org/abs/2404.02183)
6.  Pan et al., **SWE-Gym** (arXiv:2412.21139, 2024). [https://arxiv.org/abs/2412.21139](https://arxiv.org/abs/2412.21139)
7.  Aggarwal and Welleck, **Programming with Pixels** (arXiv:2502.18525, 2025). [https://arxiv.org/abs/2502.18525](https://arxiv.org/abs/2502.18525)
8.  Bula et al., **SeaView** (arXiv:2504.08696, 2025). [https://arxiv.org/abs/2504.08696](https://arxiv.org/abs/2504.08696)
9.  Zhang et al., **SWE-bench Goes Live!** (arXiv:2505.23419, 2025). [https://arxiv.org/abs/2505.23419](https://arxiv.org/abs/2505.23419)
10.  Zhang et al., **Understanding SE Agent Trajectories** (arXiv:2506.18824, 2025). [https://arxiv.org/abs/2506.18824](https://arxiv.org/abs/2506.18824)

## Research on context, memory, and evaluation

1.  Zhang et al., **PAACE** (arXiv:2512.16970, 2025). [https://arxiv.org/abs/2512.16970](https://arxiv.org/abs/2512.16970)
2.  Liu et al., **Context as a Tool** (arXiv:2512.22087, 2025). [https://arxiv.org/abs/2512.22087](https://arxiv.org/abs/2512.22087)
3.  **Multi-Agent Context Engineering** (arXiv:2508.08322, 2025). [https://arxiv.org/abs/2508.08322](https://arxiv.org/abs/2508.08322)
4.  **SWE-Bench Pro** (arXiv:2509.16941, 2025). [https://arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941)
5.  **SWE-EVO** (arXiv:2512.18470, 2025). [https://arxiv.org/abs/2512.18470](https://arxiv.org/abs/2512.18470)
6.  Xu et al., **A-MEM** (arXiv:2502.12110, 2025). [https://arxiv.org/abs/2502.12110](https://arxiv.org/abs/2502.12110)

## Research on test-driven and spec-driven agentic development

1.  **TDFlow** (arXiv:2510.23761, 2025). [https://arxiv.org/abs/2510.23761](https://arxiv.org/abs/2510.23761)
2.  **TDAD** (arXiv:2603.17973, 2026). [https://arxiv.org/abs/2603.17973](https://arxiv.org/abs/2603.17973)
3.  **“Speed at the Cost of Quality?”** (arXiv:2511.04427, 2025). [https://arxiv.org/abs/2511.04427](https://arxiv.org/abs/2511.04427)

## Research on debugging and agent analysis

1.  Wang et al., **SWE-Replay** (arXiv:2601.22129, 2026). [https://arxiv.org/abs/2601.22129](https://arxiv.org/abs/2601.22129)
2.  Wu et al., **AgentStepper** (arXiv:2602.06593, 2026). [https://arxiv.org/abs/2602.06593](https://arxiv.org/abs/2602.06593)
3.  Gupta et al., **Debug2Fix** (arXiv:2602.18571, 2026). [https://arxiv.org/abs/2602.18571](https://arxiv.org/abs/2602.18571)
4.  Zhang et al., **SWE-Protégé** (arXiv:2602.22124, 2026). [https://arxiv.org/abs/2602.22124](https://arxiv.org/abs/2602.22124)
5.  **Agyn** (arXiv:2602.01465, 2026). [https://arxiv.org/abs/2602.01465](https://arxiv.org/abs/2602.01465)
6.  Sharma, **ContextCov** (arXiv:2603.00822, 2026). [https://arxiv.org/abs/2603.00822](https://arxiv.org/abs/2603.00822)
7.  Suri et al., **CodeScout** (arXiv:2603.05744, 2026). [https://arxiv.org/abs/2603.05744](https://arxiv.org/abs/2603.05744)
8.  **Characterizing Faults in Agentic AI** (arXiv:2603.06847, 2026). [https://arxiv.org/abs/2603.06847](https://arxiv.org/abs/2603.06847)

## Instruction files and context engineering

1.  **Evaluating AGENTS.md** (arXiv:2602.11988, 2026). [https://arxiv.org/abs/2602.11988](https://arxiv.org/abs/2602.11988)
2.  **Codified Context** (arXiv:2602.20478, 2026). [https://arxiv.org/abs/2602.20478](https://arxiv.org/abs/2602.20478)
3.  **Agent READMEs: Empirical Study** (arXiv:2511.12884, 2025). [https://arxiv.org/abs/2511.12884](https://arxiv.org/abs/2511.12884)

## Alternative tools and frameworks

1.  OpenHands. [https://github.com/All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands)
2.  Aider. [https://aider.chat/](https://aider.chat/)
3.  Block, **Goose**. [https://github.com/block/goose](https://github.com/block/goose)
4.  Cline. [https://github.com/cline/cline](https://github.com/cline/cline)
5.  Roo Code. [https://github.com/RooVetGit/Roo-Code](https://github.com/RooVetGit/Roo-Code)
6.  Augment Code. [https://www.augmentcode.com/](https://www.augmentcode.com/)

## Specification and orchestration

1.  GitHub, **Spec Kit**. [https://github.com/github/spec-kit](https://github.com/github/spec-kit)
2.  AGENTS.md standard. [https://agents.md/](https://agents.md/)
3.  LangGraph. [https://langchain-ai.github.io/langgraph/](https://langchain-ai.github.io/langgraph/)
4.  CrewAI. [https://www.crewai.com/](https://www.crewai.com/)
5.  Microsoft, **Semantic Kernel Agent Orchestration**. [https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/)
6.  **AdaptOrch** (arXiv:2602.16873, 2026). [https://arxiv.org/abs/2602.16873](https://arxiv.org/abs/2602.16873)

## Memory systems

1.  Mem0. [https://mem0.ai/](https://mem0.ai/)
2.  Letta. [https://www.letta.com/](https://www.letta.com/)

## Formal verification

1.  **AgentSpec** (ICSE ‘26). [https://cposkitt.github.io/files/publications/agentspec\_llm\_enforcement\_icse26.pdf](https://cposkitt.github.io/files/publications/agentspec_llm_enforcement_icse26.pdf)
2.  **Plan Verification Framework** (arXiv:2510.03469, 2025). [https://arxiv.org/abs/2510.03469](https://arxiv.org/abs/2510.03469)

## Production case studies

1.  HYBRD Engineering, **GasTown + Ralph + The Village**. [https://medium.com/hybrd-engineering/building-hybrds-agent-orchestration-framework-gastown-ralph-the-village-a83fbdedea2b](https://medium.com/hybrd-engineering/building-hybrds-agent-orchestration-framework-gastown-ralph-the-village-a83fbdedea2b)
2.  Takerngsaksiri et al., **HULA** (arXiv:2411.12924). [https://arxiv.org/abs/2411.12924](https://arxiv.org/abs/2411.12924)
3.  Particula, **Amazon Kiro Incident** (December 2025). [https://particula.tech/blog/ai-agent-production-safety-kiro-incident](https://particula.tech/blog/ai-agent-production-safety-kiro-incident)
4.  The New Stack, **GitHub Agentic Workflows** (February 2026). [https://thenewstack.io/github-agentic-workflows-overview/](https://thenewstack.io/github-agentic-workflows-overview/)
5.  Maggie Appleton, **GasTown Patterns**. [https://maggieappleton.com/gastown](https://maggieappleton.com/gastown)

## Broader research

1.  Tawosi et al., **ALMAS** (arXiv:2510.03463, 2025). [https://arxiv.org/abs/2510.03463](https://arxiv.org/abs/2510.03463)
2.  **LLM-Based Multi-Agent Systems for SE** (arXiv:2404.04834, 2024). [https://arxiv.org/abs/2404.04834](https://arxiv.org/abs/2404.04834)
3.  **DynTaskMAS** (arXiv:2503.07675, 2025). [https://arxiv.org/abs/2503.07675](https://arxiv.org/abs/2503.07675)
4.  **Orchestration of Multi-Agent Systems** (arXiv:2601.13671, 2026). [https://arxiv.org/abs/2601.13671](https://arxiv.org/abs/2601.13671)
5.  **The 2025 AI Agent Index** (arXiv:2602.17753, 2026). [https://arxiv.org/abs/2602.17753](https://arxiv.org/abs/2602.17753)

## Cross-domain extensions

1.  **MedBeads** (arXiv:2602.01086, 2026). [https://arxiv.org/abs/2602.01086](https://arxiv.org/abs/2602.01086)

## Governance and economics

1.  EU AI Act. [https://artificialintelligenceact.eu/](https://artificialintelligenceact.eu/)
2.  Baker Donelson, **“2026 AI Legal Forecast”**. [https://www.bakerdonelson.com/2026-ai-legal-forecast-from-innovation-to-compliance](https://www.bakerdonelson.com/2026-ai-legal-forecast-from-innovation-to-compliance)
3.  SitePoint, **“AI Coding Tools ROI 2026”**. [https://www.sitepoint.com/ai-coding-tools-cost-analysis-roi-calculator-2026/](https://www.sitepoint.com/ai-coding-tools-cost-analysis-roi-calculator-2026/)
4.  Kinkan, **“True Cost of Coding Agents”**. [https://news.kinkan.ch/true-cost-coding-agents-roi-tco-analysis/](https://news.kinkan.ch/true-cost-coding-agents-roi-tco-analysis/)

## Benchmarks

1.  SWE-Bench official. [https://www.swebench.com/](https://www.swebench.com/)
2.  JetBrains, **DPAI Arena** (October 2025). [https://blog.jetbrains.com/ai/dpai-arena/](https://blog.jetbrains.com/ai/dpai-arena/)
3.  **SWE-bench Goes Live!** benchmark evolution. [https://arxiv.org/abs/2505.23419](https://arxiv.org/abs/2505.23419)

## Editor’s Note

> <em>This article reflects the toolchain and literature as checked on March 22, 2026. The Beads documentation shows an active transition in storage design; verify the exact behavior of the</em> <em>bd and</em> <em>bv versions you install before automating around their file layout. The Ralph ecosystem is evolving rapidly — multiple implementations exist alongside the official CLI. Pin your versions, document your conventions, and treat this article as a starting map rather than a permanent reference. Statistics from vendor reports (Anthropic's 2026 Agentic Coding Trends Report, PwC's SDLC analysis) reflect those vendors' methodologies and sample populations; treat exact percentages with appropriate skepticism while accepting the directional trends. The Amazon Kiro incident is sourced from a single blog; independent verification is incomplete.</em>
