---
title: "BYTEBURST #5: The Rise of Neural Memory Systems and Test-Time Learning"
description: "For nearly a decade, the field of artificial intelligence has been defined by a single architectural paradigm: the Transformer."
pubDate: 2025-12-08T08:40:54.000Z
lang: en
tags: ["deep-learning", "generative-ai-solution", "artificial-intelligence", "large-language-models", "machine-learning"]
series: byteburst
seriesOrder: 5
status: imported
canonical: "https://blog.trukhin.com/byteburst-5-the-rise-of-neural-memory-systems-and-test-time-learning-6035610ac31d"
medium:
  id: "6035610ac31d"
  url: "https://medium.com/trukhinyuri/byteburst-5-the-rise-of-neural-memory-systems-and-test-time-learning-6035610ac31d"
  oldPaths: ["/byteburst-5-the-rise-of-neural-memory-systems-and-test-time-learning-6035610ac31d", "/p/6035610ac31d"]
  textHash: "799a7c19d4dd15bf48e5836a3713f26d729156b5151c1860127f9a4554c6acf0"
---
<figure><img src="https://cdn-images-1.medium.com/max/1024/1*6XE67MdK0_0Z1oDXJVMvRg.jpeg" alt="BYTEBURST #5" loading="eager" fetchpriority="high" decoding="async"><figcaption>BYTEBURST #5</figcaption></figure>

For nearly a decade, the field of artificial intelligence has been defined by a single architectural paradigm: [the Transformer](https://medium.com/@sampan090611/google-created-the-transformer-now-with-titans-they-might-finally-kill-it-a136caad9751). Introduced in the seminal 2017 paper “[Attention Is All You Need](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf),” the Transformer architecture revolutionized natural language processing (NLP) by discarding recurrence in favor of self-attention mechanisms that allowed for massive parallelization. This shift enabled the training of Large Language Models (LLMs) on dataset scales previously unimaginable, leading to the emergent capabilities seen in systems like ChatGPT, Claude, and Gemini. However, as the industry pushes these models toward real-world agency and lifelong learning, the fundamental limitations of the Transformer have become the primary bottleneck to progress.

The central deficiency of the Transformer is its static nature. Once pre-training is complete, the model’s weights are frozen. It effectively ceases to “learn” in the structural sense. While “In-Context Learning” allows these models to adapt temporarily to new information within their prompt, this adaptation is transient, computationally expensive, and strictly bounded by the context window. The “context window bottleneck” — the quadratic cost of attention which limits how much history a model can “see” — forces a reliance on truncated histories or lossy retrieval mechanisms (RAG), resulting in AI agents that suffer from a “Goldfish effect”: they function brilliantly in the moment but lack true long-term continuity.

This article investigates a paradigm shift that promises to transcend these limitations: **Neural Memory Systems** and **Test-Time Training (TTT)**. Spearheaded by Google Research’s [introduction of the **Titans** architecture and the **MIRAS** theoretical framework](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/), this movement proposes models that actively update their own parameters during inference. By treating the input stream not just as context to be processed, but as a dataset to be learned from in real-time, these systems mimic the plasticity of biological memory — prioritizing “surprising” information, forgetting the mundane, and theoretically enabling infinite context windows without the prohibitive computational costs of standard attention.

## The Context-Memory Dichotomy in Deep Learning

To understand the necessity of Titans, one must first deconstruct the mechanism of “memory” in current deep learning architectures. The prevailing terminology often conflates “context” with “memory,” yet structurally, they are distinct phenomena with vastly different properties in computational systems.

### The Limitations of the KV Cache

In a standard Transformer, “memory” during inference is represented by the Key-Value (KV) Cache. This is a buffer that stores the intermediate representations of every token in the current context window so they do not need to be recomputed for every new token generated.

As the model generates token *t*, it attends back to tokens <em>1</em> through *t-1* using the KV cache.

The computational cost of this attention operation grows quadratically O(N²) with the sequence length. While techniques like FlashAttention optimize the constant factors, the fundamental complexity class [remains](https://medium.com/@honeyricky1m3/google-just-solved-ais-memory-problem-here-s-what-changes-now-d52bc7fac3f9).

GPU memory is finite. When the context window (e.g., 128k tokens) is filled, the earliest tokens must be evicted. The model essentially undergoes a “hard reset” on that information. It does not “summarize” the evicted tokens; they simply vanish from its cognitive horizon.

### The “Goldfish Effect” and Agentic Failure

The inability to maintain a persistent, evolving state leads to the [“Goldfish Effect,”](https://medium.com/@honeyricky1m3/google-just-solved-ais-memory-problem-here-s-what-changes-now-d52bc7fac3f9) where AI agents lose coherence over extended interactions.

**Scenario:** An AI coding assistant helps a developer refactor a codebase.

If the conversation exceeds the context window, the model forgets the architectural decisions made at the start of the chat. The user must constantly re-paste context.

**Neural Memory Solution:** A TTT model would have updated its internal weights to *learn* the architectural decisions. Even if the specific tokens fall out of the immediate window, the *knowledge* persists in the modified parameters of the memory module.

### The Shift to Recurrent Compression

The [industry’s response](https://openreview.net/pdf?id=8GjSf9Rh7Z) has been a renewed interest in Recurrence. Recurrent Neural Networks (RNNs) process sequences linearly O(N) and maintain a fixed-size “hidden state” that compresses history. However, traditional RNNs (LSTMs, GRUs) and even modern variants (RWKV, Mamba) typically rely on **Linear Memory** or **Matrix-Valued States**.

A fixed-size vector or matrix has a limited capacity to encode information (the “lossy compression” problem). Compressing a 1,000-page novel into a single 4096x4096 matrix inevitably results in the loss of fine-grained detail.

Titans proposes that the “state” should not be a passive matrix, but the **weights of a Deep Neural Network**. By using a Deep Multilayer Perceptron (MLP) as the memory module, Titans leverages the massive storage capacity of neural weights to encode history, offering a theoretically superior storage medium compared to linear states.

## The MIRAS Framework: A Unified Theory of Sequence Modeling

The release of Titans was accompanied by a theoretical paper introducing [**MIRAS**](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/) (Memory as an Inherited Representation of Associative State). MIRAS [is not an architecture itself](https://www.alphaxiv.org/overview/2504.13173v1) but a meta-framework that unifies Transformers, RNNs, and TTT models under a single optimization-centric lens.

MIRAS posits that every sequence model can be defined by four design choices. This taxonomy allows researchers to move beyond the superficial differences between architectures (e.g., “gates” vs. “attention heads”) and analyze the underlying mathematical principles of memory formation.

### The Four Pillars of MIRAS

The framework breaks down sequence modeling into the following components:

<figure><img src="https://cdn-images-1.medium.com/max/1020/1*22ibdFliIYskyP5WmflRFw.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

### Forgetting as Regularization

One of the most profound theoretical contributions of MIRAS is the reinterpretation of the “forget gate.” In traditional engineering (e.g., LSTMs), the forget gate is a mechanism to clear the buffer. In MIRAS, forgetting is framed as [**Online Regularization**](https://www.reddit.com/r/accelerate/comments/1pf2up5/google_research_presents_titans_miras_a_path/).

If memory update is viewed as minimizing a loss function <em>L</em> over the history of tokens, then “forgetting” is the addition of a regularization term *R(M)* (like L2 weight decay) to that loss.

We don’t want the memory to perfectly memorize every noisy data point (overfitting. We want it to retain generalizable patterns ([the intuition](https://arxiv.org/html/2504.13173v1)). Regularization (forgetting) ensures the memory remains plastic and doesn’t saturate, allowing it to adapt to new distributions (concept drift) in the data stream.

### Beyond the L2 Norm: Moneta, Yaad, and Memora

Using the MIRAS framework, Google researchers derived three new experimental architectures by swapping the components, demonstrating the [framework’s generative power](https://the-decoder.com/google-outlines-miras-and-titans-a-possible-path-toward-continuously-learning-ai/):

1.  **Moneta:** Uses **Lp-norm** objectives for the Attentional Bias. This makes the memory robust to different noise distributions in the input data.
2.  **Yaad:** Uses **Huber Loss**. Huber loss is less sensitive to outliers than squared error. This makes Yaad robust against “distractor” tokens or anomalies that might otherwise corrupt the memory state.
3.  **Memora:** Uses **KL-Divergence** for its Retention Gate. This manages memory updates like probability distributions, potentially improving stability in probabilistic reasoning tasks.

These variants highlight that “Memory” is not a singular concept but a tunable optimization problem. Depending on the task (e.g., reading a noisy OCR document vs. a clean code repository), different “Attentional Biases” (Moneta vs. Yaad) might be optimal.

## The Titans Architecture: Anatomy of Neural Memory

Titans is the flagship implementation of the MIRAS framework. It is designed to combine the precise, short-term reasoning of Transformers with the infinite-context capacity of Neural Memory. The architecture is a hybrid, consisting of three “Hyper-Heads” that [work in concert](https://www.datacamp.com/blog/titans-architecture).

### The Three-Head Structure

**Core (Short-Term Memory):**

-   Standard Self-Attention (Transformer).
-   Processes the immediate “chunk” of input (e.g., the last 2k-8k tokens).
-   Provides high-fidelity, exact retrieval for local dependencies (e.g., subject-verb agreement, immediate logic). It acts as the [“Working Memory”](https://boxworld.medium.com/the-end-of-the-transformer-google-titan-explained-7f697a68c946).

**Neural Long-Term Memory (The “Deep” Memory):**

-   Deep Multilayer Perceptron (MLP).
-   Stores the compressed history of the *entire* sequence seen so far.
-   The weights of this MLP are updated via gradient descent at every step.
-   Acts as the “Episodic/Semantic Memory.” It holds the plot of the book, the variables defined 10,000 lines ago, or the user’s persona.

**Persistent Memory (Meta-Memory):**

-   Learnable, Fixed Parameters.
-   A set of static weights that do *not* update during inference.
-   Encodes task-specific priors and general knowledge gained during pre-training. It acts as the model’s “Instinct” or “Long-term Knowledge Base,” preventing the plastic Neural Memory from drifting too far or being “brainwashed” by [a deceptive prompt](https://mykubert.com/blog/ai-that-thinks-like-a-human-titans-transformer-squared-and-the-future-of-adaptive-intelligence/).

### The Surprise Metric: Learning via “Shock”

The core innovation of Titans is *how* the Neural Memory updates. It does not blindly store everything. It uses [a **Surprise Metric**](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/) to determine the importance of incoming information.

### The Biological Inspiration

Cognitive science suggests humans remember events that violate expectations. We forget the commute to work (routine/low surprise) but remember a car accident (violation/high surprise). Titans mathematically formalizes this using gradients.

The “Surprise” *St* is defined as the gradient of the loss function ell with respect to the input Xt and the current memory state *Mt-1*.

<figure><img src="https://cdn-images-1.medium.com/max/350/1*6NjBlOtJDtNsX2kJDCjCwg.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

If the memory *Mt-1* can already predict/reconstruct *Xt* accurately, the loss is low, the gradient is near zero. The model says, “I knew this already,” and the memory is barely updated.

If *Xt* is unexpected, the loss is high, and the gradient is large. The model says, “This is new!” and significantly shifts the weights of *M* to encode this new fact.

Titans refines this metric to prevent instability. A single outlier shouldn’t rewrite the whole memory.

**Momentary Surprise:** The immediate gradient from the current token.

**Past Surprise:** A momentum-based moving average of previous gradients.

The update rule combines these, ensuring that memory updates follow a consistent “direction” rather than oscillating wildly with every noisy token.

### Architectural Configurations: MAC, MAG, MAL

The authors [propose](https://www.shaped.ai/blog/titans-learning-to-memorize-at-test-time-a-breakthrough-in-neural-memory-systems) three ways to wire the Neural Memory into the Core attention:

**1\. Memory as Context (MAC)**

The Neural Memory MLP produces a sequence of “memory vectors.” These are prepended to the input of the Core Attention, similar to soft prompting.

Like a student bringing a “cheat sheet” (Memory) into an exam (Context). The Core Attention can “read” the cheat sheet alongside the exam questions.

[This variant](https://medium.com/@Tom1212121/paper-post-transformers-154c372c6438) generally yields the best results on reasoning tasks because it allows the powerful Attention mechanism to cross-reference the Memory explicitly.

**2\. Memory as Gate (MAG)**

The input is processed by *both* the Core Attention and the Neural Memory in parallel branches. A learnable “Gate” then mixes their outputs.

Two experts (Short-term and Long-term) giving an opinion, and a manager (Gate) deciding which one to trust for the current prediction.

This Effective for tasks where the importance of history decays [smoothly](https://anuragdulapalli.com/posts/titans-ai/).

**3\. Memory as Layer (MAL)**

The Neural Memory acts as a layer *before* the Core Attention, enriching the token embeddings with historical context before they even reach the attention mechanism.

Wearing “history-tinted glasses.” The input is fundamentally altered by memory before processing.

This Generally [less effective](https://medium.com/@Tom1212121/paper-post-transformers-154c372c6438) than MAC for explicit recall but computationally efficient.

## The Paradigm of Test-Time Training (TTT)

Titans belongs to a broader emerging class of models utilizing **Test-Time Training (TTT)**. This paradigm represents a fundamental break from the “Train-Freeze-Deploy” lifecycle of traditional deep learning.

### The Philosophy: Learning to Learn

In TTT, the “inference” phase is actually a [“continuous training”](https://towardsdatascience.com/the-age-of-self-evolving-ai-is-here/) phase. The model is effectively “fine-tuning” itself on the user’s prompt in real-time. This aligns with the concept of meta-learning: the outer loop (pre-training) learns the *learning algorithm* that the inner loop (inference) uses to adapt.

### Google’s Titans vs. Sun et al.’s TTT Layers

It is critical to distinguish Google’s work from the TTT research by Sun et al. (Stanford/Berkeley/Meta), as both use similar terminology but [distinct mechanisms](https://arxiv.org/html/2510.09551v1).

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*hAlwuNCKnP91IUGJUKVyuQ.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

[Critically](https://medium.com/@sampan090611/google-created-the-transformer-now-with-titans-they-might-finally-kill-it-a136caad9751), the Titans paper argues that the **Deep MLP** used in their memory module is superior to the linear/shallow learners in Sun et al.’s TTT because deep networks have exponentially greater capacity to store complex abstractions. A linear learner might memorize “King — Man + Woman = Queen,” but a Deep MLP can memorize the plot twists of a mystery novel without overwriting the character motivations.

## Titans vs. The Efficient Alternatives

The quest for efficient long-context modeling is crowded. Titans faces fierce competition from **State Space Models (SSMs)** like Mamba and **Linear Transformers** like RWKV.

### Titans vs. Mamba (SSMs)

Mamba relies on **Selective State Spaces**, which compress history into a matrix state. It uses a hardware-aware parallel scan (associative scan) for extreme speed.

-   [Mamba](https://blog.gopenai.com/deep-dive-into-mamba-rwkv-and-state-space-models-b45d5e6a38c9) is generally faster than Titans for short/medium sequences because its state update is a simple matrix operation, whereas Titans requires a gradient calculation (forward + backward pass).
-   Mamba’s state is [fixed-size](https://medium.com/@Tom1212121/paper-post-transformers-154c372c6438) and linear. It suffers from the “capacity crunch.” In the “Needle in a Haystack” benchmark, Mamba performance degrades as the “haystack” grows beyond its state capacity. Titans, with its Deep Memory, demonstrated significantly better recall on 1M+ token sequences.
-   [Mamba “selects” what to ignore](https://medium.com/@la_boukouffallah/titans-paper-explained-memory-in-large-language-models-179fa79ad472). Titans “regularizes” what to forget. Titans’ gradient-based surprise metric is arguably more semantic — it forgets based on *information redundancy*, whereas Mamba forgets based on *input gating*.

### Titans vs. RWKV

RWKV (Receptance Weighted Key Value) is a Linear RNN that mimics Transformer behavior.

RWKV is fully recurrent and attention-free (in the O(N²) sense). Titans is a **Hybrid**, keeping a local Sliding Window Attention (Transformer) for the Core.

The Hybrid nature of Titans (MAC) gives it an edge in “Associate Recall.” The Core Attention handles the easy, local lookup, while the Neural Memory handles the long-range storage. RWKV must force *all* recall through the recurrent state, which can create a bottleneck for high-fidelity [local tasks](https://www.reddit.com/r/LocalLLaMA/comments/1hs3966/why_bother_with_rwkvmamba_instead_of_decoder/).

### The Landscape of Long-Context Models

<figure><img src="https://cdn-images-1.medium.com/max/1024/1*c993ogrkFtMxIYsOxmu6Ig.png" alt="Image from the original post" loading="lazy" decoding="async"></figure>

## Empirical Evidence: Benchmarks and Reality

Google’s claims for Titans are backed by performance on the **BABILong** benchmark, a rigorous test designed to break long-context models.

### BABILong and “Needle in a Haystack”

The model is given a massive document (the “haystack”) containing millions of tokens of noise and irrelevant text. Hidden within is a specific “needle” (e.g., a passkey or a fact). The model must answer a question requiring that needle.

Titans (MAC) achieved [**\>80% accuracy**](https://www.researchgate.net/publication/392204297_ATLAS_Learning_to_Optimally_Memorize_the_Context_at_Test_Time) on context lengths up to **10 million tokens**. In contrast, standard Transformers ran out of memory, and Linear RNNs (Mamba, RWKV) saw accuracy plummet as the sequence length increased, likely due to state saturation.

This validates the hypothesis that a **Deep Neural Memory** scales better than a Linear State.

### Time Series and Genomics

Titans also achieved state-of-the-art results in Time Series forecasting and DNA modeling.

[Genomics requires modeling dependencies](https://medium.com/@Tom1212121/paper-post-transformers-154c372c6438) between base pairs that are millions of positions apart. Titans’ ability to “skip” noise via the retention gate while locking onto significant gene markers via the surprise metric proved highly effective.

[In forecasting](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/), “surprise” corresponds to trend shifts or anomalies. Titans naturally adapts to non-stationary distributions (e.g., a sudden stock market crash) by rapidly updating its memory weights when the gradient spikes.

### Critique: The “Titans Revisited” Reimplementation

Despite the hype, independent analysis suggests Titans is not a silver bullet. A reimplementation study titled “Titans Revisited” [15 highlighted key nuances](https://www.researchgate.net/publication/396459459_Titans_Revisited_A_Lightweight_Reimplementation_and_Critical_Analysis_of_a_Test-Time_Memory_Model):

-   **Chunking Issues:** Titans processes data in chunks to enable parallelism. The study found that if dependencies cross chunk boundaries in specific ways, performance can drop. The “Gradient” flows well within a chunk, but passing the “Memory State” between chunks can be lossy if not tuned perfectly.
-   **Baseline Parity:** On shorter sequences (\<8k tokens), Titans did not consistently outperform well-tuned Transformers. Its advantage is strictly in the *extreme* long-context regime.
-   **Compute Overhead:** While memory efficient, Titans is compute-intensive. Calculating gradients for the memory module adds significant FLOPs overhead compared to the lightweight inference of Mamba.

## The Future of AI Architectures

The rise of Titans and Neural Memory signals a fundamental maturation of AI architecture. We are moving from “Static Processors” to “Dynamic Learners.”

### Lifelong Learning Agents

The most exciting application of Titans is the [**Lifelong Learning Agent**](https://medium.com/@honeyricky1m3/google-just-solved-ais-memory-problem-here-s-what-changes-now-d52bc7fac3f9). Current agents (e.g., ChatGPT sessions) are tabula rasa — they reset every session. A Titan-based agent could maintain a Persistent Memory of the user’s preferences and a Neural Memory of the shared history that evolves over months or years. It effectively “grows up” with the user, learning their quirks not via fine-tuning (which is expensive and batch-based) but via Test-Time Training (which is continuous and organic).

### Hardware Co-Design

The dominance of Transformers [shaped](https://arxiv.org/html/2505.23884v1) the current GPU landscape (HBM-heavy, bandwidth-centric) to accommodate massive KV caches. TTT models like Titans are **Compute-Bound** (matrix multiplications for gradient updates) rather than Memory-Bound. This could drive a shift in hardware design toward chips with higher FLOP density and on-chip SRAM for “Fast Weight” updates, reducing the reliance on massive HBM stacks.

### The Path to AGI?

Many cognitive scientists argue that AGI requires [**Episodic Memory**](https://boxworld.medium.com/the-end-of-the-transformer-google-titan-explained-7f697a68c946) — the ability to recall specific past experiences and learn from them in one shot. Transformers lack this; they only have “Semantic Memory” (frozen weights) and “Working Memory” (context window). Titans’ Neural Memory is the closest approximation to Episodic Memory yet, bridging the gap between the static knowledge of machines and the fluid, evolving memory of biological intelligence.

## Conclusion

The introduction of Titans and the MIRAS framework represents a watershed moment in deep learning. By challenging the static nature of the Transformer and successfully implementing a memory system that learns at test time, Google Research has opened the door to effectively infinite context windows and persistent, agentic personas.

While challenges in implementation efficiency and training stability remain, the theoretical unification provided by MIRAS suggests that the future of sequence modeling lies not in larger buffers, but in smarter optimization. The “Surprise Metric” provides a rigorous mathematical proxy for information gain, allowing silicon to mimic the biological efficiency of the human mind. As these architectures mature, we can expect a transition from models that merely predict the next token to agents that truly accumulate wisdom over time.
