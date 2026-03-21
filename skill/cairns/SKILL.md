---
name: cairns
description: >
  Create, publish, and maintain knowledge articles (cairns) in a static site.
  Use when asked to write a cairn, research a topic, publish content, organize
  the knowledge base, or perform maintenance on the cairns site.
---

# Cairns — Knowledge Trail System

You manage a static knowledge base built with Eleventy. Each article is a **cairn** — a self-contained knowledge marker. Multi-part series are **trails**. The archive index is the **trailhead**.

## Repo Layout

```
src/articles/    ← You write markdown here
src/_includes/   ← Layouts, partials, CSS (do not modify)
src/_data/       ← Site config
src/index.njk    ← Trailhead template
_site/           ← Build output (gitignored)
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
related: [other-slug]         # Slugs of related cairns
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
- Pagefind search finds the article content

### 6. Publish

```bash
git add src/articles/YYYY-MM-DD-topic-slug.md
git commit -m "Add cairn: Article Title"
git push
```

CI builds and deploys automatically on push to main.

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
2. The article layout auto-renders prev/next navigation
3. All parts share the same `trail` value
4. Order is 1-based and sequential

## Maintenance Tasks

Run periodically to keep the knowledge base healthy. See `{baseDir}/references/maintenance.md` for detailed workflows.

### Tag Cleanup
```bash
# List all tags with counts
grep -rh "^tags:" src/articles/ | sed 's/tags: \[//;s/\]//' | tr ',' '\n' | sed 's/^ //' | sort | uniq -c | sort -rn
```
Look for: duplicate/similar tags, unused tags, tags that should be merged.

### Cross-Link Audit
For each article, check if there are other articles on related topics that should be linked via the `related` frontmatter field.

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
