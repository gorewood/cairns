# Frontmatter Field Reference

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article title. Appears in header, TOC, listings, search. |
| `subtitle` | string | One-line description. Appears below title and in listing cards. |
| `date` | date | Publication date (YYYY-MM-DD). Used for sorting and display. |
| `tags` | array | Topic tags, lowercase. Controls Library and tag page inclusion. |
| `submitter` | string | Who suggested or requested the topic. |
| `duration` | number | Estimated reading time in minutes. |
| `status` | string | `published` or `draft`. Drafts build but could be filtered from listings. |
| `lead` | string | 2-3 sentence hook. Supports HTML. Appears as article intro paragraph. |
| `permalink` | string | URL path. Use `/articles/topic-slug/` format. |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `trail` | string | Series name. All parts of a series share this value. |
| `trailOrder` | number | Position in the series (1-based). |
| `trailDescription` | string | Brief description shown on trailhead trail card. Set on the first cairn in a trail. |
| `related` | array | File slugs of related cairns (without path or extension). |
| `audience` | array | Audience badges rendered in subtitle and trail page. Values: `technical`, `business`, `operations`. |
| `contributors` | array | Names of people who improved the article over time. |
| `featured` | boolean | If `true`, this article appears as the Featured Cairn on the trailhead. Only one should be true at a time. |
| `prerequisites` | array | Slugs of articles that should be read first. Renders a "Before reading this" callout. |
| `sources` | array | Paths to authoritative source documents. Useful for content drift detection in maintenance crons. |

## Example

```yaml
---
title: "Zero-Trust Architecture for Small Teams"
subtitle: "Why the enterprise playbook doesn't work and what to do instead"
date: 2026-04-03
tags: [security, architecture]
submitter: Dana
duration: 18
status: published
lead: >
  You've heard the buzzword. You've seen the vendor slides.
  Here's what zero-trust actually looks like when your team
  is six people and your budget is "we have AWS credits."
permalink: /articles/zero-trust-small-teams/
related: [the-quiet-teammate]
audience: [technical]
---
```

## Tag Guidelines

- Use lowercase: `ai`, not `AI`
- Prefer existing tags over creating new ones
- Controlled vocabulary: `ai`, `tools`, `devops`, `culture`, `architecture`, `business`, `domain`, `security`, `science`, `news`
- An article should have 2-4 tags
- Tags auto-generate tag index pages at `/tags/{tag}/`

## Permalink Convention

Always use `/articles/{slug}/` format where slug is the topic in kebab-case, without date prefix. The date is in the frontmatter, not the URL.

## File Naming

`YYYY-MM-DD-topic-slug.md` — the date prefix ensures chronological sorting in the file system. The `permalink` field controls the actual URL.
