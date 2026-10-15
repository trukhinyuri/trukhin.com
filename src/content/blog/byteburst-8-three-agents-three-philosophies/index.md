---
title: "BYTEBURST #8: Three Agents, Three Philosophies"
description: "Three companies built the same thing — a coding agent. They arrived at architectures so different that they share almost no design decisions. One hardens its binary before main() even runs."
pubDate: 2026-03-31T18:40:11.000Z
lang: en
tags: ["ai", "architecture", "agents"]
series: byteburst
seriesOrder: 8
status: imported
canonical: "https://blog.trukhin.com/byteburst-8-three-agents-three-philosophies-1d88af1882b7"
medium:
  id: "1d88af1882b7"
  url: "https://medium.com/trukhinyuri/byteburst-8-three-agents-three-philosophies-1d88af1882b7"
  oldPaths: ["/byteburst-8-three-agents-three-philosophies-1d88af1882b7", "/p/1d88af1882b7"]
  textHash: "bd96ac5f79c82ab398898cf7b8a965599ca9ea3c4fcbee9cac65d486c9646217"
---
> <em>Three companies built the same thing — a coding agent. They arrived at architectures so different that they share almost no design decisions. One hardens its binary before</em> <em>main() even runs. Another builds five independent strategies for compressing a single conversation. The third calls a separate AI just to decide which AI should answer your question.</em>

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*9TiI0bEYFFQjvGUN-_apdA.png" alt="Image from the original post" loading="eager" fetchpriority="high" decoding="async"></figure>

## Editorial

If you give three of the world’s top AI labs the exact same product spec — a command-line coding agent — you might expect their engineering teams to eventually converge on a shared set of architectural best practices.

**You would be wrong.**

In this issue of *ByteBurst*, I present a forensic analysis of the three most significant open-source CLI coding agents released to date: Anthropic’s Claude Code, OpenAI’s Codex CLI, and Google’s Gemini CLI. I sifted through nearly 4,000 source files expecting to document different variations of the standard “LLM-in-a-loop.” Instead, I discovered three fundamentally incompatible philosophies of software engineering, economics, and — most importantly — trust.

At a glance, all three tools promise the same future: they live in your terminal, read your files, write code, and execute shell commands. But peel back the runtime, and the differences in their engineering DNA reveal what these companies truly value.

### **Anthropic believes the model is the ultimate orchestrator**

Claude Code (~1,884 TypeScript files) operates on a single belief: *the model is smart enough to drive; we just need to pave the road.* Claude attacks the context window problem with a relentless pipeline of five orthogonal compaction strategies. Dig into its hidden feature flags, and you will even find undocumented systems like autoDream—an autonomous background process that consolidates memory while you are away, mimicking human sleep. Anthropic’s bet is on raw cognitive power and uncompromised context retention, but it leaves execution security largely to application-level rules.

### **OpenAI operates on rigorous paranoia**

If Claude is a sprawling collaborative workspace, Codex CLI is a supermax prison. OpenAI built a remarkably lean 46-crate Rust workspace that assumes the LLM *will* eventually be hijacked by prompt injection. It hardens its own binary before the main() function even executes, stripping away core dumps and disabling ptrace. It is the only agent of the three that enforces security at the OS-kernel level (macOS Seatbelt, Linux Landlock). Throw in "Ghost Snapshots" for invisible Git rollbacks, and OpenAI’s philosophy becomes uncompromisingly clear: *trust the operating system, not the AI.*

### **Google approaches the problem as an algorithmic hyperscaler**

Gemini CLI focuses heavily on intelligent routing and cost optimization at planetary scale. It is the only agent that will actively spend money to save money — utilizing a meta-LLM classifier whose sole job is to intercept your query and route it to either the cheaper Gemini Flash or the smarter Gemini Pro. Google also relies on LLMs for meta-cognition to break infinite loops, and is the only architecture natively standardizing inter-agent communication over a network via the Agent-to-Agent (A2A) protocol.

Perhaps the most startling insight from our investigation is the inverse relationship between codebase size and security depth. The tool with the smallest codebase (Codex) has the deepest, most resilient defense stack.

Why does all of this matter? Because the era of competing on feature checklists is over.

Today, industry data suggests that 88% of AI agents never reach production. The primary culprit is compound unreliability: an 85% success rate per step over a 10-step task yields just a 20% chance of end-to-end success. The architectural decisions we dissect in this issue are not academic exercises — they are the literal blueprints required to survive contact with the real world.

The perfect, zero-compromise coding agent does not exist yet. But if we could play Dr. Frankenstein, we would combine the kernel-level hardening of Codex, the memory compaction engine of Claude, and the economic routing swarms of Gemini. Every single component of the “Ideal Agent” has already been successfully implemented in production; they just exist in isolated silos.

The race to assemble them starts now. Until then, your choice of AI coding assistant must be dictated by your threat model and your scale.

Welcome to **ByteBurst #8**. The blueprint for the next generation of autonomous software development is hidden in the source code. Let’s dig in.

## TL;DR for the Impatient

-   **Best for security: Codex CLI** — kernel-level sandbox (Seatbelt/Landlock/seccomp) on all OSes, process hardening before main(), execve(2) interception in Bash
-   **Best for power users: Claude Code** — 30+ tools, 5 compaction strategies, Agent Teams, Coordinator Mode, broadest MCP support
-   **Best for cost optimization: Gemini CLI** — LLM classifier automatically picks Pro vs Flash, loop detection, 2M context
-   **Most surprising finding:** The agent with the smallest codebase (Codex, 46 Rust crates) has the deepest security stack, while the one with the largest (Gemini, 1,375 TS files) is the only one that spends separate LLM calls on meta-decisions

> <strong><em>Thesis:</em></strong> <em>Our analysis shows that the three agents embody three fundamentally incompatible philosophies of</em> trust in AI <em>— and the right choice is determined by your threat model, not a feature checklist.</em>

```
+-----------------+     +------------------+     +-----------------+
 |   Claude Code   |     |    Codex CLI     |     |   Gemini CLI    |
 |   (Anthropic)   |     |     (OpenAI)     |     |    (Google)     |
 |                 |     |                  |     |                 |
 | TypeScript/Ink  |     |   Rust + TS shim |     | TypeScript/Ink  |
 | 1,884 files     |     |   46 Rust crates |     | 1,375 files    |
 | bun runtime     |     |   tokio async    |     | Node.js runtime |
 +---------+-------+     +--------+---------+     +--------+--------+
           |                      |                         |
           v                      v                         v
    ┌──────────────────────────────────────────────────────────────┐
    │              MODEL AS ORCHESTRATOR                            │
    │   ReAct Loop: Reason → Act → Observe → Reason → ...         │
    └──────────────────────────────────────────────────────────────┘
```

## Table of Contents

-   [Introduction](#introduction)
-   [Part I: Overview and Key Metrics](#part-i-overview-and-key-metrics)
-   [Part II: Entry Point and Bootstrap](#part-ii-entry-point-and-bootstrap)
-   [Part III: The Core — Agent Loop](#part-iii-the-core--agent-loop)
-   [Part IV: The Tool System](#part-iv-the-tool-system)
-   [Part V: Sandbox and Security](#part-v-sandbox-and-security)
-   [Part VI: Context and Memory Management](#part-vi-context-and-memory-management)
-   [Part VII: MCP and Integrations](#part-vii-mcp-and-integrations)
-   [Part VIII: Multi-Agent Architecture](#part-viii-multi-agent-architecture)
-   [Part IX: User Interface](#part-ix-user-interface)
-   [Part X: Comparative Architectural Analysis](#part-x-comparative-architectural-analysis)
-   [Part XI: Unique Engineering Decisions](#part-xi-unique-engineering-decisions)
-   [Part XII: Conclusions and the Future](#part-xii-conclusions-and-the-future)
-   [Part XIII: Hidden Capabilities](#part-xiii-hidden-capabilities--what-the-docs-dont-tell-you)
-   [Part XIV: Error Recovery, Diff Algorithms, Telemetry](#part-xiv-what-didnt-make-the-cut--error-recovery-diff-algorithms-telemetry)

## Introduction

Three companies — Anthropic, OpenAI, and Google — have released open-source CLI agents for development. Each represents a unique design philosophy, approach to security, and engineering craft. We examined **every source file** of all three projects and prepared a forensic-grade analysis.

**What we analyzed:**

-   **Claude Code** (Anthropic) — 1,884 TypeScript/TSX files, Bun runtime, full fork of Ink
-   **Codex CLI** (OpenAI) — 46 Rust crates (workspace) + TypeScript shim, tokio async, Ratatui TUI
-   **Gemini CLI** (Google) — 1,375 TypeScript/TSX source files (+ 1,312 in dist/), Node.js, React/Ink, A2A protocol

## Part I: Overview and Key Metrics

### Project Passport

```
┌─────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│                     │    Claude Code      │     Codex CLI      │    Gemini CLI      │
├─────────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Company             │ Anthropic           │ OpenAI             │ Google             │
│ Core language       │ TypeScript          │ Rust               │ TypeScript         │
│ Runtime             │ Bun                 │ tokio (async)      │ Node.js            │
│ UI framework        │ Ink (full fork)     │ Ratatui            │ Ink (patched fork) │
│ Source files        │ ~1,884 TS/TSX      │ ~789 RS + 29 TS    │ ~1,375 TS/TSX     │
│ Architecture        │ Monolith + plugins  │ 46-crate workspace │ 5-package monorepo │
│ Sandbox             │ Custom runtime      │ OS-native per-plat │ Docker/Seatbelt    │
│ MCP transports      │ 6                   │ stdio + JSON-RPC   │ 4                  │
│ Default model       │ Claude Sonnet/Opus  │ codex              │ Gemini 2.5 Pro/Fl  │
│ Multi-agent         │ Agent Teams + fork  │ Subagents          │ A2A + local agents │
│ Context window      │ 200K–1M tokens      │ Model-dependent    │ 2M tokens          │
│ Open Source         │ Partial (CLI)       │ Yes (Apache 2.0)   │ Yes (Apache 2.0)   │
└─────────────────────┴────────────────────┴────────────────────┴────────────────────┘
```

### Design Philosophy

Three fundamentally different approaches:

**Claude Code: “The Model Is the Orchestrator”**

Anthropic minimizes framework logic. The model itself decides what to do. The framework provides reliable tool execution and observability. The system prompt is assembled dynamically from 137+ modular fragments. Five independent context compaction strategies work orthogonally.

**Codex CLI: “Security at the OS Kernel Level”**

OpenAI bet on Rust and kernel-level sandboxing. Seatbelt on macOS, Landlock + seccomp on Linux, restricted tokens on Windows. Even if all application-level code is compromised, the OS kernel will not let the agent escape its boundaries. Process hardening disables ptrace and core dumps <strong>before</strong> <strong>main()</strong>.

**Gemini CLI: “Intelligent Routing”**

Google focuses on cost and quality optimization. An LLM classifier automatically chooses between Pro and Flash models. The availability system cascades through a fallback chain. Loop detection uses three methods including LLM-based analysis. The only one of the three with native A2A protocol support for inter-agent communication.

## Part II: Entry Point and Bootstrap

### Claude Code: Multi-Layered Lazy Startup

```
                       ┌────────────────────────┐
                       │  cli.tsx: main()        │
                       │  process.argv capture   │
                       └───────────┬────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
               --version     --daemon      (default)
               Zero imports  Worker mode   Full init
               Instant exit  Lean mode         │
                                               v
                                    ┌──────────────────┐
                                    │  init.ts (memoized)│
                                    │                    │
                                    │ 1. enableConfigs() │
                                    │ 2. Safe env vars   │
                                    │ 3. CA certs (early)│
                                    │ 4. Graceful shutdn │
                                    │ 5. Analytics       │
                                    │ 6. OAuth populate  │
                                    │ 7. IDE detection   │
                                    │ 8. GitHub detect   │
                                    │ 9. Managed settings│
                                    │ 10. mTLS config    │
                                    │ 11. Proxy config   │
                                    │ 12. API preconnect │
                                    │ 13. LSP cleanup    │
                                    │ 14. Scratchpad init│
                                    └──────────────────┘
```

> <strong><em>KEY INSIGHT:</em></strong> <em>The time from typing</em> <em>claude --version to receiving a response is under 1ms. Not a single module is loaded. This is not a coincidence — it is the result of an architecture where every</em> <em>import() is dynamic and conditional.</em>

**Key decision: Fast-path dispatch.**

Before loading the full CLI, special flags are checked. --version returns its result with zero imports. All loads go through dynamic await import(...), minimizing startup time.

**bun:bundle and dead code elimination.**

The feature('FLAG') call from bun:bundle works only inside if/ternary conditions, allowing the tree-shaker to remove entire modules from external builds. ABLATION\_BASELINE in the first lines of cli.tsx disables many features at once for A/B testing.

**API preconnect** — the TCP+TLS handshake runs in parallel with the rest of initialization, saving 100–300ms on the first API call.

### Codex CLI: arg0 Dispatch Trick

```
                  ┌─────────────────────────────────┐
                 │  main.rs → arg0_dispatch()       │
                 │  Inspect argv[0] filename        │
                 └───────────┬─────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         "codex"    "codex-linux-    "apply_patch"
              │      sandbox"         │
              │         │             │
              v         v             v
         CLI router  Sandbox exec  Patch parser
         (clap)      (never returns) (exit after)
              │
              v
         ┌────────────────────────┐
         │ Create temp dir with   │
         │ symlinks:              │
         │   apply_patch → codex  │
         │   codex-linux-sandbox  │
         │          → codex       │
         │ Prepend to PATH        │
         │ Load .env              │
         │ (before any threads!)  │
         └────────────┬───────────┘
                      │
                      v
         ┌────────────────────────┐
         │ tokio::runtime::new()  │
         │ → async main           │
         └────────────────────────┘
```

> <strong><em>KEY INSIGHT:</em></strong> <em>A Codex release is a single file. One. Not three binaries, not a runtime dependency — one ELF/Mach-O with LTO fat optimization that masquerades as three programs via UNIX symlinks. This is systems programming at a level you don’t expect from an AI startup.</em>

**The genius of arg0:** A single codex binary acts as three different programs through symlinks. On Unix, argv\[0\] contains the name under which the program was invoked. Codex creates a temp directory with symlinks and prepends it to PATH — child processes (sandbox, patch applicator) call themselves through these symlinks.

**Loading .env before creating threads** — set\_var is unsafe in a multi-threaded context, so env vars are read during the single-threaded phase.

<strong>Process hardening (</strong><strong>#\[ctor::ctor\])</strong> — code executes **before main():**

-   Disables core dumps (prevents credential leakage)
-   Disables ptrace (prevents debugging/injection)
-   Removes LD\_PRELOAD, DYLD\_\* (prevents library injection)

### Gemini CLI: Multi-Process Architecture

```
                     ┌────────────────────────────────┐
                    │   gemini.tsx: main()            │
                    │                                │
                    │ 1. loadSettings()              │
                    │ 2. Trusted folders check       │
                    │ 3. parseArguments()            │
                    │ 4. DNS config (IPv4-first)     │
                    │ 5. Auth type detection         │
                    │ 6. Pre-authentication          │
                    │    (BEFORE sandbox!)            │
                    │ 7. Admin controls fetch        │
                    │ 8. Sandbox decision            │
                    │ 9. Memory relaunch             │
                    │    (50% RAM → Node heap)       │
                    └───────────────┬────────────────┘
                                    │
                                    v
                    ┌────────────────────────────────┐
                    │ relaunchAppInChildProcess()     │
                    │                                │
                    │ Parent = supervisor             │
                    │ Child = actual app              │
                    │ Specific exit codes → restart   │
                    │ Hot-reload without state loss   │
                    └────────────────────────────────┘
```

**Unique: Pre-authentication before sandbox.** OAuth tokens are refreshed before entering the container — inside Docker/Seatbelt the network may be restricted.

**Memory relaunch** — Gemini CLI calculates the optimal heap size (50% of RAM) and restarts itself with the correct --max-old-space-size if the current one is suboptimal.

**Supervisor pattern** — main() always launches itself as a child process. The parent monitors exit codes and restarts when needed. This enables hot-reload without state loss.

## Part III: The Core — Agent Loop

### Claude Code: AsyncGenerator Streaming Loop

The heart of Claude Code is the query() function in query.ts, implemented as an **AsyncGenerator**:

```
              ┌──────────────────────────┐
              │     query() AsyncGen     │
              │                          │
              │  yield* queryLoop()      │
              └─────────────┬────────────┘
                            │
                            v
              ┌──────────────────────────────────────────────────┐
              │                 queryLoop()                       │
              │                                                  │
              │  State = { messages, toolUseContext,              │
              │            autoCompactTracking, turnCount, ... } │
              │                                                  │
              │  ┌─────────────────────────────────────────┐     │
              │  │ Per-iteration:                          │     │
              │  │                                         │     │
              │  │ 1. Memory prefetch (once per user turn) │     │
              │  │ 2. Snip compaction                      │     │
              │  │ 3. Microcompact                         │     │
              │  │ 4. Context collapse                     │     │
              │  │ 5. Autocompact (if tokens > threshold)  │     │
              │  │ 6. Token budget check                   │     │
              │  │ 7. ── API CALL (streaming) ──────────   │     │
              │  │ 8. Stream tool execution (concurrent!)  │     │
              │  │ 9. Tool result collection               │     │
              │  │ 10. Stop hooks                          │     │
              │  │ 11. Continue? (tool_use → loop)         │     │
              │  └─────────────────────────────────────────┘     │
              └──────────────────────────────────────────────────┘
```

> <strong><em>KEY INSIGHT:</em></strong> <em>Claude Code is the only one of the three that tackles the context window problem not with a single strategy, but with a pipeline of five. It is like having five compression stages in an engine — each activating at its own pressure threshold.</em>

**Five compaction strategies run sequentially** on each iteration: snip → microcompact → context collapse → autocompact → tool result budget. Each is independently feature-gated.

**Streaming tool execution** — tools begin executing **while the model is still streaming**. As soon as a tool\_use block appears in the stream, it is immediately dispatched if the tool is concurrency-safe.

**“Withhold and recover” pattern** — on recoverable API errors (prompt-too-long, max-output-tokens), the streaming event is held back. MAX\_OUTPUT\_TOKENS\_RECOVERY\_LIMIT = 3 allows automatic continuation when the output token limit is reached.

**Autocompact** runs as a **forked agent** — a separate model call that summarizes the conversation. Key constants: POST\_COMPACT\_TOKEN\_BUDGET = 50\_000, POST\_COMPACT\_MAX\_FILES\_TO\_RESTORE = 5.

### Codex CLI: SQ/EQ Protocol + tokio

```
              ┌─────────────────────────────────────┐
              │         Codex SQ/EQ Protocol         │
              │                                     │
              │  ┌──────────┐     ┌──────────────┐  │
              │  │    UI    │     │    Session    │  │
              │  │ (TUI/IDE)│     │  (Business)  │  │
              │  │          │     │              │  │
              │  │  tx_sub ─┼──>──┼─ rx_sub      │  │
              │  │          │  64 │              │  │
              │  │  rx_evt <┼──<──┼─ tx_evt      │  │
              │  │          │  ∞  │              │  │
              │  └──────────┘     └──────────────┘  │
              │                                     │
              │  Submission: UserInput, Interrupt,   │
              │    ExecApproval, PatchApproval,      │
              │    Compact, Undo, Shutdown           │
              │                                     │
              │  Event: AssistantMessage, ToolCall,  │
              │    ExecApprovalRequest, StreamDelta, │
              │    TurnComplete, Error               │
              └─────────────────────────────────────┘
```

Codex uses a **Submission Queue / Event Queue** pattern — explicitly documented in protocol/src/protocol.rs. This is clean decoupling: the UI sends Submission (with an Op enum), the business logic replies with Event. Bounded channel (capacity 64) for submissions, unbounded for events.

**Task Architecture** via the SessionTask trait:

```
#[async_trait]
pub trait SessionTask: Send + Sync + 'static {
    fn kind(&self) -> TaskKind;
    async fn run(self: Arc<Self>, session, ctx, input, token) -> Option<String>;
    async fn abort(&self, session, ctx) { }
}
```

Concrete implementations: RegularTask (main agent loop), CompactTask, UndoTask, ReviewTask, GhostSnapshotTask, UserShellCommandTask. At-most-one active task is enforced via Session::spawn\_task.

**Streaming inner loop** (try\_run\_turn):

1.  Gather MCP tools from all connected servers
2.  Build a ToolRouter with all available tools
3.  Create a Prompt with history, tool specs, instructions
4.  Call client.stream(prompt) — SSE stream from the API
5.  Create a ToolCallRuntime for dispatching tool calls
6.  Process ResponseEvent variants in the streaming loop

**Concurrent tool execution** via FuturesOrdered with RwLock: parallel tools acquire a read lock, serial ones acquire a write lock.

**Retry** with exponential backoff; the budget is determined by stream\_max\_retries().

### Gemini CLI: Recursive Generator with Intelligent Routing

```
              ┌──────────────────────────────────────────────┐
              │         Gemini Agent Loop                     │
              │                                              │
              │  sendMessageStream() ─── RECURSIVE ─────┐   │
              │       │                                  │   │
              │       v                                  │   │
              │  processTurn()                           │   │
              │   ├── tryCompressChat()                  │   │
              │   ├── Token overflow check               │   │
              │   ├── IDE context injection              │   │
              │   ├── Loop detection (3 methods!)        │   │
              │   ├── ┌────────────────────────────┐     │   │
              │   │   │  MODEL ROUTER              │     │   │
              │   │   │  Classifier → Pro or Flash │     │   │
              │   │   └────────────────────────────┘     │   │
              │   ├── Availability check + fallback      │   │
              │   ├── Turn.run() → streaming events      │   │
              │   └── Next speaker check (LLM call)      │   │
              │                                          │   │
              │  If tool_calls in response:              │   │
              │   └── CoreToolScheduler.schedule()       │   │
              │        └── Collect results               │   │
              │             └── sendMessageStream() ─────┘   │
              │                  (recursive call)            │
              │                                              │
              │  MAX_TURNS = 100                             │
              └──────────────────────────────────────────────┘
```

**Recursive generator** instead of a loop: sendMessageStream() calls itself recursively when the model requests tool calls. Tool results are passed as functionResponse parts in the next recursive invocation.

**Model Router — a unique feature** (packages/core/src/routing/modelRouterService.ts:39-48):

```
Priority chain (5 strategies):
  1. FallbackStrategy             → Fallback if model is unavailable
  2. OverrideStrategy             → Explicit user override
  3. ClassifierStrategy           → LLM classifier: Pro or Flash?
  4. NumericalClassifierStrategy  → Alternative numerical routing
  5. DefaultStrategy              → Configured default model
```

> <strong><em>KEY INSIGHT:</em></strong> <em>Gemini CLI is the only agent that spends money (an LLM call) to</em> save <em>money (routing to a cheaper model). This is a counter-intuitive strategy, but at high request volumes the savings from Flash vs Pro far exceed the cost of the classifier.</em>

ClassifierStrategy makes a **separate LLM call** to a classifier model that analyzes request complexity. Neither Claude Code nor Codex CLI has anything like it.

**Loop Detection — three methods:**

1.  **Tool Call Hashing** — identical sequences of tool calls (threshold: 5 repetitions)
2.  **Content Hashing** — repeating content (threshold: 10, chunk size: 50 chars)
3.  **LLM-Based Detection** — after 30 turns, a periodic LLM call asks “is the agent stuck?” with an adaptive interval

**Next Speaker Check** — after each turn, a lightweight LLM call determines: continue or yield to the user. This prevents premature stopping on complex tasks.

## Part IV: The Tool System

### Tool Inventory

```
┌───────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│   Category        │    Claude Code        │     Codex CLI        │    Gemini CLI        │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Shell execution   │ BashTool             │ ShellHandler         │ ShellTool            │
│                   │ PowerShellTool       │ UnifiedExecHandler   │ (node-pty + xterm)   │
│                   │                      │ (PTY-based)          │                      │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ File read         │ FileReadTool         │ ReadFileHandler      │ ReadFileTool         │
│                   │                      │                      │ ReadManyFilesTool    │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ File write        │ FileWriteTool        │ ApplyPatchHandler    │ WriteFileTool        │
│ File edit         │ FileEditTool         │ (Lark grammar!)      │ EditTool (with LLM   │
│                   │ (search-replace)     │                      │  correction!)        │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Search            │ GlobTool, GrepTool   │ GrepFilesHandler     │ GlobTool, GrepTool   │
│                   │                      │ ListDirHandler       │ LSTool, RipGrepTool  │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Web               │ WebFetchTool         │ (network disabled    │ WebSearchTool        │
│                   │ WebSearchTool        │  by default)         │ WebFetchTool         │
│                   │                      │                      │ (Google grounding!)  │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Agent/Task mgmt   │ AgentTool, TaskCreate│ Subagent spawning    │ SubagentTool         │
│                   │ TeamCreate, SendMsg  │                      │ ActivateSkillTool    │
│                   │ 8 task tools total   │                      │                      │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Memory            │ (via CLAUDE.md)      │ (via AGENTS.md)      │ MemoryTool           │
│                   │                      │                      │ (save_memory)        │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Other             │ SkillTool, Notebook  │ ViewImageHandler     │ WriteTodosTool       │
│                   │ ToolSearchTool       │ PlanHandler          │ AskUserTool          │
│                   │ EnterPlanMode, Brief │ ReviewHandler        │ GetInternalDocsTool  │
│                   │ LSPTool, SleepTool   │                      │                      │
│                   │ WebBrowserTool*      │                      │                      │
│                   │ MonitorTool*         │                      │                      │
│                   │ TungstenTool*        │                      │                      │
│                   │ SendUserFile*        │                      │                      │
│                   │ PushNotification*    │                      │                      │
│                   │ (* = feature-gated)  │                      │                      │
├───────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ TOTAL (built-in)  │ ~40+ (30 public      │ ~12                  │ ~14                  │
│                   │  + 10 feature-gated) │                      │                      │
└───────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

### Tool Dispatch Architecture

**Claude Code — StreamingToolExecutor with partitioning:**

```
// Fail-closed defaults — everything is forbidden unless explicitly allowed
const TOOL_DEFAULTS = {
  isConcurrencySafe: () => false,   // assume not safe
  isReadOnly: () => false,          // assume writes
  isDestructive: () => false,
}
```

Tools are partitioned via partitionToolCalls():

-   **Concurrency-safe** (read-only) → parallel (up to MAX\_TOOL\_USE\_CONCURRENCY = 10)
-   **Non-concurrent** → serial

Full execution pipeline:

1.  Parse + Zod validation
2.  PreToolUse hooks
3.  Permission check (canUseTool())
4.  tool.call() execution
5.  PostToolUse hooks
6.  Result mapping
7.  Persist large results to disk if > maxResultSizeChars

**Codex CLI — Orchestrator with approval-sandbox-retry:**

```
               ┌───────────────────────────────────────────┐
              │          ToolOrchestrator                   │
              │                                             │
              │  1. Check ExecApprovalRequirement           │
              │     ├── Skip → execute directly             │
              │     ├── NeedsApproval → prompt user         │
              │     └── Forbidden → reject                  │
              │                                             │
              │  2. Execute under platform sandbox          │
              │     └── Success → return result             │
              │                                             │
              │  3. On sandbox denial:                      │
              │     └── If escalation allowed:              │
              │         └── Ask user → retry without sandbox│
              └───────────────────────────────────────────┘
```

> <strong><em>KEY INSIGHT:</em></strong> <em>Codex is the only agent where even if all application-level code is compromised, the OS kernel will not let the agent escape its boundaries. Claude Code and Gemini CLI rely on application-level checks — their sandbox can be bypassed via prompt injection that circumvents the permission logic.</em>

This is graceful degradation: the sandbox blocks → Codex detects → asks the user → retries without the sandbox.

**apply\_patch** — a unique tool with its **own Lark grammar** for parsing patches. Two variants:

-   **Freeform**: The model outputs a custom patch format (not JSON function-calling)
-   **Function**: Standard JSON function calling with an input field

**Gemini CLI — Builder + Invocation pattern with LLM edit correction:**

```
BaseDeclarativeTool (Builder)
    │
    ├── build(args) → SchemaValidator (ajv) → validates
    │
    └── BaseToolInvocation (Invocation)
         ├── getDescription()
         ├── toolLocations()
         ├── shouldConfirmExecute()
         └── execute() → ToolResult
```

**Edit Correction** — if the old string is not found exactly, a **separate LLM** is called for fuzzy-matching to find the correct match. Neither Claude Code nor Codex does this.

**Shell tool** uses node-pty + @xterm/headless terminal emulation with a **1-billion-line scrollback buffer** and tree-sitter-bash for command parsing.

## Part V: Sandbox and Security

### Comparing Security Models

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEFENSE DEPTH                                        │
│                                                                            │
│  Claude Code          Codex CLI              Gemini CLI                    │
│                                                                            │
│  ┌──────────────┐    ┌──────────────┐       ┌──────────────┐              │
│  │ Application  │    │ Application  │       │ Application  │              │
│  │ Layer        │    │ Layer        │       │ Layer        │              │
│  │              │    │              │       │              │              │
│  │ Permission   │    │ Command      │       │ PolicyEngine │              │
│  │ rules engine │    │ safety DB    │       │ + tree-sitter│              │
│  │ + hooks      │    │ + execpolicy │       │ bash parsing │              │
│  │ + classifier │    │ Starlark     │       │              │              │
│  └──────┬───────┘    └──────┬───────┘       └──────┬───────┘              │
│         │                   │                      │                      │
│  ┌──────┴───────┐    ┌──────┴───────┐       ┌──────┴───────┐              │
│  │ Runtime      │    │ OS Kernel    │       │ Container    │              │
│  │ Sandbox      │    │ Enforcement  │       │ Isolation    │              │
│  │              │    │              │       │              │              │
│  │ @anthropic/  │    │ macOS:       │       │ Docker/      │              │
│  │ sandbox-     │    │  Seatbelt    │       │ Podman       │              │
│  │ runtime      │    │  (SBPL)      │       │              │              │
│  │              │    │              │       │ macOS:       │              │
│  │ Network:     │    │ Linux:       │       │  Seatbelt    │              │
│  │  allowedDo-  │    │  Landlock v5 │       │  (.sb files) │              │
│  │  mains       │    │  + seccomp   │       │              │              │
│  │              │    │  BPF         │       │              │              │
│  │ Filesystem:  │    │              │       │              │              │
│  │  write allow │    │ Windows:     │       │              │              │
│  │  read deny   │    │  Restricted  │       │              │              │
│  │              │    │  tokens      │       │              │              │
│  └──────────────┘    └──────────────┘       └──────────────┘              │
│                                                                            │
│  ┌──────────────┐    ┌──────────────┐       ┌──────────────┐              │
│  │ Pre-main     │    │ Pre-main     │       │ Auth         │              │
│  │ (none)       │    │ HARDENING    │       │ Pre-sandbox  │              │
│  │              │    │              │       │              │              │
│  │              │    │ Disable      │       │ OAuth tokens │              │
│  │              │    │  ptrace      │       │ refreshed    │              │
│  │              │    │  core dumps  │       │ BEFORE       │              │
│  │              │    │ Strip        │       │ entering     │              │
│  │              │    │  LD_PRELOAD  │       │ container    │              │
│  │              │    │  DYLD_*      │       │              │              │
│  └──────────────┘    └──────────────┘       └──────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Claude Code: Programmatic Sandbox with Classifier

**Permission resolution flow:**

1.  hasPermissionsToUseTool() — checks rules, hooks, classifiers
2.  Allow → resolve immediately
3.  Deny → reject (+ auto-mode denial recording)
4.  Ask → cascade:

-   Coordinator permissions
-   Swarm worker permissions
-   **Speculative bash classifier** (races against a 2-second timeout)
-   Interactive prompt

**Speculative classifier** — runs in parallel with permission evaluation. If it resolves within 2 seconds with high confidence — auto-approve without prompting.

**Denial tracking circuit breaker** — after DENIAL\_LIMITS consecutive denials, the system switches from auto-deny to prompting, preventing the model from looping.

**Constrained is absent** — unlike Codex, project settings can potentially weaken security policies.

### Codex CLI: Kernel-level Enforcement

**macOS Seatbelt:**

```
(deny default)                    ← Start: everything denied
(allow process-fork)              ← Allow fork
(allow file-read*)                ← Allow reads
(allow file-write* (subpath "/specific/writable/root"))
                                  ← Writes only to specified paths
(deny file-write* (subpath ".codex"))
                                  ← .codex always read-only
(deny file-write* (subpath ".git/hooks"))
                                  ← .git/hooks always read-only
```

Execution goes through /usr/bin/sandbox-exec (hardcoded path — protection against PATH injection).

**Linux Landlock + seccomp:**

-   **Landlock ABI V5**: filesystem access control, writes only to writable\_roots
-   **seccomp BPF**: blocks network syscalls (connect, sendto, sendmsg)
-   Both are applied per-thread to the child process

**Constrained\<T> wrapper** (core/src/config/constraint.rs:41) — a unique construct:

```
pub struct Constrained<T> {
    value: T,
    validator: Arc<ConstraintValidator<T>>,
    // Validator closure prevents project-level configs
    // from weakening user-level security policies
}
```

**shell-tool-mcp** — a patched Bash intercepts <strong>every</strong> <strong>execve(2) syscall</strong> via BASH\_EXEC\_WRAPPER. Every command execution is escalated to the MCP server for a policy decision (Run/Escalate/Deny).

### Gemini CLI: Container-First with Policy Engine

**Three sandbox modes:**

1.  **Docker/Podman** — custom image, mount project dir, network bridge, cleanup on exit
2.  **macOS Seatbelt** — .sb profiles in the .gemini/ directory
3.  **No sandbox** — with a warning in the system prompt

**PolicyEngine** — a prioritized rule chain:

1.  Static rules (pattern matching: tool name + args regex)
2.  Safety checkers (AllowedPathChecker + external)
3.  Hook checkers
4.  Shell command analysis (tree-sitter-bash: detects redirections >, >>, |)

**Approval modes:**

-   DEFAULT — ask for dangerous operations
-   AUTO\_EDIT — auto-approve file edits
-   YOLO — auto-approve everything
-   PLAN — read-only mode (only glob, search, read, ls, web\_search, ask\_user)

## Part VI: Context and Memory Management

### Context Management Strategies

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    CONTEXT WINDOW                                             │
│                                                                              │
│  Claude Code (200K-1M tokens)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ System prompt (static + dynamic boundary for cache)                    │ │
│  │ ├── Core instructions                                                  │ │
│  │ ├── Tools (sorted alphabetically for cache stability)                  │ │
│  │ ├── MCP tools (sorted separately)                                     │ │
│  │ └── CLAUDE.md content                                                  │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │ Conversation history                                                   │ │
│  │ ├── 5 COMPACTION STRATEGIES:                                           │ │
│  │ │   1. Snip (fast removal of old messages)                             │ │
│  │ │   2. Microcompact (per-message summarization)                        │ │
│  │ │   3. Context collapse (progressive collapsing)                       │ │
│  │ │   4. Autocompact (full summarization via forked agent)               │ │
│  │ │   5. Tool result budget (large results → disk + preview)             │ │
│  │ │                                                                      │ │
│  │ │   Threshold: effectiveWindow - 13,000 tokens                         │ │
│  │ │   Circuit breaker: MAX_CONSECUTIVE_FAILURES = 3                      │ │
│  │ │   Post-compact budget: 50,000 tokens                                 │ │
│  │ └───────────────────────────────────────────────────────────────────────│ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Codex CLI (model-dependent)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Conversation history                                                   │ │
│  │ ├── Auto-compact when tokens > model limit                             │ │
│  │ ├── Local OR remote compaction                                         │ │
│  │ ├── TruncationPolicy for tool outputs                                  │ │
│  │ │   (preserves beginning + end — most diagnostic info)                 │ │
│  │ └── Ghost snapshots for recovery                                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Gemini CLI (2M tokens)                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Conversation history                                                   │ │
│  │ ├── Compression at 50% of token limit                                  │ │
│  │ ├── Strategy: keep last 30%, summarize rest via Flash model            │ │
│  │ ├── Function response budget: 50,000 tokens                            │ │
│  │ ├── Long outputs truncated to 30 lines (full → temp file)              │ │
│  │ └── thoughtSignature injection for API validation                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Memory System (Memory Files)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        MEMORY HIERARCHY                                     │
│                                                                            │
│  Claude Code                Codex CLI           Gemini CLI                 │
│                                                                            │
│  /etc/claude-code/          ~/.codex/            ~/.gemini/                 │
│    CLAUDE.md (managed)       config.toml          GEMINI.md (global)       │
│                               (global)                                     │
│  ~/.claude/                                      Workspace root:           │
│    CLAUDE.md (user)         .codex/               GEMINI.md (project)      │
│    projects/*/memory/        config.toml                                   │
│      MEMORY.md (auto)        (project)           .gemini/ dir:             │
│      *.md (typed memories)                        GEMINI.md                │
│                             AGENTS.md                                      │
│  Project root:               (project context)   JIT Discovery:            │
│    CLAUDE.md                                      When tool accesses path, │
│    .claude/CLAUDE.md                              traverse up looking for  │
│    .claude/rules/*.md                             GEMINI.md files          │
│                                                                            │
│  Local (gitignored):                                                       │
│    CLAUDE.local.md                                                         │
│                                                                            │
│  Priority: Later = Higher                        @import directives        │
│  @include directives                              for file inclusion       │
│  (40+ extensions)                                                          │
│                                                                            │
│  Auto-memory:               No auto-memory       save_memory tool:         │
│   MEMORY.md index                                 Writes to GEMINI.md      │
│   MAX_LINES = 200                                                          │
│   MAX_BYTES = 25,000                                                       │
│   Relevant memory recall                                                   │
│    via Sonnet side-query                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Claude Code — the most sophisticated memory system:**

-   **Auto-memory** with MEMORY.md as an index file (200 lines, 25KB limit)
-   **Relevant memory recall** — a Sonnet side-query selects up to 5 relevant files
-   @include directives support 40+ extensions, with circular reference protection
-   Priority: closer to cwd = higher priority (loaded later → model pays more attention)

**Gemini CLI — JIT discovery:**

-   When a file is accessed, ContextManager.discoverContext() searches for GEMINI.md in parent directories
-   Tracks loaded paths to prevent duplicates
-   Emits MemoryChanged events

## Part VII: MCP and Integrations

### MCP Transport Support

```
┌────────────────────┬──────────────────┬──────────────────┬──────────────────┐
│   Transport        │   Claude Code    │    Codex CLI     │   Gemini CLI     │
├────────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ stdio              │       ✓          │       ✓          │       ✓          │
│ SSE                │       ✓          │       ✗          │       ✓          │
│ Streamable HTTP    │       ✓          │       ✗          │       ✓          │
│ WebSocket          │       ✓          │       ✗          │    (via TCP)     │
│ SDK Control        │       ✓          │       ✗          │       ✗          │
│ In-Process         │       ✓          │       ✗          │       ✗          │
│ JSON-RPC (as srv)  │       ✗          │       ✓          │       ✗          │
├────────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ MCP Auth (OAuth)   │       ✓          │       ✗          │   ✓ (3 types)   │
│ MCP Prompts        │       ✓          │       ✗          │       ✓          │
│ MCP Resources      │       ✓          │       ✗          │       ✓          │
│ MCP Elicitation    │       ✓          │       ✗          │       ✗          │
│ Codex AS MCP srv   │       ✗          │       ✓          │       ✗          │
│ A2A Protocol       │       ✗          │       ✗          │       ✓          │
└────────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Claude Code** — the broadest MCP support: 6 transports, OAuth, prompts, resources, elicitation. Tool naming: mcp\_\_\<server>\_\_\<tool>. Session management with McpSessionExpiredError (HTTP 404 + JSON-RPC -32001).

**Codex CLI** — minimal MCP as a client, but uniquely can operate **as an MCP server** (via mcp-server/), allowing other agents to use Codex as a tool.

**Gemini CLI** — full MCP + a unique **A2A Protocol server**:

-   3 OAuth types: DYNAMIC\_DISCOVERY, GOOGLE\_CREDENTIALS, SERVICE\_ACCOUNT\_IMPERSONATION
-   includeTools/excludeTools filtering per server
-   Environment sanitization (blocks secret leakage via env vars to MCP/child processes)

## Part VIII: Multi-Agent Architecture

### Comparing Multi-Agent Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     MULTI-AGENT CAPABILITIES                                 │
│                                                                              │
│  Claude Code                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Parent Agent                                                         │  │
│  │  ├── AgentTool (5 modes):                                             │  │
│  │  │   ├── Synchronous (foreground, blocks parent)                      │  │
│  │  │   ├── Asynchronous (background, task-notification XML)             │  │
│  │  │   ├── Fork (inherits full context for cache-identical prefixes)    │  │
│  │  │   ├── Teammate (separate tmux pane, Team feature)                  │  │
│  │  │   └── Remote (CCR environment)                                     │  │
│  │  │                                                                    │  │
│  │  ├── Isolation: separate AbortController, FileStateCache,             │  │
│  │  │   messages array, filtered tool set, ContentReplacementState       │  │
│  │  │                                                                    │  │
│  │  ├── Worktree isolation: git worktree for fully isolated repo copy    │  │
│  │  │                                                                    │  │
│  │  ├── Coordinator Mode: pure orchestrator, no direct tool access       │  │
│  │  │   Only AgentTool + TaskStopTool + SendMessageTool                  │  │
│  │  │                                                                    │  │
│  │  └── MCP inheritance: agents inherit + can add own MCP servers        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Codex CLI                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Subagent spawning (similar to Claude Code's Agent tool)              │  │
│  │  ├── Parallel task decomposition                                      │  │
│  │  ├── Ghost snapshots for background state capture                     │  │
│  │  └── Less sophisticated than Claude Code's multi-mode system          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Gemini CLI                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Full Agent Architecture:                                             │  │
│  │  ├── LocalAgentDefinition: own LLM loop, tools, model config          │  │
│  │  ├── RemoteAgentDefinition: delegates to A2A server                   │  │
│  │  │                                                                    │  │
│  │  ├── Built-in agents:                                                 │  │
│  │  │   ├── CodebaseInvestigatorAgent                                    │  │
│  │  │   ├── GeneralistAgent                                              │  │
│  │  │   └── CliHelpAgent                                                 │  │
│  │  │                                                                    │  │
│  │  ├── Each agent exposed as SubagentTool to main model                 │  │
│  │  │                                                                    │  │
│  │  └── A2A Server: HTTP server wrapping core logic                      │  │
│  │      ├── CoderAgentExecutor for task lifecycle                        │  │
│  │      ├── Persistent state across requests                             │  │
│  │      └── @a2a-js/sdk for protocol compliance                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Claude Code** has the most advanced multi-agent system: 5 agent launch modes, Coordinator Mode (pure orchestrator), git worktree isolation, Agent Teams with tmux panes, and MCP inheritance.

**Gemini CLI** is unique with the **A2A Protocol** — the only one of the three that supports inter-agent communication over the network via Google’s standard protocol.

## Part IX: User Interface

### UI Architecture Stack

```
┌────────────────────┬────────────────────┬────────────────────┐
│   Claude Code      │     Codex CLI      │    Gemini CLI      │
├────────────────────┼────────────────────┼────────────────────┤
│                    │                    │                    │
│  FULL INK FORK     │  Ratatui + cross-  │  PATCHED INK       │
│  (React terminal)  │  term (Rust TUI)   │  @jrichman/ink     │
│                    │                    │                    │
│  Custom DOM        │  App state machine │  Alternate buffer  │
│  Custom layout     │  ChatWidget        │  Mouse events      │
│  Virtual scroll    │  DiffRender        │  Kitty keyboard    │
│  Hit testing       │  PagerOverlay      │  Vim mode provider │
│  Search highlight  │  FileSearchManager │                    │
│  Selection support │  OnboardingWidget  │  Components:       │
│  Vim mode (full!)  │  Shimmer animation │  AppContainer      │
│                    │  ASCII animations  │  HistoryItemDisplay│
│  Components:       │                    │  ToolConfirmQueue  │
│  VirtualMessageList│  External editor   │  Composer          │
│  PromptInput       │  support           │  SessionBrowser    │
│  PermissionRequest │                    │  RewindViewer      │
│  ElicitationDialog │  App Server:       │  DebugProfiler     │
│  CostThreshold     │  JSON-RPC 2.0      │  ContextUsageDisp  │
│  SpinnerWithVerb   │  for IDE           │                    │
│  StatusLine        │  integration       │  Output modes:     │
│                    │  (VS Code ext)     │  Interactive/       │
│  React Compiler!   │                    │  Non-interactive/  │
│  Auto-memoization  │  Tree-sitter       │  Raw/JSON          │
│  FPS tracking      │  syntax highlight  │                    │
│                    │                    │  VS Code companion │
│  Voice integration │  Streaming MD      │  with IDE context  │
│  (ant-only)        │  rendering         │  injection         │
│                    │                    │                    │
│  Screens:          │                    │  Dialogs:          │
│  REPL (main)       │                    │  Auth, Settings,   │
│  ResumeConversation│                    │  Theme, etc.       │
│  Doctor (diag)     │                    │                    │
└────────────────────┴────────────────────┴────────────────────┘
```

**Claude Code** — a **full fork of Ink** with a custom DOM, layout engine, and virtual scroll for long conversations. All components are processed by the **React Compiler** for automatic memoization. FPS tracking with average and low-1-percentile. Vim mode includes motions, operators, text objects, and mode transitions.

**Codex CLI** — the only one built on **Ratatui** (Rust TUI). Shimmer animations, ASCII animations, external editor support. The **App Server** (JSON-RPC 2.0) for IDE integration makes Codex a headless agent server.

**Gemini CLI** — a patched fork of Ink with the Kitty keyboard protocol, alternate screen buffer, and mouse events. The **VS Code companion** injects IDE context: active file, cursor position, selection, open files — as deltas to minimize tokens.

## Part X: Comparative Architectural Analysis

### Architectural Decision Matrix

<figure><img src="https://cdn-images-1.medium.com/max/919/1*3e8xsCIGsd5-U3gRmBSBqw.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

### Who Wins and Where — An Evidence-Based Assessment

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*bT_aRrIqQHiH8BzEtWRcLg.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

## Part XI: Unique Engineering Decisions

### Claude Code: Prompt Cache Architecture

Claude Code meticulously optimizes prompt caching. The system prompt is split into **static** and **dynamic** parts via SYSTEM\_PROMPT\_DYNAMIC\_BOUNDARY. Built-in tools are sorted alphabetically and form a contiguous prefix — the server-side cache breakpoint predictably falls after the last built-in tool. MCP tools are sorted separately — adding/removing MCP tools **does not invalidate the cache** for built-in tools.

```
┌────────────────────────────────────────────────────┐
│ System prompt (STATIC — cross-org cacheable)       │ ← Cache hit
├────────────────────────────────────────────────────┤
│ SYSTEM_PROMPT_DYNAMIC_BOUNDARY                     │
├────────────────────────────────────────────────────┤
│ Built-in tools [A-Z sorted, contiguous]            │ ← Cache hit
├────────────────────────────────────────────────────┤
│ MCP tools [sorted separately]                      │ ← May miss
├────────────────────────────────────────────────────┤
│ CLAUDE.md + Memory                                 │
├────────────────────────────────────────────────────┤
│ Conversation history                               │
└────────────────────────────────────────────────────┘
```

**Tool result storage** — results larger than maxResultSizeChars are persisted to disk and replaced with a preview + file path. FileReadTool sets maxResultSizeChars = Infinity to prevent cyclical Read→file→Read loops.

**ContentReplacementState** tracks which tool results have been replaced with disk references. The state is cloned for sub-agents (cache-sharing forks need identical decisions) and persisted for session resume.

### Codex CLI: The Execution Security Stack

Codex builds a **unique security stack** that no other coding agent has:

```
Layer 0: #[ctor::ctor] — Pre-main hardening
         Disable ptrace, core dumps, strip LD_PRELOAD
```

```
Layer 1: Constrained<T> — Config cannot weaken security
         Project configs cannot override user security policies
```

```
Layer 2: Command classification
         is_safe_command.rs: allowlist (cat, ls, pwd, grep...)
         is_dangerous_command.rs: denylist (rm -rf, sudo, git reset)
         Composite command parsing (bash -lc "cmd1 && cmd2")
```

```
Layer 3: Approval workflow
         UnlessTrusted → OnRequest → OnFailure → Never
         ExecPolicyAmendment: persist user decisions
```

```
Layer 4: OS Kernel Sandbox
         macOS: Seatbelt SBPL (deny default → selective allow)
         Linux: Landlock V5 + seccomp BPF
         Windows: Restricted tokens
```

```
Layer 5: Graceful degradation
         Sandbox blocks → detect → ask user → retry without sandbox
```

```
Layer 6: shell-tool-mcp
         Patched Bash: every execve(2) → BASH_EXEC_WRAPPER
         → Escalate to MCP server for Run/Escalate/Deny
```

**Ghost Snapshots** — GhostSnapshotTask creates background git snapshots while the agent is working. Point-in-time recovery without disrupting the user's working copy.

**Shell Snapshots** — ShellSnapshot captures the user's shell environment (aliases, functions, PATH) so that the agent's commands execute in the context the user expects.

### Gemini CLI: Model Intelligence Layer

Gemini CLI stands out with **three intelligent systems** that the competitors lack:

**1\. Model Router with LLM Classifier:**

```
User request → ClassifierStrategy
                  │
                  v
              LLM call: "Is this request simple or complex?"
                  │
                  ├── Simple → Gemini Flash (cheaper, faster)
                  └── Complex → Gemini Pro (smarter, more expensive)
```

```
Fallback chain: Pro → Flash → Flash Lite
                → Suggest upgrade to paid tier
```

**2\. Loop Detection with Adaptive LLM Monitoring:**

```
Turn count < 30: Hash-based detection only
  - Tool call hash: 5 identical sequences → stuck
  - Content hash: 10 repeated chunks → stuck
```

```
Turn count >= 30: + LLM-based detection
  - Periodic LLM call: "Is this agent stuck?"
  - Adaptive interval based on confidence
  - Higher confidence → less frequent checks
```

**3\. Next Speaker Check:**

```
After each model turn:
  LLM call: "Should the model continue or yield to user?"
```

```
  Continue → model gets another turn automatically
  Yield → wait for user input
```

```
  Prevents: premature stopping on complex multi-step tasks
  Prevents: infinite running on simple tasks
```

**Edit Correction System** — when the edit tool cannot find an exact match:

```
old_string not found in file
    │
    v
LLM call: "Given this file content and this intended edit,
           find the correct location for the change"
    │
    v
Corrected edit applied
    │
    v
EditCorrectionEvent telemetry recorded
```

## Part XII: Conclusions and the Future

### Key Insights from the Forensic Analysis

**1\. Three philosophies, one goal.** Anthropic optimizes for model power (model as orchestrator). OpenAI optimizes for security (kernel-level enforcement). Google optimizes for cost efficiency (intelligent routing). All three build agents that solve the same tasks — but their architectures are fundamentally different.

**2\. Security is the key differentiator.** Codex CLI is the only one with kernel-level sandboxing on all three OSes. Claude Code compensates for its application-level approach with a 5-tier permission system featuring a speculative classifier. Gemini CLI relies on container isolation. According to research, 73% of production AI deployments have prompt injection vulnerabilities — only kernel-level defense provides guarantees.

**3\. Context management determines the ceiling.** Claude Code with its 5 compaction strategies can sustain the longest sessions. Gemini CLI with its 2M context window has the highest absolute ceiling. Codex CLI with remote compaction delegates this task to the server. The quality of context management directly determines the complexity of solvable tasks.

**4\. MCP has become the standard.** All three agents support MCP. Claude Code leads (6 transports, OAuth, elicitation). Codex uniquely operates **as** an MCP server. Gemini adds A2A for inter-agent communication. The ecosystem is converging on JSON-RPC 2.0 as the wire format.

**5\. Multi-agent is the next frontier.** Claude Code with Agent Teams, Coordinator Mode, and 5 sub-agent modes is the most mature. Gemini CLI with the A2A protocol is the only one standardizing inter-agent communication over the network. Codex CLI is minimal in this area.

### Where All Three Are Headed

DirectionClaude CodeCodex CLIGemini CLI<strong>More autonomous agents</strong>Agent Teams, Coordinator ModeGhost Snapshots, background workA2A server, remote agents<strong>Better DX</strong>Skills system, hooksApp Server (IDE-agnostic)VS Code companion, extensions<strong>Cost savings</strong>Prompt cache optimizationRust performanceModel routing Pro/Flash<strong>Safety</strong>Speculative classifierKernel sandbox deepeningPolicy engine expansion<strong>Extensibility</strong>MCP + Skills + HooksMCP server mode + SDKExtensions + Skills + Hooks + A2A

### What Each Agent Gets Wrong

An honest analysis demands pointing out weaknesses — they are what define a system’s maturity:

**Claude Code:**

-   No pre-main hardening — no ptrace protection, no core dump disabling. Codex proved this is both possible and necessary
-   Application-level sandbox without kernel enforcement — if the permission logic is compromised, there is no fallback
-   Config lacks a Constrained\<T> mechanism — project settings can theoretically weaken security

**Codex CLI:**

-   Minimal MCP support (stdio only) — in a world where MCP has become the standard, this is a limitation
-   10 built-in tools vs 30+ for Claude Code — fewer out-of-the-box capabilities
-   No loop detection — the agent can get stuck in a loop without detection

**Gemini CLI:**

-   Sequential tool execution — no parallel dispatch like Claude Code and Codex
-   The Config class — a god-object with 400+ lines of parameters, an architectural smell
-   Two competing tool schedulers (CoreToolScheduler and Scheduler) — an incomplete migration

## Final Word: The Architectural Blueprint for the Ideal Agent

If we were designing a coding agent from scratch, drawing on everything we learned from these three codebases, it would look like this:

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE IDEAL CODING AGENT                       │
│                                                                 │
│  Pre-main:    #[ctor::ctor] hardening (from Codex)             │
│  Language:    Rust core + TypeScript UI (hybrid like Codex)     │
│  Sandbox:     Kernel-level per-OS (from Codex)                 │
│  Config:      Constrained<T> + managed settings (from Codex)   │
│                                                                 │
│  Agent Loop:  AsyncGenerator streaming (from Claude Code)      │
│  Tools:       30+ built-in + StreamingToolExecutor              │
│               (from Claude Code)                                │
│  Concurrency: Partitioned parallel/serial (from Claude Code)   │
│                                                                 │
│  Compaction:  5 orthogonal strategies (from Claude Code)       │
│  Cache:       Prompt cache-aware tool ordering                 │
│               (from Claude Code)                                │
│                                                                 │
│  Routing:     LLM classifier Pro/Flash (from Gemini)           │
│  Loop Detect: 3-method system (from Gemini)                    │
│  Edit:        Search-replace + LLM correction (from Gemini)    │
│                                                                 │
│  MCP:         6 transports + OAuth + elicitation               │
│               (from Claude Code)                                │
│  Multi-agent: Agent Teams + A2A protocol                       │
│               (from Claude Code + Gemini)                       │
│  Extensions:  Skills + Hooks + Agents (from Gemini)            │
│                                                                 │
│  Eval:        Public evals/ + SWE-bench (from Gemini)          │
│  Telemetry:   Perfetto traces (Claude) + OTel (Gemini)         │
│  Undo:        Ghost Commits (from Codex)                        │
└─────────────────────────────────────────────────────────────────┘
```

This agent does not exist yet. But every one of its components has already been implemented — just in different products. The question is not *whether* it can be built, but *who* will build it first.

> <strong><em>A challenge to the industry:</em></strong> <em>88% of AI agents never reach production (Hypersense, 2026). Compound reliability — 85% per-step x 10 steps = 20% end-to-end success. The architectural decisions we dissected in this article are not an academic exercise. They are the difference between an agent that works in a demo and an agent that works in production.</em>

## Part XIII: Hidden Capabilities — What the Docs Don’t Tell You

A deep traversal of all three codebases revealed entire subsystems that are not mentioned in public documentation but exist in the code, revealing each company’s ambitions.

## XIII.0: Feature Management — The Scale of What’s Hidden

> <strong><em>KEY INSIGHT:</em></strong> <em>Claude Code contains</em> <strong><em>89 compile-time feature flags</em></strong> <em>via</em> <em>bun:bundle feature() and dozens of runtime flags via GrowthBook with the</em> <em>tengu\_ prefix. This is feature management at the scale of a major SaaS platform, not a CLI tool.</em>

Key compile-time gates (from tools.ts, cli.tsx, query.ts):

FlagPurposeKAIROS / PROACTIVEAlways-on proactive assistantBUDDYCompanion system with gacha mechanicsULTRAPLANRemote CCR sessions with 30-min thinking budgetCOORDINATOR\_MODEMulti-agent orchestrationWEB\_BROWSER\_TOOLBrowser tool (codename "bagel")MONITOR\_TOOLMonitoring toolTRANSCRIPT\_CLASSIFIERAuto mode with ML classifierCONTEXT\_COLLAPSEProgressive context compressionANTI\_DISTILLATION\_CCAnti-distillation protectionABLATION\_BASELINEA/B testing (disables everything at once)

GrowthBook runtime flags (services/analytics/growthbook.ts) use caching (getFeatureValue\_CACHED\_MAY\_BE\_STALE()) for zero-latency checks. Examples: tengu\_onyx\_plover (autoDream), tengu\_auto\_mode\_config, tengu\_remote\_backend.

**Codex CLI** uses simple feature flags via features.rs (12 flags: unified\_exec, shell\_snapshot, apply\_patch\_freeform, exec\_policy, skills, tui2, etc.). **Gemini CLI** manages features via settings.json and server-side admin controls.

## XIII.0.1: Memory Consolidation — autoDream

Claude Code contains an **automatic memory consolidation** system (services/autoDream/), inspired by sleep processes in neuroscience:

**Three gates (cheapest first)** (autoDream.ts:5-8):

1.  **Temporal gate:** >=24 hours since last consolidation
2.  **Sessions gate:** >=5 new sessions with transcripts
3.  **Lock gate:** no parallel consolidation running

**Four phases** (consolidationPrompt.ts):

1.  **Orient** — ls memory dir, read MEMORY.md, skim topics
2.  **Gather signal** — daily logs, drifted memories, transcript search
3.  **Consolidate** — merge, convert dates, delete contradictions
4.  **Prune** — keep MEMORY.md under 200 lines / ~25KB

Runs as a forked subagent with read-only Bash. Controlled by the GrowthBook flag tengu\_onyx\_plover.

> <em>Neither Codex CLI nor Gemini CLI has anything like this. Gemini has a</em> <em>save\_memory tool (manual), Codex has no memory management at all.</em>

## XIII.0.2: Proactive Mode (KAIROS)

Claude Code contains an always-on **proactive assistant** — an agent that works *between* user requests:

-   **Tick mechanism:** receives \<tick> prompts for proactive decisions
-   **Daily logs:** append-only files logs/YYYY/MM/YYYY-MM-DD.md — a nightly process distills them into memory
-   **Exclusive tools:** SendUserFileTool, PushNotificationTool, SubscribePRTool
-   **Brief Mode:** BriefTool for minimal terminal output
-   **15-second blocking budget** — proactive decisions must not block the UX

## XIII.0.3: Remote Planning (ULTRAPLAN)

For particularly complex tasks, Claude Code can delegate planning to a **Cloud Container Runtime**:

-   Creates a remote CCR session on Opus 4.6 (utils/ultraplan/ccrSession.ts)
-   **30 minutes** for thinking (vs the usual seconds)
-   Polling every 3 seconds
-   Browser approval UI support
-   Sentinel \_\_ULTRAPLAN\_TELEPORT\_LOCAL\_\_ for returning to the terminal
-   ULTRAREVIEW variant for code review

## XIII.0.4: Codex Cloud — Remote Task Execution

Codex CLI has a **full cloud execution system** (experimental), absent from the competitors:

```
codex cloud exec --env ENV_ID "implement authentication"
codex cloud status TASK_ID
codex cloud diff TASK_ID
codex cloud apply TASK_ID      ← apply diff locally
```

-   **Best-of-N attempts** (1–4) — runs multiple parallel attempts, picks the best
-   Dedicated cloud-tasks-client crate with API client
-   Supports specifying a git branch via --branch
-   Separate TUI for browsing cloud tasks

> *Neither Claude Code nor Gemini CLI can delegate tasks to the cloud and apply the result locally. This is a unique Codex capability.*

## XIII.0.5: Structured Code Review (Codex)

codex review — a full-fledged code review subcommand:

-   4 targets: --uncommitted, --base BRANCH, --commit SHA, freeform prompt
-   Structured JSON output: confidence\_score, priority, code\_location (file + line range)
-   Detached reviews on a separate thread
-   Inline vs Detached delivery modes

## XIII.0.6: Models and Codenames

**Codex CLI** supports an extended model catalog (models.json):

-   gpt-5.1-codex-max — flagship with 4 reasoning levels (low/medium/high/**xhigh**)
-   gpt-5.2 — latest with 272K context
-   Internal codenames: **bengalfox**, **boomslang**
-   Per-model system prompts (base\_instructions)
-   minimal\_client\_version requirements per model
-   Upgrade path: all models point to "upgrade": "gpt-5.2-codex"

## XIII.0.7: Gemini — Theme Engine and Tier System

**14+ built-in themes** (ThemeManager): Ayu Dark/Light, Atom One Dark, Dracula, GitHub Dark/Light, GoogleCode, Holiday, Shades of Purple, XCode, ANSI, ANSI Light, NoColor + custom themes from JSON.

-   Live preview in the theme dialog
-   Per-user and per-project scope
-   Auto-detection of terminal background
-   NO\_COLOR env var support

> *Claude Code and Codex CLI have no theme system whatsoever.*

**Tier System** with quota management:

-   3 tiers: FREE, LEGACY, STANDARD
-   Quota buckets with per-model limits and reset time
-   **Automatic Flash fallback** when Pro quota is exhausted
-   9 ineligibility reasons (DASHER\_USER, RESTRICTED\_AGE, UNSUPPORTED\_LOCATION…)
-   Remote **admin controls**: secureModeEnabled, mcpEnabled, extensionsEnabled — enterprise admins can remotely disable MCP and extensions

## XIII.0.8: Security Details — Protected Files and Safeguards

**Claude Code** has an explicit list of protected files (utils/permissions/filesystem.ts:57-79):

```
DANGEROUS_FILES: .gitconfig, .gitmodules, .bashrc, .bash_profile,
                 .zshrc, .zprofile, .profile, .ripgreprc,
                 .mcp.json, .claude.json
```

```
DANGEROUS_DIRECTORIES: .git, .vscode, .idea, .claude
```

The file constants/cyberRiskInstruction.ts is owned by the **Safeguards team** (David Forsythe, Kyla Guru) — changes require review by the security team. It contains instructions on authorized security testing, refusing destructive techniques, and dual-use tool authorization.

**22+ API beta headers** (constants/betas.ts) control server-side behavior: interleaved-thinking, context-1m, fast-mode, redact-thinking, afk-mode, token-efficient-tools, prompt-caching-scope, and others.

DANGEROUS\_uncachedSystemPromptSection() (constants/systemPromptSections.ts:32) — creates volatile prompt sections that **break the prompt cache** on every change. Requires a \_reason parameter to document the necessity.

## Part XIV: What Didn’t Make the Cut — Error Recovery, Diff Algorithms, Telemetry

The initial analysis focused on architecture and core subsystems. However, a deeper dive into the code reveals entire layers of engineering decisions that are no less important for understanding the maturity of these systems.

## XIII.1: Error Handling Strategies and API Fault Tolerance

The three agents implement fundamentally different API error handling models — from simple retry to complex state machines with correct state recovery.

### Claude Code: Multi-Layered Retry Machine with Context-Aware Strategy

<strong>File:</strong> <strong>claude-code/services/api/withRetry.ts</strong>

Claude Code contains the most sophisticated retry logic of all three agents. The key architectural decision is **context-aware retry strategies** determined by the request source (QuerySource):

```
FOREGROUND_529_RETRY_SOURCES:
  repl_main_thread, sdk, agent:*, compact, hook_agent,
  verification_agent, side_question, auto_mode, bash_classifier
```

```
All other requests (summaries, titles, suggestions, classifiers):
  → Immediate failure without retry on 529
```

This decision is based on an understanding of cascading failures: under API overload, every retry is a 3–10x amplification at the gateway. Background requests (summaries, titles) are silently dropped, while foreground requests (what the user is waiting for) are retried. Constants: DEFAULT\_MAX\_RETRIES = 10, MAX\_529\_RETRIES = 3, BASE\_DELAY\_MS = 500.

**Persistent retry for unattended sessions (ant-only):** If CLAUDE\_CODE\_UNATTENDED\_RETRY is enabled, 429/529 errors are retried indefinitely with backoff up to PERSISTENT\_MAX\_BACKOFF\_MS = 5 \* 60 \* 1000 (5 minutes) and heartbeat signals every 30 seconds to prevent the host from marking the session as idle. This is a specific solution for CI/CD pipelines where interruption costs more than waiting.

**Fast mode fallback:** On 429/529 errors in fast mode, Claude Code analyzes the retry-after header — if the delay is short (\< SHORT\_RETRY\_THRESHOLD\_MS), it retries with the same model name to preserve the prompt cache; if long — it switches to standard speed with a cooldown period. The anthropic-ratelimit-unified-overage-disabled-reason header is handled separately — when overage quota is unavailable, fast mode is permanently disabled.

<strong>withhold and recover pattern (file:</strong> <strong>claude-code/query.ts):</strong> On a max\_output\_tokens error, the streaming message is **withheld** — not passed to SDK subscribers — and the system attempts to continue. MAX\_OUTPUT\_TOKENS\_RECOVERY\_LIMIT = 3 — a maximum of three auto-continuations. Analogous withholding occurs for prompt\_too\_long — instead of throwing an error, reactive compaction is triggered and the request is retried with a reduced context. This is critical for SDK integrations (VS Code, desktop apps), where any error event terminates the session.

**Stale connection recovery:** On ECONNRESET/EPIPE (stale keep-alive socket) — automatic disabling of connection pooling via disableKeepAlive() and reconnection. OAuth token revocation (403 "token revoked") is handled separately — forced refresh and retry.

### Codex CLI: Typed Retry Policy in Rust

<strong>File:</strong> <strong>codex/codex-rs/codex-client/src/retry.rs</strong>

Codex implements retry through a clean RetryPolicy + RetryOn abstraction:

```
pub struct RetryPolicy {
    pub max_attempts: u64,
    pub base_delay: Duration,
    pub retry_on: RetryOn,  // retry_429, retry_5xx, retry_transport
}
```

```
pub fn backoff(base: Duration, attempt: u64) -> Duration {
    // Exponential backoff: base * 2^(attempt-1) * jitter(0.9..1.1)
}
```

Less sophisticated than Claude Code, but elegant: a generic run\_with\_retry\<T, F, Fut> accepts any async operation and retry policy. The jitter range of 0.9–1.1 (10% variation) is softer than standard full-jitter strategies. TransportError::Timeout and TransportError::Network are handled separately — retry only when the retry\_transport flag is set.

### Gemini CLI: Google Error Classifier with Cascading Fallback

<strong>Files:</strong> <strong>gemini-cli/packages/core/src/utils/retry.ts,</strong> <strong>gemini-cli/packages/core/src/availability/</strong>

Gemini CLI stands out with **hierarchical error classification** via classifyGoogleError():

```
Google API Error
  ├── TerminalQuotaError      → onPersistent429 → fallback to Flash model
  ├── RetryableQuotaError     → exponential backoff with retryDelayMs from API
  ├── ValidationRequiredError → prompt user "verify" / "change_auth" / "cancel"
  ├── ModelNotFoundError      → onPersistent429 fallback
  └── Generic 5xx             → standard backoff (maxDelay=30s, jitter ±30%)
```

A unique subsystem — **ModelAvailabilityService** (file: gemini-cli/packages/core/src/availability/modelAvailabilityService.ts). This is a full-fledged health-tracking service with three model states: healthy, sticky\_retry (one retry attempt per turn), terminal (model completely unavailable). On a successful response — markHealthy() resets the state. A separate ModelPolicyChain defines the fallback model cascade with rules: which errors require 'prompt' (ask the user) and which require 'silent' (silent fallback).

Also unique — <strong>handling</strong> <strong>ValidationRequiredError</strong>: on a 403 VALIDATION\_REQUIRED, the Google API may require user verification. Gemini CLI displays a dialog with a verification link; on success — attempt = 0 (full retry counter reset).

**Retry strategy comparison table:**

```
┌─────────────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                         │   Claude Code    │    Codex CLI     │   Gemini CLI     │
├─────────────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Max retries             │ 10 (configurable)│ Policy-defined   │ 10 (default)     │
│ Base delay              │ 500ms            │ Policy-defined   │ 5000ms           │
│ Backoff                 │ Exp + Retry-After│ Exp + jitter 10% │ Exp + jitter 30% │
│ Max delay cap           │ 5m (persistent)  │ None explicit    │ 30s              │
│ Context-aware retry     │ Yes (QuerySource)│ No               │ No               │
│ Error classification    │ HTTP status      │ TransportError   │ classifyGoogle   │
│ Model fallback          │ Fast→Standard    │ No               │ Pro→Flash chain  │
│ Health tracking         │ No               │ No               │ AvailabilitySvc  │
│ Auth error recovery     │ OAuth + Bedrock  │ No               │ Validation flow  │
│ Persistent mode         │ Yes (unattended) │ No               │ No               │
│ Stale conn recovery     │ Yes (keepalive)  │ No               │ Retry on codes   │
│ Stream error withhold   │ Yes (withhold)   │ No               │ StreamEvent.RETRY│
└─────────────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

## XIII.2: Cost and Token Budgeting

API cost management is a critical but often invisible part of the architecture. The three agents use fundamentally different strategies: from natural-language budget parsing to full-fledged health-tracking systems.

### Claude Code: Natural-Language Token Budget + Server-Side Iterations Tracking

<strong>File:</strong> <strong>claude-code/utils/tokenBudget.ts</strong>

Claude Code implements a unique budget parser from the user’s natural language:

```
"+500k"          → 500,000 tokens
"use 2M tokens"  → 2,000,000 tokens
"spend 1.5m tokens." → 1,500,000 tokens
```

Three regex patterns (SHORTHAND\_START\_RE, SHORTHAND\_END\_RE, VERBOSE\_RE) allow the user to set a budget right in their message. The function getBudgetContinuationMessage() generates a message like "Stopped at 73% of token target (365,000 / 500,000). Keep working — do not summarize." — this is an instruction for the model to keep working until the budget is exhausted.

<strong>File:</strong> <strong>claude-code/utils/tokens.ts —</strong> <strong>tokenCountWithEstimation():</strong>

The canonical context counting method deserves special attention. The problem: during parallel tool calls, the streaming code creates a **separate** AssistantMessage record for each content block (all sharing one message.id), while the query loop inserts tool\_result after each tool\_use. The result: \[..., assistant(id=A), user(result), assistant(id=A), user(result), ...\]. A naive search for the last assistant record would miss the interleaved tool\_results. The solution: after finding the usage record, walk back to the **first** sibling with the same message.id — all interleaved results are captured in the estimation slice.

**finalContextTokensFromLastResponse()** — a separate function for computing task\_budget.remaining. Works with usage.iterations\[\] (server-side tool loops) — when the API internally performs multiple iterations, the last iteration determines the final context window size. Formula: input\_tokens + output\_tokens (excluding cache tokens), which matches the server-side formula calculate\_context\_tokens in renderer.py:292.

### Gemini CLI: Semantic Truncation for Telemetry

<strong>File:</strong> <strong>gemini-cli/packages/core/src/telemetry/semantic.ts</strong>

Gemini CLI implements **semantic truncation** for log entries with a budget of GLOBAL\_TEXT\_LIMIT = 160KB (out of a 256KB log entry limit). The algorithm: collect all StringReference instances from message parts (TextPart, ReasoningPart, ToolCallRequestPart, etc.), compute the average share (averageSize = limit / refs.length), truncate only "large" parts (> average), leaving small ones untouched. This guarantees that metric events do not exceed the Google Cloud Logging limit while preserving maximum information.

### Codex CLI: Minimal Approach

Codex CLI does not implement client-side token budgeting — it relies on server-side model limits and remote compaction when limits are reached.

## XIII.3: Diff and Patch Algorithms — Deeper Than Expected

All three agents need to edit files, but each solves this problem in a fundamentally different way. The most interesting part is the fuzzy-matching strategies for inexact matches.

### Codex CLI: Four-Stage Fuzzy Search with Unicode Normalization

<strong>File:</strong> <strong>codex/codex-rs/apply-patch/src/seek\_sequence.rs</strong>

The algorithm for finding a position in a file for apply\_patch has four levels of increasing leniency:

1.  **Exact match** — byte-for-byte equality
2.  **Rstrip match** — ignoring trailing whitespace (tabs, spaces)
3.  **Full trim match** — ignoring leading + trailing whitespace
4.  **Unicode normalization** — normalizing typographic characters to ASCII equivalents

The fourth level is particularly noteworthy: it normalizes em-dash \\u{2014} → -, typographic quotes \\u{201C}/\\u{201D} → ", non-breaking spaces \\u{00A0} → , and 20+ other Unicode characters. This solves a real problem: when the model generates a patch with ASCII characters for a file containing typographic dashes/quotes (common from PDF copy-paste or rich text). No other coding agent performs this normalization.

<strong>File:</strong> <strong>codex/codex-rs/apply-patch/src/parser.rs — Lenient mode:</strong>

The Codex patch parser has two modes. ParseMode::Lenient handles the situation where GPT-4.1 wraps a patch in a heredoc: \<\<'EOF'\\n\*\*\* Begin Patch\\n...\\n\*\*\* End Patch\\nEOF\\n — because the local\_shell tool passes arguments through execvpe(3), not through a shell, and the heredoc is interpreted literally. The parser automatically strips the heredoc wrapper with three quoting variants (\<\<EOF, \<\<'EOF', \<\<"EOF").

### Gemini CLI: LLM-Powered Edit Correction with Caching and Race Condition Protection

<strong>File:</strong> <strong>gemini-cli/packages/core/src/utils/editCorrector.ts</strong>

The most complex edit correction system of all three agents. The full pipeline when old\_string fails:

```
old_string not found → unescapeStringForGeminiBug() → found? → use it
                     └─ still not found
                        └─ Was file edited externally since last tool call?
                           (check mtime vs findLastEditTimestamp)
                           └─ Yes (>2s diff) → refuse to correct (avoid clobbering)
                           └─ No → correctOldStringMismatch() via LLM
                              └─ LLM returns corrected_target_snippet
                                 └─ Validate: countOccurrences == expectedReplacements
                                    └─ If new_string potentially escaped too:
                                       └─ correctNewString() via another LLM call
```

Three separate LLM calls may be required for a single edit: correcting old\_string, correcting new\_string, and correcting escaping. Each with its own JSON response schema. All results are cached in an LRUCache (capacity=50) so that repeated attempts at the same edit do not trigger additional LLM requests.

The function unescapeStringForGeminiBug() is a fix for a known Gemini issue that over-escapes strings (\\\\n instead of \\n, \\\\\\" instead of "). The regex handles \\n, \\t, \\r, \\', \\", \\\`, \\\\, and literal newlines.

<strong>File:</strong> <strong>gemini-cli/packages/core/src/utils/llm-edit-fixer.ts — second level:</strong>

A separate system with a more powerful prompt that includes the instruction context and full file contents. Capable of detecting that the change has already been applied (noChangesRequired: true). Timeout: 40 seconds.

### Claude Code: Search-Replace Without Fuzzy Matching

Claude Code uses strictly exact matching for old\_string in FileEditTool. No fuzzy matching, no LLM correction. The philosophy: the model should generate exact strings itself, and if it cannot — use FileReadTool to read the current contents.

## XIII.4: Undo/Rollback — Three Approaches to Time Travel

### Codex CLI: Ghost Commits — Invisible Git Snapshots

<strong>Files:</strong> <strong>codex/codex-rs/core/src/tasks/ghost\_snapshot.rs,</strong> <strong>codex/codex-rs/utils/git/src/ghost\_commits.rs,</strong> <strong>codex/codex-rs/core/src/tasks/undo.rs</strong>

Codex implements a full point-in-time recovery system via **Ghost Commits** — git commits created in the background, invisible to the user’s working copy.

The mechanism: GhostSnapshotTask is created as a SessionTask and executed via tokio::task::spawn\_blocking (git operations are blocking). Options: excluding directories with >200 files (DEFAULT\_IGNORE\_LARGE\_UNTRACKED\_DIRS = 200), excluding files >10MB (DEFAULT\_IGNORE\_LARGE\_UNTRACKED\_FILES = 10 \* 1024 \* 1024), a hardcoded list of ignored directories (node\_modules, .venv, dist, build, \_\_pycache\_\_, etc.). If the delay exceeds 240 seconds — a warning to the user about potential issues with untracked files.

UndoTask finds the last ResponseItem::GhostSnapshot in history, calls restore\_ghost\_commit\_with\_options(), and on success — removes the snapshot from history. All with proper cancellation via CancellationToken.

**Gate pattern:** GhostSnapshotTask uses tool\_call\_gate.mark\_ready(token) — a Readiness system ensuring that tool calls do not start until the snapshot is complete. This prevents data loss: edits begin only after the backup snapshot has been written.

### Claude Code: File History with Content-Addressable Backup

<strong>File:</strong> <strong>claude-code/utils/fileHistory.ts</strong>

Claude Code implements its own file checkpointing system, independent of git. fileHistoryTrackEdit() is called **before** every file edit, creating a backup of the current contents. Backups are stored with content-addressable names (hash-based), versioned ({hash}@v1). MAX\_SNAPSHOTS = 100 — rotation of old snapshots. Each snapshot is tied to a messageId (UUID), allowing navigation through history at the level of individual messages.

Race condition protection: before creating a backup, the system checks whether the file has already been tracked in the current snapshot (atomic check-then-act via updateFileHistoryState). A second trackEdit after the first will not overwrite the v1 backup with post-edit contents. On session resume — copyFileHistoryForResume() restores the full file history.

### Gemini CLI: Rewind via Conversation Replay

<strong>Files:</strong> <strong>gemini-cli/packages/cli/src/ui/hooks/useGeminiStream.ts,</strong> <strong>gemini-cli/packages/core/src/services/chatRecordingService.ts</strong>

Gemini CLI does not create file snapshots. Instead — ChatRecordingService records the full conversation history (messages, tool calls, tool results, token usage, thoughts) in JSON files session-{uuid}.json. RewindViewer (a UI component) allows the user to rewind the conversation to any point and replay from there. The approach is less precise for file changes but covers the entire conversation state.

## XIII.5: Telemetry and Observability

### Claude Code: Perfetto Tracing — Chrome DevTools for AI Agents

<strong>File:</strong> <strong>claude-code/utils/telemetry/perfettoTracing.ts (ant-only)</strong>

The most impressive observability system: generation of trace files in the **Chrome Trace Event format**, visualized at ui.perfetto.dev. The trace includes:

-   Agent hierarchy (parent-child relationships in swarm)
-   API requests with TTFT (Time To First Token), TTLT (Time To Last Token), prompt length, cache stats
-   Tool executions with name, duration, and token usage
-   User input waiting time

Agents in multi-agent sessions are displayed as separate **processes** in Perfetto (each sub-agent gets a unique processId). MAX\_EVENTS = 100,000, with amortized O(1) eviction (drop oldest half). Stale spans are cleaned every 60 seconds (TTL: 30 minutes). Enabled via CLAUDE\_CODE\_PERFETTO\_TRACE=1.

<strong>File:</strong> <strong>claude-code/utils/startupProfiler.ts — Startup profiling:</strong>

A dual-mode system: (1) sampled logging — 100% for Anthropic employees, 0.5% for external users — load phases are logged to Statsig; (2) detailed profiling (CLAUDE\_CODE\_PROFILE\_STARTUP=1) — a full report with memory snapshots at each checkpoint. Tracked phases: import\_time, init\_time, settings\_time, total\_time.

### Gemini CLI: OpenTelemetry-Native with GCP Integration

<strong>Files:</strong> <strong>gemini-cli/packages/core/src/telemetry/ (26 files)</strong>

Gemini CLI is the only one of the three with full OpenTelemetry integration. StartupProfiler tracks CPU usage (user + system) in addition to wall-clock time, with breakdowns by OS and Docker environment. A RateLimiter class prevents excessive telemetry records (min interval 60s, half for high-priority events). Clearcut logger — a Google-specific event system. GCP exporters send metrics to Google Cloud.

### Codex CLI: OpenTelemetry via Rust

<strong>File:</strong> <strong>codex/codex-rs/otel/src/otel\_manager.rs</strong>

Codex uses the standard OpenTelemetry SDK for Rust with function-level tracing instrumentation (#\[instrument\]). Spans cover tool dispatch, API calls, and sandbox execution. Less specialized than Claude Code's Perfetto traces, but natively integrated into the Rust async ecosystem.

## XIII.6: Session Management and Persistence

### Claude Code: UUID-Linked JSONL Chain with Sidechain Support

<strong>File:</strong> <strong>claude-code/utils/conversationRecovery.ts</strong>

The most complex persistence system. Every message has a UUID and parentUuid — forming a **directed graph** of messages. buildConversationChain() reconstructs a linear chain from this graph. Sidechains (branches) are marked isSidechain and excluded on resume. Transcript files are JSONL with leaf-finding via set difference.

**Turn interruption detection:** detectTurnInterruption() analyzes whether the session was interrupted: assistant at the end = completed turn; user+tool\_result = interrupted mid-turn; plain user = interrupted prompt. For interrupted turns, "Continue from where you left off." is automatically appended. For interrupted prompts — the user's original message is preserved for re-submission.

**Cross-session state:** On resume, the following are restored: fileHistorySnapshots, attributionSnapshots, contentReplacements, contextCollapseCommits, agent metadata (name, color, setting), worktree session, PR number/URL. Skills are restored from invoked\_skills attachments — without this, subsequent compaction would lose skill information.

### Gemini CLI: ChatRecordingService with Disk-Full Protection

<strong>File:</strong> <strong>gemini-cli/packages/core/src/services/chatRecordingService.ts</strong>

JSON-based recording with SessionSummaryService for generating brief session descriptions. Uniquely — handles ENOSPC (disk full): recording is silently disabled with a 'Chat recording disabled: No space left on device' warning, but the conversation continues. Prompt IDs are tracked via AsyncLocalStorage\<string> (promptIdContext) — each LLM call gets a unique identifier for log correlation.

### Codex CLI: JSONL Rollout Recording

Codex uses the JSONL format for recording conversation items (ResponseItem enum). Ghost snapshots are recorded as separate items. A simpler approach, but with full undo support via ghost commits.

## XIII.7: Hidden Feature Flags and Experimental Systems

### Claude Code: Extensive Feature Gating via bun:bundle

<strong>File:</strong> <strong>claude-code/utils/systemPrompt.ts and many others</strong>

Claude Code uses feature() from bun:bundle as compile-time feature flags. Dead code elimination removes entire modules from external builds. Discovered flags:

-   PROACTIVE / KAIROS — proactive mode (autonomous agent)
-   KAIROS\_BRIEF — brief mode (shortened responses via SendUserMessage)
-   COORDINATOR\_MODE — pure orchestrator mode (only agent tools)
-   BASH\_CLASSIFIER — speculative bash classifier (ant-only)
-   UNATTENDED\_RETRY — persistent retry for CI/CD
-   BG\_SESSIONS — background sessions via UDS
-   ABLATION\_BASELINE — disabling many features for A/B testing

ABLATION\_BASELINE is particularly interesting: it is set in the first lines of cli.tsx and globally disables advanced features. This allows Anthropic to measure the incremental value of each feature through A/B testing.

### Gemini CLI: Section-Level Prompt Toggle + Preview Features

<strong>File:</strong> <strong>gemini-cli/packages/core/src/prompts/snippets.ts</strong>

The system prompt is assembled from sections with isSectionEnabled('sectionName') — allowing prompt sections to be toggled on/off via configuration. Preview models (isPreviewModel) receive additional instructions (isGemini3 flag). Skills, hooks, agent contexts — all optionally added.

### Codex CLI: Feature System via Starlark

<strong>Files:</strong> <strong>codex/codex-rs/core/src/features.rs,</strong> <strong>codex/codex-rs/execpolicy/src/parser.rs</strong>

Codex uniquely uses **Starlark** (a configuration language from Bazel) for defining execution policies. PolicyParser parses .rules files through a full Starlark interpreter:

```
prefix_rule(
    pattern=["git", ["add", "commit", "diff", "log", "status"]],
    decision="allow",
    match=["git add .", "git commit -m 'test'"],
    not_match=["git push --force"],
)
```

Patterns support alternatives (list within pattern), shell-lexed examples for rule validation, and three decisions: Allow, Deny, AskUser. This allows organizations to define fine-grained command execution policies in a declarative, version-controllable format.

## XIII.8: Concurrency and Parallel Tool Execution

### Codex CLI: RwLock-Based Parallelism

<strong>File:</strong> <strong>codex/codex-rs/core/src/tools/parallel.rs</strong>

Codex implements an elegant parallel tool call mechanism via RwLock\<()>:

```
let _guard = if supports_parallel {
    Either::Left(lock.read().await)   // Parallel: read lock
} else {
    Either::Right(lock.write().await) // Serial: write lock
};
```

Parallel-safe tools (read-only: grep, read file, list dir) acquire a read() lock — unlimited parallelism. Serial tools (shell, apply\_patch) acquire a write() lock — exclusive access, blocking all parallel operations. CancellationToken ensures correct interruption with an "aborted" entry written to the tracing span.

### Claude Code: Partitioned Execution

Claude Code uses partitionToolCalls() to split tools into concurrent-safe and non-concurrent, with MAX\_TOOL\_USE\_CONCURRENCY = 10. Less granular than RwLock, but with streaming dispatch support (tool calls begin executing before the model finishes streaming).

### Gemini CLI: Sequential Execution

Gemini CLI executes tool calls **sequentially** within a single turn via CoreToolScheduler. A queue-based state machine (SchedulerStateManager) with states: Waiting → Scheduled → Validating → Executing → Completed(Success|Error|Cancelled). A simpler approach, but potentially slower when multiple independent calls are involved.

## XIII.9: Summary Table of Additional Findings

```
┌────────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│   Feature              │    Claude Code        │     Codex CLI        │    Gemini CLI        │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Retry strategy         │ Context-aware,        │ Generic RetryPolicy  │ classifyGoogleError  │
│                        │ 529 selective,        │ with jitter          │ + ModelAvailability  │
│                        │ persistent mode       │                      │ Service              │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Token budget           │ NL parsing "+500k",   │ Server-side          │ GLOBAL_TEXT_LIMIT    │
│                        │ iterations tracking   │                      │ semantic truncation  │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Edit fuzzy-matching    │ None (strict exact)   │ 4-level +            │ LLM correction +     │
│                        │                      │ Unicode normalize    │ LRU cache + unescape │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Undo/Rollback          │ File history          │ Ghost git commits    │ Conversation rewind  │
│                        │ (content-addressable) │ + UndoTask           │ (ChatRecording)      │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Observability          │ Perfetto traces       │ OpenTelemetry Rust   │ OpenTelemetry +      │
│                        │ (Chrome DevTools)     │ standard             │ GCP + Clearcut       │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Session persistence    │ UUID JSONL chain +    │ JSONL rollout +      │ JSON recording +     │
│                        │ sidechain + interrupt │ ghost snapshots      │ ENOSPC protection    │
│                        │ detection             │                      │                      │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Feature flags          │ bun:bundle feature()  │ Starlark policies    │ Section toggles +    │
│                        │ + ABLATION_BASELINE   │ + Feature enum       │ preview gates        │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Tool parallelism       │ Partitioned (max 10)  │ RwLock read/write    │ Sequential queue     │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Startup profiling      │ Sampled 0.5% +        │ Standard perf hooks  │ CPU+wall clock per   │
│                        │ CLAUDE_CODE_PROFILE   │                      │ phase + GCP flush    │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Error stream handling  │ Withhold + recover    │ Standard error prop  │ StreamEvent.RETRY    │
│                        │ (SDK-safe)            │                      │ signal to UI         │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Eval framework         │ Internal (not public) │ Internal             │ Public evals/ +      │
│                        │                      │                      │ TestRig + EvalPolicy │
└────────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

When I began this forensic analysis, I expected to find three variations of a simple concept: an LLM API call wrapped in a while loop.

Instead, we uncovered three massive, highly opinionated engineering systems where the core LLM interaction makes up perhaps 10% of the codebase. The remaining 90% is a relentless, highly sophisticated battle against entropy.

Network connections drop. Context windows overflow. The model hallucinates a regex, drops a closing bracket, or gets stuck in a recursive loop. The user interrupts the terminal mid-stream. How an agent handles these messy, real-world edge cases tells you far more about its maturity than any SWE-bench score.

Our deep dive into the hidden subsystems of these tools reveals three distinct survival strategies:

**1\. Anthropic optimizes for Cognitive Resilience.**

Claude Code assumes the model is brilliant, but its working memory is fragile. Anthropic builds massive shock absorbers around the LLM — context-aware retry state machines, the *withhold-and-recover* pattern, a 5-stage context compaction pipeline, and content-addressable file history. The entire architecture is designed to keep the agent in a continuous state of “flow” without ever crashing the session or losing the thread of a complex refactoring task.

**2\. OpenAI optimizes for Deterministic Paranoia.**

Codex CLI assumes the AI is inherently chaotic and must be strictly contained. By leveraging Rust’s type safety, RwLock concurrency, 4-level Unicode-normalizing patch algorithms, and invisible Git "Ghost Commits" for point-in-time rollbacks, OpenAI enforces rigorous software engineering discipline over non-deterministic outputs. Its kernel-level sandbox and pre-main() process hardening prove that OpenAI treats the agent not as a collaborative buddy, but as a potential vector for compromise that must be chained to the OS.

**3\. Google optimizes for Meta-Intelligence and Scale.**

Gemini CLI assumes that brute-forcing intelligence is economically unviable at planetary scale. Google uses lightweight LLMs to solve systems engineering problems — deploying secondary AI calls to verify fuzzy edits, break infinite loops, and dynamically route traffic to cheaper models based on prompt complexity. Paired with semantic log truncation and native OpenTelemetry, Gemini is built for distributed fleets of agents, not just individual local developers.

### **The era of the “AI wrapper” is officially over**

To build a coding agent that works 80% of the time, you just need a good system prompt and a basic Python script. But to build one that works 99% of the time — to overcome the compound unreliability that prevents 88% of enterprise AI projects from reaching production — you need OS-level sandboxing, speculative execution classifiers, lock-safe concurrency, point-in-time recovery, and cascaded fallback routing.

The ultimate, zero-compromise autonomous developer does not yet exist in a single repository. But as this 4,000-file forensic analysis proves, every single component required to build it has already been written, tested, and shipped to production.

The team that successfully synthesizes OpenAI’s impenetrable security stack, Anthropic’s deep cognitive orchestration, and Google’s economic meta-routing won’t just win the CLI developer wars. They will define the architecture for the next decade of software engineering.

The blueprints are out there. The source code never lies. It is time to build.

👋 Byteburst #8.
