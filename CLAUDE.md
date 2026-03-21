# Cairns — Agent-Powered Knowledge Trail System

## What This Is

A lightweight static CMS for agent-generated knowledge articles. An OpenClaw agent researches topics, writes long-form articles ("cairns"), and publishes them to a static site that becomes a living knowledge base. The framework handles structure, templates, styling, taxonomy, and search — the agent focuses purely on content.

**Metaphor:** A cairn marks a trail. Each article is a **cairn**. A multi-part series is a **trail**. The archive index is the **trailhead**.

## Architecture

**Eleventy static site** + **OpenClaw skill** (not a plugin).

The agent already has file system, exec, web search, and browser tools. No custom tools needed — the skill teaches the agent the content format and workflows. The repo provides the build system and templates.

```
Agent writes markdown → Eleventy builds HTML → Static host deploys
     ↑                                              ↓
  OpenClaw skill teaches format            Cloudflare Pages / Netlify / etc.
```

### Key Decisions
- **Eleventy** — markdown-it extensible, data cascade for frontmatter, Pagefind-compatible
- **Pagefind** — static search, build-time indexed, zero-JS, faceted by tags
- **OpenClaw skill** — zero-code, zero-build, just markdown instructions. Lives in `skill/cairns/`
- **Dark academic journal aesthetic** — deep dark background (#0c0c14), purple accent (#7c5cfc)
- **Design reference screenshots** in `docs/` are source of truth for visual direction

### Content Format
- Markdown + YAML frontmatter → Eleventy templates → static HTML
- Custom markdown-it containers for callouts (`::: callout key`), scenarios, newthought
- Sidenotes via footnote syntax (margin notes on wide, click-to-expand on narrow)
- Auto-generated TOC from h2 headings
- Section reveal animation (respects prefers-reduced-motion)

### Navigation
- **Trailhead** — featured + recent cairns (main landing)
- **Library** — tag/topic organized knowledge base view
- **Archives** — chronological listing, search-focused
- **Header** — shared, includes dark/light mode toggle, NO user avatar/login

### Hosting
- Private GitHub repo → Cloudflare Pages (auto-deploy on push to main)
- Cloudflare Access gates the site (team emails only)

## Repo Structure (Target)

```
cairns/
├── .eleventy.js
├── package.json
├── skill/cairns/                  ← OpenClaw skill
│   ├── SKILL.md
│   └── references/
├── src/                           ← Eleventy input
│   ├── _includes/{layouts,partials,css}/
│   ├── _data/site.json
│   ├── articles/                  ← Agent writes here
│   ├── index.njk                  ← Trailhead
│   ├── library.njk
│   └── archives.njk
├── _site/                         ← Build output (gitignored)
└── docs/                          ← Specs, design references
```

## Current State

### Pre-migration files (to be consumed by Eleventy migration):
- `index.html` — trailhead page (inline CSS, three-column layout) → design reference
- `presentations/2026-03-20-the-quiet-teammate/index.html` — first article (inline CSS, left TOC) → design reference
- `shared/pico.min.css` — vendored, NO LONGER USED
- `shared/learn-module.css` — NO LONGER USED (superseded by inline styles)
- `templates/module.html` — OUTDATED template
- `docs/docs` — original implementation spec (partially outdated, see roadmap)
- `docs/the-quiet-teammate.html` — reference HTML (outdated styling, content reference only)

### Roadmap
See `docs/ROADMAP.md` (or the plan file) for the full phased roadmap:
- Phase 0: Working Eleventy foundation
- Phase 1: Content components (callouts, scenarios, sidenotes via markdown-it)
- Phase 2: Taxonomy & navigation (tags, library, archives)
- Phase 3: Search (Pagefind)
- Phase 4: Trails (series, cross-linking, backlinks)
- Phase 5: OpenClaw skill
- Phase 6: Deploy & polish

## Color Palette

```
--bg:          #0c0c14
--bg-card:     #14141f
--bg-card-alt: #1a1a28
--border:      #1e1e2e
--border-light: #2a2a3a
--text:        #c0c0cc
--text-muted:  #6a6a7a
--text-bright: #e8e8f0
--accent:      #7c5cfc
--accent-dim:  #5a3fd4
--accent-glow: rgba(124,92,252,0.15)
```

## Style Guide for Content Generation

- One concept per section
- Use `.newthought` small-caps for opening words of key paragraphs
- Every section should have at most one callout box
- Scenario blocks for concrete examples (Slack mockups)
- 2-3 discussion prompts at the end
- Annotated references with brief descriptions
- Target 12-20 minutes reading time per cairn

## Known Issues
- Nested Slack message boxes in scenario blocks are incorrectly left-indented — should be flush left
- `shared/learn-module.css` and `shared/pico.min.css` are dead files — remove during migration
