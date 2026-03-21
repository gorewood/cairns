# Eleventy Migration Plan

## Target Repo Structure

```
cairns/
├── .eleventy.js                    ← Eleventy config
├── package.json                    ← dependencies (eleventy, etc.)
├── .github/
│   └── workflows/
│       └── build.yml               ← Build + deploy on push to main
│
├── src/                            ← Eleventy input directory
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk            ← HTML shell, head, shared CSS, dark/light toggle
│   │   │   ├── article.njk         ← Article page layout (extends base)
│   │   │   └── index.njk           ← Index/archive page layout (extends base)
│   │   ├── partials/
│   │   │   ├── header.njk          ← Shared top nav (Cairns, Modules/Library/Archives, theme toggle)
│   │   │   ├── footer.njk          ← Shared footer
│   │   │   ├── toc-sidebar.njk     ← Left TOC sidebar for articles
│   │   │   └── callout.njk         ← Reusable callout shortcode
│   │   └── css/
│   │       ├── base.css            ← Shared variables, reset, typography, nav, footer
│   │       ├── article.css         ← Article-specific styles (callouts, scenarios, sidenotes, etc.)
│   │       └── index.css           ← Index-specific styles (hero card, entries, sidebars)
│   │
│   ├── _data/
│   │   └── site.json               ← Site-wide config (title, description, etc.)
│   │
│   ├── articles/                   ← Markdown content (each file = one article)
│   │   └── 2026-03-20-the-quiet-teammate.md
│   │
│   ├── index.njk                   ← Index page template
│   ├── library.njk                 ← Library (tag-organized) page
│   └── archives.njk                ← Archives (chronological) page
│
├── _site/                          ← Eleventy output (gitignored, built by CI)
│
└── docs/                           ← Specs and design references
    ├── docs                        ← Original implementation spec
    ├── the-quiet-teammate.html     ← Reference HTML from Claude Desktop
    └── ELEVENTY_MIGRATION.md       ← This file
```

## Article Markdown Format

Each article is a markdown file with YAML frontmatter:

```markdown
---
title: "The Quiet Teammate"
subtitle: "How OpenClaw Fills the Gaps Nobody Notices Until It's Too Late"
date: 2026-03-20
tags: [ai, tools, devops, culture]
submitter: Bob
duration: 15
status: published
lead: >
  Every small startup has the same dirty secret: a growing list of things
  that someone should probably get to but nobody owns.
---

## What Are We Actually Talking About?

::: newthought
OpenClaw is an open-source AI agent
:::
framework that connects large language models...

::: callout definition
**Glue work** — the behind-the-scenes organizational labor...
:::

::: scenario "Monday Morning in #engineering"
@Q: Good morning. Here's where things stand:
:::

::: callout key
The best first use of OpenClaw isn't automation — it's **visibility**.
:::
```

## Eleventy Plugins / Features Needed

- **Markdown-it** with custom containers plugin for callouts, scenarios, newthought
- **Table of Contents** auto-generation from h2 headings
- **Tag pages** auto-generated for the Library view
- **Collections** sorted by date for Archives
- **CSS inlining or bundling** — either inline the CSS in each page or bundle it

## Build & Deploy

```yaml
# .github/workflows/build.yml
name: Build & Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx @11ty/eleventy
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: cairns
          directory: _site
```

## Dark/Light Mode Toggle

- Store preference in `localStorage`
- Default to system preference via `prefers-color-scheme`
- Toggle button in shared header (sun/moon icon)
- CSS uses `[data-theme="dark"]` and `[data-theme="light"]` selectors
- All color variables defined for both themes in base.css

## Migration Steps

1. `npm init` + install eleventy
2. Create `.eleventy.js` config
3. Extract shared CSS from inline styles into `src/_includes/css/`
4. Create base layout with header, footer, dark/light toggle
5. Create article layout extending base
6. Convert "The Quiet Teammate" HTML → markdown with frontmatter
7. Create index page template
8. Create Library and Archives pages
9. Set up GitHub Action
10. Test full build locally
11. Connect to Cloudflare Pages
