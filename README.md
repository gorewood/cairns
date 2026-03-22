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

The inline annotation system is entirely client-side — vanilla JavaScript, localStorage for persistence, GitHub Issues URL parameters for pre-populated issue creation. No server, no database, no accounts beyond GitHub. (Annotations are optional — see Customization below.)

**This is a template and framework**, not a prescriptive system. Everything here — the content cadence, the deployment target, the tag vocabulary, the guide page, the cron schedules — is a starting point. The framework provides structure and styling; you decide how your agent uses it. The included skill and this README give your agent enough context to help you make those decisions during setup.

## Architecture

```
Agent writes markdown ──→ Eleventy builds HTML ──→ Static host deploys
       ↑                                                 ↓
  OpenClaw skill                              GitHub Pages / Cloudflare
  teaches format                              Pages / Netlify / etc.
```

Cairns is an [Eleventy](https://www.11ty.dev/) 3.x static site with a companion [OpenClaw](https://docs.openclaw.ai/) skill. The agent uses its existing tools (file system, exec, web search) — the skill teaches it the content format and workflows. No custom plugins or build tooling on the agent side.

## Design Intent

### Content Generation

The agent produces knowledge articles based on team requests and autonomous topic selection. On-demand requests are always valid — the weekly cadence is a pulse, not a limit. Each cairn follows a consistent arc:

1. **Research** — deep web search, cross-referencing sources, identifying key takeaways
2. **Write** — markdown with YAML frontmatter, using callout boxes, scenario blocks, sidenotes, Mermaid diagrams, and discussion prompts
3. **Build** — `npm run build` compiles markdown to styled HTML with auto-generated TOC, taxonomy pages, and search index
4. **Publish** — commit and push; CI deploys automatically

Articles target 12–20 minutes reading time. The format favors depth over breadth — each cairn covers one topic well rather than surveying many topics superficially.

### What the Framework Provides

The agent doesn't need to think about design, structure, or infrastructure. Cairns handles:

- **Dark academic journal aesthetic** with light/dark mode toggle
- **Article template** with sticky TOC sidebar, scroll progress, section reveal animations
- **Taxonomy** — articles auto-appear in Library (by tag), Archives (by date), and tag index pages
- **Static search** via [Pagefind](https://pagefind.app/) — build-time indexed, accessible from the header on all pages
- **Trail support** — multi-part series with prev/next navigation, trail cards on the trailhead
- **Cross-linking** — related cairns and prerequisites via frontmatter
- **Guide page** — `/guide/` explains how to navigate, contribute, and request cairns (customize for your team)
- **Syntax highlighting** — build-time Prism with theme-aware token colors
- **Content components** — callout boxes (4 types), scenario/Slack mockup blocks, sidenotes, Mermaid diagrams (theme-aware), summary lists, discussion prompts, annotated references

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

### Public Content: GitHub Pages

Add a GitHub Action that runs `npm run build` on push to main and deploys `_site/` to GitHub Pages. This is the simplest option for public knowledge bases.

### Private Content: Cloudflare Pages + Access

For team-internal knowledge bases with content that shouldn't be public:

1. Connect the repo to [Cloudflare Pages](https://pages.cloudflare.com/). Build command: `npm run build`. Output directory: `_site`.
2. In Cloudflare Zero Trust → Access, create a self-hosted application for the Pages domain.
3. Add an Access policy: Allow → emails ending in `@your-domain.com` (or use an IdP group).
4. **Important**: Also protect the `*.pages.dev` default domain, not just your custom domain.

Auto-deploys on push to `main` — changes are live within ~2 minutes.

## OpenClaw Integration

### Installing the Skill

```bash
cp -r skill/cairns ~/.openclaw/skills/
# or for workspace-scoped:
cp -r skill/cairns <workspace>/skills/
```

The skill teaches the agent the full content pipeline: research → write → build → publish, plus the markdown format with all components.

### Recommended Cron Jobs

Set up these crons to maintain a healthy content cadence. Adjust schedules and timezones to your team:

| Job | Suggested Schedule | What it does |
|---|---|---|
| **Weekly Article** | Thu morning | Researches and publishes a new cairn based on team suggestions or autonomous topic selection. |
| **Mid-Week Engagement** | Tue afternoon | Checks the team channel; if quiet, posts topic ideas or discussion prompts. |
| **Weekly Maintenance** | Fri afternoon | Tag cleanup, cross-link audit, orphan detection, broken link checks, content freshness review. |

Example cron configurations:

```bash
# Weekly article (Thursday 9am)
openclaw cron add --name "Weekly cairn" \
  --cron "0 9 * * 4" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Produce this week's cairn. Pick a topic relevant to the team's current work, research it thoroughly, write the article following the cairns format, build the site, and commit/push." \
  --announce --channel slack --to "channel:YOUR_CHANNEL_ID"

# Mid-week engagement (Tuesday 2pm)
openclaw cron add --name "Cairns engagement" \
  --cron "0 14 * * 2" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the team channel for activity. If quiet for 5+ days, post topic ideas or discussion prompts. If active, do nothing." \
  --announce --channel slack --to "channel:YOUR_CHANNEL_ID"

# Weekly maintenance (Friday 2pm)
openclaw cron add --name "Cairns maintenance" \
  --cron "0 14 * * 5" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Run weekly cairns maintenance: tag cleanup, cross-link audit, orphan detection, trail continuity check. Index any new content into memory. Report findings and push fixes." \
  --announce --channel slack --to "channel:YOUR_CHANNEL_ID"
```

#### Optional Additional Crons

Depending on your deployment, you may also want:

- **Issue Monitor** — daily check of GitHub issues; auto-triage or auto-fix simple corrections
- **Content Drift Check** — compare cairns against their `sources` frontmatter; flag when upstream docs change
- **Memory Re-index** — periodic re-index of all cairns into whatever memory/search system the agent uses

### Memory Integration

If your agent has a memory system (vector store, knowledge graph, or similar), index each published cairn after publishing:

- **What to index**: title, subtitle, tags, key takeaways (from callout boxes), permalink, date, and source references
- **When**: after each publish, or as part of the weekly maintenance pass
- **Why**: makes past cairn content searchable in future conversations, enables cross-referencing, and prevents topic repetition

### Customization

Cairns is a template — fork it and make it yours. Your agent can help with this process: point it at the skill and this README and ask it to help you set up. It has enough context to walk through deployment options, hosting decisions, access control, content cadence, and channel configuration with you.

Files to customize for your team:

- **`src/guide.md`** — replace TODO comments with your team's channels, issue tracker, and contribution workflows
- **`src/_data/site.json`** — set your site title and production URL
- **`src/_includes/partials/footer.njk`** — optionally add links to your issue tracker or team channels
- **Cron schedules** — adjust timezones, cadences, and channel IDs to match your team's rhythm
- **Tag vocabulary** — start with the defaults, let your agent evolve it as content grows
- **Deployment target** — pick what fits: GitHub Pages (public), Cloudflare Pages + Access (private), or any static host
- **Annotations** — enable inline feedback if you use GitHub Issues (see below)

### Inline Annotations (Optional)

Cairns includes an optional annotation system for collecting reader feedback directly on articles. Readers select text, add a comment, and submit all annotations as a bundled GitHub Issue with section deep links.

**To enable**, add an `annotations` block to `src/_data/site.json`:

```json
{
  "title": "Cairns",
  "description": "Agent-powered knowledge trail system",
  "url": "https://your-cairns-site.example.com",
  "annotations": {
    "repo": "your-org/cairns"
  }
}
```

This requires GitHub Issues enabled on the repo. The annotation UI appears automatically on all article pages. Annotations are stored in localStorage until submitted.

If you don't add the `annotations` config, the annotation system is completely inert — no CSS, JS, or UI is loaded.

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

### Mermaid Diagrams

Fenced code blocks with `mermaid` language tag. Theme-aware (adapts to light/dark mode). Do not use inline style directives on Mermaid nodes.

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
│   │   ├── layouts/          ← article, base, guide layouts
│   │   ├── partials/         ← Header (with search), footer
│   │   └── css/              ← base, article, index, guide, search, syntax styles
│   ├── _data/site.json       ← Site config
│   ├── index.njk             ← Trailhead (trails → featured → recent)
│   ├── guide.md              ← How to use Cairns (customize for your team)
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
