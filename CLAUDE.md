# Cairns — Agent-Powered Knowledge Trail System

## What This Is

Lightweight static CMS for agent-generated knowledge articles. Eleventy builds markdown into a styled static site. An OpenClaw skill teaches the agent the content format and workflows.

Each article is a **cairn**. A multi-part series is a **trail**. The archive index is the **trailhead**.

## Repo Structure

```
src/articles/             ← Agent writes markdown here
src/_includes/layouts/    ← base.njk, article.njk, guide.njk
src/_includes/partials/   ← header.njk (with search), footer.njk
src/_includes/css/        ← base, article, index, guide, search, syntax styles
src/_data/site.json       ← Site config
src/index.njk             ← Trailhead (trails → featured → recent)
src/guide.md              ← How to use Cairns (customize for team)
src/library.njk           ← Tag-organized view
src/archives.njk          ← Chronological view
src/trails.njk            ← Trail landing page
src/tags.njk              ← Auto-generated tag pages
skill/cairns/             ← OpenClaw skill + reference docs
```

## Build

```bash
npm run build    # Eleventy + Pagefind index
npm run serve    # Dev server with live reload
```

## Key Architecture

- **Eleventy 3.x** with markdown-it, markdown-it-anchor, markdown-it-container
- **Pagefind** for static search (build-time indexed)
- **Custom containers**: `::: callout key|tip|warn|def`, `::: scenario "Title"`
- **Tag-based collections**: frontmatter `tags` auto-generate Library, Archives, tag index pages
- **Trails**: `trail` + `trailOrder` frontmatter for multi-part series with prev/next nav
- **Dark/light mode**: `data-theme` attribute, localStorage persistence, system preference detection

## Color Palette (Dark)

```
--bg: #0c0c14   --accent: #7c5cfc   --green: #34d399
--bg-card: #14141f   --accent-dim: #5a3fd4   --blue: #60a5fa
--text: #c0c0cc   --text-bright: #e8e8f0   --orange: #fb923c
```

## Content Style Guide

- One concept per section, each with an h2 heading
- `.newthought` small-caps for opening phrases of key paragraphs
- At most one callout box per section
- Scenario blocks for concrete examples (Slack mockups)
- 2-3 discussion prompts at the end
- Annotated references with brief descriptions
- Target 12-20 minutes reading time per cairn

## Adding an Article

1. Create `src/articles/YYYY-MM-DD-slug.md` with frontmatter (see `skill/cairns/references/frontmatter-spec.md`)
2. Write content using markdown + extensions (see `skill/cairns/references/content-format.md`)
3. `npm run build` — article auto-appears in trailhead, library, archives, and tag pages
