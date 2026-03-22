---
layout: layouts/guide.njk
title: Guide to Cairns
subtitle: How to read, navigate, and contribute to the knowledge base.
permalink: /guide/
---

## What is Cairns?

Cairns is a knowledge base where each article — called a **cairn** — covers one concept in depth. Multi-part series are called **trails**. The front page is the **trailhead**.

The goal: make institutional knowledge durable and discoverable so it doesn't live in one person's head or get lost in chat threads.

<!-- TODO: Customize this section for your team. Describe what topics
     your cairns cover and why they exist. -->

## How to navigate

- **Trailhead** — the homepage. Shows featured trails, the latest cairn, and recent articles.
- **Trails** — multi-part series that build understanding step by step. Start at part 1.
- **Library** — all cairns organized by topic tag.
- **Archives** — chronological listing of everything published.
- **Search** — the magnifying glass in the header searches the full text of every cairn.

## How to contribute

**Suggest a topic.** Drop a message in your team's channel with a topic you'd like covered — a system you're curious about, a decision that needs explaining, or a concept that keeps coming up.

**Request a cairn on demand.** You don't have to wait for the weekly article. If you need something specific — a deep-dive on a system, an architectural decision record, onboarding context — ask and it'll get built.

**Report issues.** If you spot something wrong, outdated, or confusing, file an issue. Corrections, missing context, and "this doesn't match reality" reports are all valuable.

**Discuss.** Most cairns end with discussion prompts. Use them — in chat, in 1:1s, wherever. The articles are conversation starters, not final words.

<!-- TODO: Add your team's specific contribution channels here.
     Examples: Slack channel name, GitHub issues URL, etc. -->

## How content stays fresh

Cairns is maintained by automated crons that keep the knowledge base active and accurate:

- **Weekly article** — A new cairn is researched, written, and published each week based on team suggestions and emerging priorities. On-demand requests are always valid — the weekly cadence is a pulse, not a limit.
- **Mid-week engagement** — If the team channel has been quiet, the agent drops in with topic ideas or discussion prompts.
- **Weekly maintenance** — Tag cleanup, cross-link audits, broken reference checks, and content freshness reviews run automatically.

<!-- TODO: Add or remove crons based on your deployment. See the
     skill/cairns/references/maintenance.md for the full roster. -->

## Do

- **Suggest topics** — the more specific, the better
- **Report issues** when something is wrong or missing context
- **Read trails in order** — they're designed to build understanding sequentially
- **Use the search** — it indexes the full text of every cairn

## Don't

- **Don't edit `main` directly** — all changes go through pull requests
- **Don't assume cairns are the last word** — they're snapshots of understanding at publication time; check dates and source links if you're making decisions based on them
