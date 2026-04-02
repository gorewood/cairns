---
title: "What Is Cairns?"
subtitle: "An agent-powered knowledge trail system — and how to make it yours"
date: 2026-04-02
tags: [tools, ai, culture, architecture]
submitter: Agent
duration: 12
status: published
lead: >
  Your team's best thinking is scattered across Slack threads, Notion pages,
  repo READMEs, and the heads of people too busy to write it down.
  Cairns is a knowledge hub where an AI agent pulls from all of those sources,
  synthesizes what it finds, and publishes articles anyone on the team can read —
  a first stop that ties together everywhere your team works.
permalink: /articles/what-is-cairns/
featured: true
audience: [technical, business]
related: [the-quiet-teammate]
---

## The Problem Cairns Solves

<span class="newthought">Every team generates more knowledge</span> than it captures — and what it does capture gets scattered everywhere. A decision lands in a Slack thread. The implementation detail lives in a repo README. The business context is in a Notion page. The rationale is in someone's head.
<label for="sn-1" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="sn-1" class="margin-toggle"/>
<span class="sidenote">The term "cairn" comes from the Scottish Gaelic <em>càrn</em> — a stack of stones left on a trail to mark the way for those who follow. Hikers have used them for thousands of years.</span>

Getting the full picture on anything means hunting through five different tools, most of which require access permissions that adjacent teams don't have. New hires, stakeholders, and future-you all face the same problem: the knowledge exists, but nobody can find it without already knowing where to look.

```mermaid
graph LR
    S[Slack] --> A[Agent]
    N[Notion] --> A
    R[Repos] --> A
    D[Docs] --> A
    A --> C[Cairns]
    C --> T[Team reads]
    T -->|Feedback| A
```

::: callout key

The core insight: **an AI agent can do the synthesis.** It reads across every source your team uses, distills what it finds into well-structured articles written for learning, links back to the source of truth for deeper dives — and comes back to update when things change. Humans review, discuss, and steer. The agent does the labor.

:::

## How It Works

<span class="newthought">Cairns is a static site</span> built with [Eleventy](https://www.11ty.dev/). Articles are markdown files with YAML frontmatter. The build pipeline compiles them into a styled, searchable website with zero runtime dependencies — the kind of site you can hand to anyone on the team without worrying about access controls or onboarding to yet another tool.

The architecture is deliberately simple:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Sources | Repos, Notion, Slack, docs | Agent reads from these |
| Content | Markdown + frontmatter | Agent writes here |
| Build | Eleventy 3.x | Compiles to static HTML |
| Search | Pagefind | Build-time full-text index |
| Styling | Custom CSS | Dark/light mode, responsive |
| Agent | OpenClaw skill | Teaches the format + workflow |

The agent learns the content format from a **skill file** — a structured markdown document that describes the article template, frontmatter fields, markdown extensions, and publication workflow. Drop the skill into your agent's skill directory and it knows how to operate the entire system. Give it access to your team's knowledge sources and it does the synthesis work that nobody has time for.

::: callout def

**Skill file** — a markdown document that teaches an AI agent a specific capability. It describes *what* the agent should do, *how* to do it, and *what good looks like*. In Cairns, the skill file at `skill/cairns/SKILL.md` contains the complete operating manual for the knowledge base.

:::

## The Content Model

<span class="newthought">Cairns organizes knowledge</span> around three concepts:

<ol class="summary-list">
<li><strong>Cairn</strong> — a single article. Self-contained, well-researched, 12–20 minutes reading time. Each cairn has a title, subtitle, tags, reading time estimate, and a lead paragraph that hooks the reader.</li>
<li><strong>Trail</strong> — a multi-part series. Linked cairns with automatic prev/next navigation, shared metadata, and a collective reading time. Use trails for deep dives that span multiple sessions.</li>
<li><strong>Trailhead</strong> — the homepage. Shows active trails, the featured cairn, and recent articles. It's the starting point for readers who want to browse.</li>
</ol>

Every article lives in `src/articles/` as a dated markdown file. The frontmatter drives everything: tags auto-generate topic pages, trails auto-link their parts, and the featured flag controls the homepage hero card.

### Frontmatter in Practice

Here's what a typical article header looks like:

```yaml
---
title: "Zero-Trust for Small Teams"
subtitle: "The enterprise playbook doesn't work. Here's what does."
date: 2026-04-01
tags: [security, architecture]
submitter: Dana
duration: 18
status: published
lead: >
  You've heard the buzzword. You've seen the vendor slides.
  Here's what it actually looks like with six people
  and a budget of "we have AWS credits."
permalink: /articles/zero-trust-small-teams/
trail: "Security Fundamentals"
trailOrder: 1
audience: [technical]
---
```

## Visual Components

<span class="newthought">Cairns includes a set of visual components</span> designed for technical writing. They're all written in markdown or simple HTML — no custom JavaScript required.

### Callout Boxes

Four color-coded variants for different purposes:

::: callout key

**Key takeaways** use green. Reserve these for the single most important insight from a section — the thing the reader should remember if they forget everything else.

:::

::: callout tip

**Tips** use blue. Practical advice, implementation guidance, shortcuts. The kind of thing a senior engineer mentions offhand that saves you two hours.

:::

::: callout warn

**Warnings** use orange. Gotchas, caveats, things that will bite you if you're not careful. Use sparingly — if everything is a warning, nothing is.

:::

::: callout def

**Definitions** use purple. Terminology, jargon, concepts that need grounding. Especially valuable when writing for a mixed audience.

:::

### Scenario Blocks

Scenario blocks simulate Slack conversations. They're useful for showing how a process or tool interaction actually *feels* in practice, not just how it works in theory.

<div class="scenario">
<div class="scenario-header">Example: Agent publishes a new cairn</div>
<div class="slack-msg"><span class="sender bot">@CairnsAgent</span> Published: <strong>"What Is Cairns?"</strong><br/>A guide to the knowledge trail system and how to make it yours.<br/><code>12 min read · tools, ai, culture, architecture</code></div>
<div class="slack-msg"><span class="sender human">@Dana</span> Nice. Can you add a section on how trails work with an example from our onboarding series?</div>
<div class="slack-msg"><span class="sender bot">@CairnsAgent</span> Done — added a trail example to the "Content Model" section using the Security Fundamentals trail. Rebuilt and pushed. <a href="#">View diff</a></div>
</div>

### Mermaid Diagrams

Fenced code blocks with the `mermaid` language hint render as SVG diagrams. They auto-adapt to dark and light mode and re-render on theme toggle.

```mermaid
sequenceDiagram
    participant A as Agent
    participant S as Skill File
    participant R as Research
    participant E as Eleventy
    participant P as Pagefind

    A->>S: Read format + workflow
    A->>R: Web search, source code, docs
    R-->>A: Research notes
    A->>A: Draft markdown article
    A->>E: npm run build
    E->>P: Index content
    P-->>A: Search index ready
    A->>A: Verify build, commit, push
```

### Sidenotes

Sidenotes are click-to-expand supplementary notes — asides, historical context, source attributions — that don't interrupt the main flow.
<label for="sn-2" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="sn-2" class="margin-toggle"/>
<span class="sidenote">The sidenote pattern is borrowed from Edward Tufte's book design. Tufte argues that sidenotes are superior to footnotes because they keep supplementary information at the point of relevance rather than banishing it to the bottom of the page.</span>

The main text should always be complete without them. They're dessert, not the meal.

### Syntax-Highlighted Code

Standard fenced code blocks with language hints render with Prism.js syntax highlighting:

```python
def publish_cairn(article_path: str) -> None:
    """Build the site and verify the new article appears."""
    frontmatter = parse_frontmatter(article_path)
    validate_required_fields(frontmatter)

    # Build and index
    subprocess.run(["npm", "run", "build"], check=True)

    # Verify the article rendered
    slug = frontmatter["permalink"].strip("/").split("/")[-1]
    output = Path(f"_site/articles/{slug}/index.html")
    assert output.exists(), f"Article did not render: {output}"
```

## The Agent Workflow

<span class="newthought">The publication pipeline</span> is designed for autonomous operation. The agent follows a five-step workflow:

```mermaid
graph TD
    A[Research] --> B[Draft]
    B --> C[Build & verify]
    C --> D[Commit & push]
    D --> E[Announce]
    E -.-> F[Maintain]
    F -.-> B
```

1. **Research** — web search, source code analysis, internal docs. The agent gathers context from whatever sources are available.
2. **Draft** — write the markdown file with frontmatter, callouts, scenarios, diagrams. Follow the content style guide.
3. **Build & verify** — run `npm run build`, confirm the article renders, check for broken links.
4. **Commit & push** — standard git workflow. The article goes live when it merges to main.
5. **Announce** — post a summary to the team channel with a link.

The maintenance loop is the differentiator. The agent can be scheduled to:

- **Check freshness** — compare articles against their source documents and flag drift
- **Audit links** — detect broken external references
- **Clean tags** — normalize taxonomy, merge near-duplicates
- **Update content** — when upstream code changes, revise the article that describes it

::: callout tip

Start with weekly article generation and monthly maintenance sweeps. Increase cadence as the team builds trust in the output quality. A well-tuned agent produces articles that read like they were written by a senior engineer who's been on the project for months.

:::

## The Feedback Loop

<span class="newthought">A knowledge base that can't be corrected</span> is just a slower way to be wrong. Cairns is designed for a tight loop between readers and the curation agent.

<div class="scenario">
<div class="scenario-header">Example: Reader feedback drives correction</div>
<div class="slack-msg"><span class="sender human">@Dana</span> The cairn on API versioning says we use URL-path versioning, but we switched to header-based last quarter.</div>
<div class="slack-msg"><span class="sender bot">@CairnsAgent</span> Checked the API gateway config — you're right, <code>Accept-Version</code> header routing was added in March. Updating the article now.</div>
<div class="slack-msg"><span class="sender bot">@CairnsAgent</span> Done. Updated "API Versioning Without the Grief" — corrected the versioning strategy section, added a note about the migration. <a href="#">View diff</a></div>
</div>

This works because the agent has access to the same sources it originally drew from. It doesn't just accept the correction on faith — it *verifies*, then updates with evidence. The annotation system (optional) also lets readers flag issues directly from the article, creating GitHub issues the agent can triage.

### On-Demand Content

Beyond scheduled articles, anyone on the team can ask the agent to produce a new cairn on a specific topic. Need to onboard someone to the billing system? Ask the agent. Want a synthesis of the three different authentication approaches your team has debated? Ask the agent. It researches, drafts, and publishes — and the result is a permanent, linkable, searchable article, not a chat message that vanishes.

::: callout key

The combination of on-demand generation, reader feedback, and source-of-truth linking makes Cairns less like a wiki and more like a **knowledge concierge** — a first stop that can surface what any part of the organization knows, written for people who weren't in the room when it happened.

:::

## Making It Yours

<span class="newthought">Cairns is a template,</span> not a product. The first thing you should do after cloning is customize:

- **`src/_data/site.json`** — site title, description, URL
- **`src/guide.md`** — rewrite for your team's context, channels, and conventions
- **Tag vocabulary** — in `skill/cairns/references/frontmatter-spec.md`, adjust the controlled vocabulary to match your domain
- **Skill file** — edit `skill/cairns/SKILL.md` to reflect your team's tone, sources, and deployment target

The visual design — the dark academic aesthetic, the purple accent, the Tufte-inspired sidenotes — is opinionated but modifiable. All colors are CSS custom properties in `src/_includes/css/base.css`.
<label for="sn-3" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="sn-3" class="margin-toggle"/>
<span class="sidenote">The color palette was chosen for extended reading comfort. The dark mode uses a deep blue-black (#0c0c14) rather than pure black, which reduces eye strain. The purple accent (#7c5cfc) provides visual interest without the harshness of a saturated blue or green.</span>

### Deployment

Cairns builds to a `_site/` directory of static HTML, CSS, and JavaScript. Deploy it anywhere:

- **GitHub Pages** — push to main, Actions builds and deploys
- **Cloudflare Pages** — connect the repo, set `npm run build` as the build command
- **Netlify** — same pattern, zero config needed
- **S3 + CloudFront** — for teams that want full control

No server runtime. No database. No API keys for the reader-facing site.

## Summary

<ol class="summary-list">
<li><strong>Multi-source knowledge hub</strong> — the agent pulls from repos, Notion, Slack, docs, and anywhere else your team works. One place to find what you need.</li>
<li><strong>Written for learning</strong> — bite-sized articles with structured sections, callouts, diagrams, and scenarios. Not reference dumps — actual teaching.</li>
<li><strong>Links to source of truth</strong> — every article can point back to the authoritative source for deeper dives. Cairns is the first stop, not the only stop.</li>
<li><strong>Feedback-driven</strong> — readers tell the agent what's wrong, the agent verifies and corrects. On-demand content fills gaps when they're discovered.</li>
<li><strong>Self-maintaining</strong> — scheduled freshness checks, link audits, and source drift detection keep the knowledge base honest over time.</li>
</ol>

## Discussion Prompts

<ul class="discussion-prompts">
<li>What knowledge do people outside your team's core tools struggle to access? What would change if it were surfaced in one readable place?</li>
<li>If you could ask an agent to synthesize any topic from your team's scattered sources right now, what would you ask for first?</li>
<li>What's the minimum viable knowledge base — which three topics would onboard a new hire fastest if they were always up to date?</li>
</ul>

## References & Further Reading

<ol class="references">
<li><a href="https://www.11ty.dev/">Eleventy</a> <span class="annotation">— The static site generator Cairns is built on. Fast, flexible, zero client-side JavaScript by default.</span></li>
<li><a href="https://pagefind.app/">Pagefind</a> <span class="annotation">— Build-time search indexing for static sites. Powers Cairns' full-text search with no runtime dependencies.</span></li>
<li><a href="https://edwardtufte.github.io/tufte-css/">Tufte CSS</a> <span class="annotation">— The design inspiration for Cairns' sidenotes and typography. Tufte's principles of minimal, information-dense design.</span></li>
<li><a href="https://mermaid.js.org/">Mermaid</a> <span class="annotation">— JavaScript diagramming library used for flowcharts, sequence diagrams, and other visuals in cairns.</span></li>
<li><a href="https://docs.github.com/en/pages">GitHub Pages</a> <span class="annotation">— Free static hosting from GitHub. The simplest deployment target for Cairns.</span></li>
</ol>
