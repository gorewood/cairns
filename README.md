# Cairns

A static knowledge base designed to be **owned and operated by an AI agent**. The agent researches topics, writes long-form articles, publishes them, maintains quality, and processes reader feedback — all autonomously. Humans suggest topics, read articles, and annotate problems. The agent does everything else.

**A cairn** is a stack of stones marking a trail — placed at forks, summits, and anywhere a traveler might lose the path. That's what this system produces: self-contained knowledge markers built by an agent to help the team navigate unfamiliar territory.

- A single article is a **cairn**
- A multi-part series is a **trail**
- The homepage is the **trailhead**
- The `/guide/` page explains how everything works

## Why This Exists

Every small team has institutional knowledge trapped in chat threads, one person's head, or nowhere. Building a proper knowledge base was always "nice to have" but never worth the engineering time. The ROI math didn't work.

Cairns changes that math. An AI agent handles the entire content lifecycle — from research to publishing to maintenance — while humans stay in the loop through low-friction feedback mechanisms.

### What Makes It Different

**The agent can access your codebase and internal docs.** When it writes about your system architecture, it can read your actual source code, deployment configs, and decision records — not work from a design doc someone forwarded. Cross-referenced with live web research on the patterns and technologies involved, the result reads like documentation written by a senior engineer who's been on the project for months.

**Content improves itself.** Readers annotate articles directly — select text, add a comment, submit a GitHub issue with one click. An issue monitor triages the feedback, fixes the content, and pushes the update. The loop from "I spotted a problem" to "it's fixed on the live site" can close without human intervention.

**Multi-audience documentation from one source.** A single trail (multi-part series) can serve executives who want business framing, new hires who need onboarding context, and engineers who need architectural reference — because the agent has access to enough context to write for all three.

### The Feedback Loop

```
Reader spots problem → Selects text → Adds annotation → Creates GitHub issue
                                                              ↓
                    Article updated ← Agent pushes fix ← Issue monitor triages
                         ↓
                  Static host deploys automatically
```

The inline annotation system is entirely client-side — vanilla JavaScript, localStorage for persistence, GitHub Issues URL parameters for pre-populated issue creation. No server, no database, no accounts beyond GitHub. Annotations are optional — enable them by adding a repo reference to `site.json`.

## Architecture

```
Agent writes markdown ──→ Eleventy builds HTML ──→ Static host deploys
       ↑                                                 ↓
  OpenClaw skill                              GitHub Pages / Cloudflare
  teaches format                              Pages / Netlify / etc.
```

Cairns is an [Eleventy](https://www.11ty.dev/) 3.x static site with a companion [OpenClaw](https://docs.openclaw.ai/) skill. The agent uses its existing tools (file system, exec, web search) — the skill teaches it the content format and workflows. No custom plugins or build tooling on the agent side.

**This is a template and framework.** Everything — the content cadence, deployment target, tag vocabulary, guide page, cron schedules — is a starting point you adapt to your team. The included skill gives your agent enough context to help you make those decisions during setup.

## Content Generation

The agent produces knowledge articles based on team requests and autonomous topic selection. On-demand requests are always valid — the weekly cadence is a pulse, not a limit.

### What the Agent Can Draw From

- **Source code** — reads repos directly (any language, IaC, configs)
- **Internal documentation** — decision records, specs, architecture docs
- **Web research** — cross-references external sources for context and best practices
- **Team conversations** — channel context (with appropriate privacy boundaries)

### What the Framework Provides

The agent writes a single markdown file. Everything else is automatic:

- **Dark academic journal aesthetic** with light/dark mode toggle
- **Article template** with sticky TOC sidebar, scroll progress, section reveal animations
- **Taxonomy** — articles auto-appear in Library (by tag), Archives (by date), and tag index pages
- **Static search** via [Pagefind](https://pagefind.app/) — header magnifying glass, available on all pages
- **Trail support** — multi-part series with prev/next navigation, trail cards on the trailhead
- **Inline annotations** — select text, add comments, export as GitHub issue (optional)
- **Guide page** — `/guide/` explains how to read, contribute, and request content
- **Content components** — callout boxes (4 types), scenario blocks, sidenotes, Mermaid diagrams (theme-aware), syntax highlighting, summary lists, discussion prompts, annotated references

## Quick Start

```bash
git clone <this-repo>
cd cairns
npm install
npm run build        # Eleventy build + Pagefind index
npm run serve        # Dev server with live reload
```

### Creating a Cairn

Create `src/articles/YYYY-MM-DD-slug.md`:

```yaml
---
title: "Article Title"
subtitle: "One-line description"
date: 2026-04-10
tags: [architecture, tools]
submitter: Agent
duration: 15
status: published
lead: >
  A 2-3 sentence hook that appears below the title.
permalink: /articles/topic-slug/
---

## First Section

Content with **markdown**, callout boxes, and more.

::: callout key
The essential takeaway from this section.
:::
```

Run `npm run build` — the article appears at its permalink, in the trailhead, library, archives, and relevant tag pages.

### Trail Articles

Add trail frontmatter to group articles into a series:

```yaml
trail: "Trail Name"
trailOrder: 1
trailDescription: "Brief description shown on the trailhead trail card."
audience: ["technical", "business"]
```

## Deployment

Cairns is a static site — deploy anywhere that serves HTML:

- **GitHub Pages** — simplest option for public knowledge bases
- **Cloudflare Pages** — auto-deploys on push, add Access policies for SSO/private access
- **Netlify, Vercel, S3** — any static host works

## OpenClaw Integration

### Cron Jobs

The full autonomous lifecycle is powered by cron jobs. Adjust schedules and timezones to your team:

| Job | Schedule | What it does |
|---|---|---|
| **Weekly Article** | Weekly | Researches and publishes a new cairn based on team suggestions or autonomous topic selection |
| **Mid-Week Engagement** | Weekly | Nudges the team channel with topic ideas if it's been quiet |
| **Issue Monitor** | Daily/hourly | Triages GitHub issues; content fixes push to main, framework fixes go through PR |
| **Maintenance** | Weekly | Tag cleanup, cross-link audit, broken link detection, build verification |
| **Content Drift** | Weekly | Compares articles against source documents; flags when upstream code changes |

All long-form reports use **threaded delivery**: a short summary in the channel, full details in a thread.

### Installing the Skill

```bash
cp -r skill/cairns ~/.openclaw/skills/
```

The skill teaches the agent the full content pipeline, markdown format, cron configurations, and all content components. See `skill/cairns/references/` for detailed documentation.

### Memory Integration

Published cairns can be indexed into the agent's memory system, making past content searchable in conversations and enabling cross-referencing across articles.

## Content Format

### Callout Boxes

```markdown
::: callout key    ← Green: key takeaways
::: callout tip    ← Blue: implementation tips
::: callout warn   ← Orange: warnings and caveats
::: callout def    ← Purple: definitions
```

### Scenario Blocks

```html
<div class="scenario">
<div class="scenario-header">Example: Title</div>
<div class="slack-msg"><span class="sender bot">@Agent</span> Message</div>
<div class="slack-msg"><span class="sender human">@Person</span> Reply</div>
</div>
```

### Mermaid Diagrams

Fenced code blocks with `mermaid` language tag. Theme-aware (adapts to light/dark mode). Do not use inline style directives on Mermaid nodes.

### Full Reference

See `skill/cairns/references/` for complete documentation:
- `frontmatter-spec.md` — all frontmatter fields
- `content-format.md` — full markdown syntax reference
- `maintenance.md` — periodic maintenance workflows and cron configurations

## Project Structure

```
cairns/
├── .eleventy.js              ← Build config
├── package.json
├── src/
│   ├── articles/             ← Agent writes here
│   ├── _includes/
│   │   ├── layouts/          ← article, base, guide layouts
│   │   ├── partials/         ← Header (with search), footer
│   │   ├── css/              ← base, article, index, guide, annotate, search, syntax styles
│   │   └── js/               ← annotate.js (optional annotation system)
│   ├── _data/site.json       ← Site config (title, URL, optional annotations)
│   ├── index.njk             ← Trailhead (trails → featured → recent)
│   ├── guide.md              ← How to use the knowledge base (customize for your team)
│   ├── library.njk           ← Tag-organized view
│   ├── archives.njk          ← Chronological view
│   ├── trails.njk            ← Trail landing page
│   └── tags.njk              ← Auto-generated tag pages
├── skill/cairns/             ← OpenClaw skill
│   ├── SKILL.md
│   └── references/
└── _site/                    ← Build output (gitignored)
```

## License

MIT
