# Cairns

A lightweight static knowledge base designed to be operated by an AI agent. The agent researches topics, writes long-form articles, and publishes them to a static site that grows into a living knowledge base.

**A cairn** is a stack of stones marking a trail — placed at forks, summits, and anywhere a traveler might lose the path. That's what this system produces: self-contained knowledge markers built by an agent to help the team navigate unfamiliar territory.

- A single article is a **cairn**
- A multi-part series is a **trail**
- The archive index is the **trailhead**

## Architecture

```
Agent writes markdown ──→ Eleventy builds HTML ──→ Static host deploys
       ↑                                                 ↓
  OpenClaw skill                              GitHub Pages / Cloudflare
  teaches format                              Pages / Netlify / etc.
```

Cairns is an [Eleventy](https://www.11ty.dev/) static site with a companion [OpenClaw](https://docs.openclaw.ai/) skill. The agent uses its existing tools (file system, exec, web search) — the skill teaches it the content format and workflows. No custom plugins or build tooling on the agent side.

## Design Intent

### Content Generation

The agent's job is producing **one well-researched knowledge article per cycle** (typically weekly). Each cairn follows a consistent arc:

1. **Research** — deep web search, cross-referencing sources, identifying key takeaways
2. **Write** — markdown with YAML frontmatter, using callout boxes, scenario blocks, sidenotes, and discussion prompts
3. **Build** — `npm run build` compiles markdown to styled HTML with auto-generated TOC, taxonomy pages, and search index
4. **Publish** — commit and push; CI deploys automatically

Articles target 12-20 minutes reading time. The format favors depth over breadth — each cairn covers one topic well rather than surveying many topics superficially.

### What the Framework Provides

The agent doesn't need to think about design, structure, or infrastructure. Cairns handles:

- **Dark academic journal aesthetic** with light mode toggle
- **Article template** with sticky TOC sidebar, scroll progress, section reveal animations
- **Taxonomy** — articles auto-appear in Library (by tag), Archives (by date), and tag index pages
- **Static search** via [Pagefind](https://pagefind.app/) — build-time indexed, zero-JS payload
- **Trail support** — multi-part series with prev/next navigation
- **Cross-linking** — related cairns via frontmatter
- **Content components** — callout boxes (4 types), scenario/Slack mockup blocks, sidenotes, summary lists, discussion prompts, annotated references

The agent writes a single markdown file. Everything else is automatic.

## Quick Start

```bash
git clone <this-repo>
cd cairns
npm install
npm run build        # Eleventy build + Pagefind index
npm run serve        # Dev server with live reload
```

### Creating a Cairn

Create `src/articles/YYYY-MM-DD-topic-slug.md`:

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

## Deployment

### Public Content: GitHub Pages

Add a GitHub Action that runs `npm run build` on push to main and deploys `_site/` to GitHub Pages. This is the simplest option for public knowledge bases.

### Private Content: Cloudflare Pages + Access

For team-internal knowledge bases with content that shouldn't be public:

1. Connect the repo to [Cloudflare Pages](https://pages.cloudflare.com/). Build command: `npm run build`. Output directory: `_site`.
2. In Cloudflare Zero Trust → Access, create a self-hosted application for the Pages domain.
3. Add an Access policy: Allow → emails ending in `@your-domain.com` (or enumerate specific addresses).
4. **Important**: Also protect the `*.pages.dev` default domain, not just your custom domain.

## OpenClaw Integration

### Installing the Skill

Copy the skill directory to your OpenClaw workspace:

```bash
cp -r skill/cairns ~/.openclaw/skills/
# or for workspace-scoped:
cp -r skill/cairns <workspace>/skills/
```

The skill teaches the agent the full content pipeline: research → write → build → publish, plus the markdown format with all components.

### Cron Jobs

#### Weekly Content Generation

```bash
openclaw cron add --name "Weekly cairn" \
  --cron "0 9 * * 4" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Produce this week's cairn. Pick a topic relevant to the team's current work, research it thoroughly, write the article following the cairns format, build the site, and commit/push." \
  --announce --channel slack --to "channel:YOUR_CHANNEL_ID"
```

#### Monthly Maintenance

```bash
openclaw cron add --name "Cairns maintenance" \
  --cron "0 10 1-7 * 1" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Run cairns maintenance: audit tags for consistency and merge near-duplicates. Check for orphan articles with no cross-links and add related entries. Review articles older than 6 months for freshness. Verify trail continuity. Index any new articles into your memory system for future reference. Report findings and push fixes." \
  --announce --channel slack --to "channel:YOUR_CHANNEL_ID"
```

### Memory Integration

If your OpenClaw agent has a memory system (QMD, vector store, knowledge graph, or similar), index each published cairn after publishing:

- **What to index**: title, subtitle, tags, key takeaways (from callout boxes), permalink, date, and source references
- **When**: after each publish, or as part of the monthly maintenance pass
- **Why**: makes past cairn content searchable in future conversations, enables the agent to cross-reference its own prior research, and prevents topic repetition

The maintenance cron is a good time to re-index all content and update cross-links based on the agent's growing understanding of topic relationships.

## Content Format

### Callout Boxes

```markdown
::: callout key    ← Green: key takeaways
::: callout tip    ← Blue: implementation tips
::: callout warn   ← Orange: warnings and caveats
::: callout def    ← Purple: definitions
```

### Scenario Blocks (Slack Mockups)

```html
<div class="scenario">
<div class="scenario-header">Example: Title</div>
<div class="slack-msg"><span class="sender bot">@Agent</span> Message</div>
<div class="slack-msg"><span class="sender human">@Person</span> Reply</div>
</div>
```

### Sidenotes, Trails, Cross-Links

See `skill/cairns/references/` for complete documentation:
- `frontmatter-spec.md` — all frontmatter fields
- `content-format.md` — full markdown syntax reference
- `maintenance.md` — periodic maintenance workflows

## Project Structure

```
cairns/
├── .eleventy.js              ← Build config
├── package.json
├── src/
│   ├── articles/             ← Agent writes here
│   ├── _includes/
│   │   ├── layouts/          ← Article + index page layouts
│   │   ├── partials/         ← Header, footer
│   │   └── css/              ← base, article, index, search styles
│   ├── _data/site.json       ← Site config
│   ├── index.njk             ← Trailhead
│   ├── library.njk           ← Tag-organized view
│   ├── archives.njk          ← Chronological view
│   └── tags.njk              ← Auto-generated tag pages
├── skill/cairns/             ← OpenClaw skill
│   ├── SKILL.md
│   └── references/
└── docs/                     ← Design references
```

## License

MIT
