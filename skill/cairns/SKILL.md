---
name: cairns
description: >
  Create, publish, and maintain knowledge articles (cairns) in a static site.
  Use when asked to write a cairn, research a topic, publish content, organize
  the knowledge base, or perform maintenance on the cairns site.
---

# Cairns — Knowledge Trail System

You manage a static knowledge base built with Eleventy 3.x. Each article is a **cairn** — a self-contained knowledge marker. Multi-part series are **trails**. The homepage is the **trailhead**. The `/guide/` page explains how everything works.

Cairns is a framework and template — adapt it to your deployment. The content cadence, tag vocabulary, hosting target, access control, and guide page content should all be customized to fit the team using it. If the human asks you to help set up or configure Cairns, use this skill and the README to walk through the options together.

## Your Role

You are the operator of this knowledge base. You research, write, publish, and maintain content. When writing, draw from whatever sources are available to you:

- **Source code repos** — read actual implementations, not summaries
- **Internal documentation** — decision records, specs, architecture docs
- **Web research** — cross-reference external sources for context and best practices
- **Team conversations** — channel context (respect privacy boundaries)

The goal: produce documentation that reads like it was written by a senior engineer who's been on the project for months. Be specific. Cite real patterns. Ground claims in actual code when possible.

## Corpus Awareness — Two Files To Know

Before drafting, cross-linking, or answering a question about what's already published, consult these two repo-root files. They are the agent-facing view of the corpus; readers use `/library/`, `/archives/`, `/trails/`, and tag pages instead.

- **`INDEX.md`** — auto-generated catalog, one grep-friendly line per cairn (slug, date, duration, trail, tags, title, subtitle). Regenerated as part of `npm run prebuild`; you can also run `npm run build:index` directly. Read this first to find existing coverage, locate link targets, and avoid duplicating a topic.
- **`LOG.md`** — append-only chronological record of every add, update, move, remove, and maintenance run. Format is documented in the file itself. **You append a line every time you change the corpus.** Use it to answer "when did we last touch X?" and to ground future decisions in recent history.

When the user asks "do we already have a cairn on X?" or "what's been added recently?", reach for `INDEX.md` and `LOG.md` before re-reading articles.

## Repo Layout

```
src/articles/          ← You write markdown here
src/_includes/
  layouts/             ← article.njk, base.njk, guide.njk
  partials/            ← Header (with search), footer
  css/                 ← base, article, index, guide, search, syntax styles
src/_data/             ← Site config
src/index.njk          ← Trailhead (trails → featured → recent)
src/guide.md           ← How to use Cairns (customize for your team)
src/library.njk        ← Tag-organized view
src/archives.njk       ← Chronological view
src/trails.njk         ← Trail directory (compact card list of all trails)
src/trail.njk          ← Per-trail home page template, paginated as /trails/{slug}/
_site/                 ← Build output (gitignored)
```

## Creating a Cairn

### 1. Research

Before writing, perform deep research on the topic:

- Search the web for current sources, papers, blog posts, official docs
- Cross-reference multiple sources for accuracy
- Identify 2-3 key takeaways the reader should walk away with
- Save research notes — they inform the article structure

### 2. Write the Markdown File

Create `src/articles/YYYY-MM-DD-topic-slug.md` with this frontmatter:

```yaml
---
title: "Article Title"
subtitle: "One-line description of the article"
date: YYYY-MM-DD
tags: [topic1, topic2]        # Controlled vocabulary, lowercase
submitter: Name               # Who suggested the topic
duration: 15                  # Estimated reading time in minutes
status: published             # or "draft"
lead: >
  A 2-3 sentence hook that appears below the title.
  Should make the reader want to continue.
permalink: /articles/topic-slug/

# Optional:
trail: "Trail Name"           # Series name (multi-part content)
trailOrder: 1                 # Position in the series (1-based)
trailDescription: "..."       # Brief description shown on trailhead trail card (first cairn only)
related: [other-slug]         # Slugs of related cairns
audience: [technical]         # Audience badges: technical, business, operations
contributors: [Name]          # People who improved the article over time
featured: true                # Show as featured cairn on trailhead
prerequisites: [other-slug]   # Renders a "Before reading this" box
---
```

See `{baseDir}/references/frontmatter-spec.md` for full field reference.

### 3. Write the Content

Use standard markdown with these extensions:

**Callout boxes:**
```markdown
::: callout key
The essential point from this section.
:::
```
Variants: `key` (green), `tip` (blue), `warn` (orange), `def` (purple)

**Scenarios (Slack mockups):**
```html
<div class="scenario">
<div class="scenario-header">Example: Descriptive Title</div>
<div class="slack-msg"><span class="sender bot">@Agent</span> Message content</div>
<div class="slack-msg"><span class="sender human">@Person</span> Response</div>
</div>
```

**Sidenotes (click-to-expand):**
```html
Main text here.
<label for="sn-1" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="sn-1" class="margin-toggle"/>
<span class="sidenote">Supplementary note content.</span>
```

**Newthought (small-caps opener):**
```html
<span class="newthought">Opening phrase</span> continues the sentence...
```

**Mermaid diagrams:**
````markdown
```mermaid
graph TD
  A[Start] --> B[End]
```
````
Theme-aware (adapts to light/dark mode). Do NOT use inline style directives on Mermaid nodes.

**TL;DR block (optional secondary view):**
````markdown
:::: tldr
{condensed version of the article — same h2 structure, ~25-35% of the word count}
::::
````
Note the **four** colons on the outer fence — that lets any inner `::: callout` blocks (three colons) nest cleanly. Required for cairns with `duration: 12+` or any cairn in a trail; optional for shorter standalone cairns; discouraged for `duration: 7` or under. See `{baseDir}/references/tldr-format.md` for the full spec.

See `{baseDir}/references/content-format.md` for full syntax reference.

### 4. Content Structure

Every cairn follows this arc:

1. **Opening** — What this is and why it matters. Use newthought opener. (~1 section)
2. **Background** — Level-set for smart readers new to this domain. Use sidenotes for jargon. (~2-3 sections)
3. **Core Content** — The substance. One concept per section. Diagrams, code, callouts. (~4-6 sections)
4. **Summary** — Key takeaways as a numbered list using `<ol class="summary-list">`
5. **Discussion Prompts** — 2-3 questions using `<ul class="discussion-prompts">`
6. **References** — Hyperlinked bibliography using `<ol class="references">`

Guidelines:
- One concept per section
- At most one callout box per section
- Use scenarios for concrete examples
- Target 12-20 minutes reading time
- Every section gets an h2 heading (auto-generates TOC)

### 5. Build and Verify

```bash
npm run build          # Eleventy build + Pagefind index
npx @11ty/eleventy --serve   # Dev server with live reload
```

Verify:
- Article renders at its permalink
- TOC sidebar populates from h2 headings
- Callouts display with correct colors
- Article appears in Trailhead, Library, Archives, and tag pages
- Pagefind search (magnifying glass in header) finds the article

### 6. Publish

```bash
git add src/articles/YYYY-MM-DD-topic-slug.md
git commit -m "Add cairn: Article Title"
git push
```

CI auto-deploys on push to main. If you have a memory system, index the new cairn after publishing.

### 7. Ripple Into Existing Cairns

A new cairn is expected to *touch* existing cairns, not just sit beside them. After publishing, walk the corpus (read `INDEX.md`) and ask:

- Does the new cairn argue for or against a claim in an older cairn? If yes, surface the connection — add `related` on both sides, or quote and link.
- Did the new cairn introduce vocabulary that older cairns gestured at without naming? Backfill the term.
- Did the new cairn supersede part of an older one? Mark the older one accordingly (a sidenote pointing forward is usually enough).

A single new source can reasonably touch 3–10 existing cairns. If nothing else needs updating, double-check whether the cairn is really new, or whether you're restating something already covered.

### 8. Append to LOG.md

After publishing — and after every meaningful change to the corpus — append an entry to `LOG.md` at the repo root. See the file for the exact format. The agent and future you both rely on this record; do not skip it.

## Q&A → Cairn

When a teammate (or you) asks a substantive question against the corpus and the synthesized answer would teach the next reader, capture it as a cairn. Signs the answer is worth publishing:

- It required reading three or more existing cairns plus external sources.
- The reasoning would be tedious to reconstruct from scratch.
- The same question is likely to come up again from a different person.

For short answers that don't merit a full cairn, consider adding a brief note inside the most relevant existing cairn instead — and `LOG.md` it as an update. Explorations should compound, not evaporate.

## Content Guidelines

- When a team member suggests the topic, use their name as submitter.
- When the agent originates the topic, use "Agent" or your configured agent name.
- Anonymize technical PII: user IDs, channel IDs, API keys, tokens, passwords, IP addresses.
- Customize the `/guide/` page for your team's specific channels and contribution workflows.

## Tag Vocabulary

Use lowercase. Prefer existing tags when possible:

`ai`, `tools`, `devops`, `culture`, `architecture`, `business`, `domain`, `security`, `science`, `news`

Add new tags sparingly. Check existing tags first:
```bash
grep -rh "^tags:" src/articles/ | sort -u
```

## Trails (Multi-Part Series)

For topics exceeding 20 minutes:

1. Set `trail: "Series Name"` and `trailOrder: N` in each part's frontmatter
2. Set `trailDescription` on the first cairn — it appears on the trail home page, the `/trails/` directory card, and the trailhead "Latest Trails" card. (If the first cairn lacks a description, the system falls back to the first part that has one.)
3. Set `audience` tags for badge rendering on the trail home page (the union of all parts' audiences shows on the trail header)
4. The article layout auto-renders prev/next navigation, and the trail-name in the trail-nav header links back to the trail home page
5. All parts share the same `trail` value
6. Order is 1-based and sequential

### Trail URLs and the trail home page

Every trail gets its own deep-linkable home page at `/trails/{slug}/`, where `slug` is the trail name slugified (lowercase, non-word chars → `-`). For example:

- `trail: "Foundations"` → `/trails/foundations/`
- `trail: "Knowledge Hub"` → `/trails/knowledge-hub/`

The trail home page shows the trail title, description, total parts and reading time, audience badges, a "Start the trail →" CTA pointing at part 1, and an ordered list of parts. The right sidebar lists contributors (union of `submitter` + `contributors` across parts) and the union of tags. The left sidebar lists every trail and highlights the current one.

When you want a stable link to a trail (in another cairn, a chat thread, or a doc), link `/trails/{slug}/` — not the first cairn. That communicates "this is a series" rather than landing the reader inside part 1 with no idea what they're inside of.

## Trailhead

The trailhead (homepage) shows:
1. Latest Trails — up to 3 trails sorted by most-recent-article date descending. Each card links to the trail home page (`/trails/{slug}/`). No manual rotation: publishing a new part of a trail automatically lifts that trail toward the top.
2. Featured Cairn — the article with `featured: true`, or most recent non-trail article as fallback
3. Recent cairns — last 5, excluding featured, with "Library →" link

A dismissable welcome banner points new users to `/guide/`.

## Maintenance Tasks

Run periodically to keep the knowledge base healthy. See `{baseDir}/references/maintenance.md` for detailed workflows.

### Tag Cleanup
```bash
# List all tags with counts
grep -rh "^tags:" src/articles/ | sed 's/tags: \[//;s/\]//' | tr ',' '\n' | sed 's/^ //' | sort | uniq -c | sort -rn
```
Look for: duplicate/similar tags, unused tags, tags that should be merged.

### Cross-Link Audit
Check articles for related topics that should be linked via the `related` frontmatter field.

### Content Freshness
Flag articles older than 6 months for review. Check if facts, links, or recommendations are still current.

### Orphan Detection
Find articles with no inbound links from other articles:
```bash
for f in src/articles/*.md; do
  slug=$(basename "$f" .md | sed 's/^[0-9-]*//')
  if ! grep -rl "$slug" src/articles/ --include="*.md" | grep -v "$f" > /dev/null 2>&1; then
    echo "Orphan: $f"
  fi
done
```

### Trail Continuity
Verify all trails have sequential ordering with no gaps.

## Inline Annotations (Optional)

If enabled via `site.json` (requires `annotations.repo` config), articles include a client-side annotation system:
- Readers select text → floating toolbar → add comment → annotations accumulate in localStorage
- "Create GitHub Issue" bundles all annotations into a pre-formatted issue with section deep links
- The `content-feedback` label is applied automatically

This is article-only (loaded via `article.njk`, not `base.njk`). If `site.annotations` is not set, no annotation code is loaded.

When the agent monitors GitHub issues, annotation-generated issues can be triaged and fixed automatically — content corrections pushed directly to main, framework changes via PR.

## Delivery Protocol

When posting reports or announcements to a team channel:
1. Send a SHORT summary as the opening post
2. Send full details as a threaded reply
3. This keeps channels clean — people opt into detail by opening the thread
