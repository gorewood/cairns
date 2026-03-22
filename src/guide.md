---
layout: layouts/guide.njk
title: Guide to Cairns
subtitle: How to read, contribute to, and get the most out of the knowledge base.
permalink: /guide/
---

## What is Cairns?

Cairns is a knowledge base where each article — called a **cairn** — covers one concept in depth. Multi-part series are called **trails**. The front page is the **trailhead**.

::: callout def
**cairn** — a stack of stones marking a trail, placed at forks, summits, and anywhere a traveler might lose the path. Here: a self-contained knowledge article built to help the team navigate unfamiliar territory.
:::

The goal is simple: make institutional knowledge durable and discoverable so it doesn't live in one person's head or get lost in chat threads.

<!-- TODO: Customize this section for your team. Describe what topics
     your cairns cover and why they exist. -->

## How to Navigate

- **Trailhead** — the homepage. Shows featured trails, the latest cairn, and recent articles.
- **Trails** — multi-part series that build understanding step by step. Start at part 1.
- **Library** — all cairns organized by topic tag.
- **Archives** — chronological listing of everything published.
- **Search** — the magnifying glass in the header searches the full text of every cairn.

::: callout tip
Read trails in order. Each part assumes context from the previous ones — jumping to part 4 of a 6-part series will leave gaps.
:::

## How to Contribute

**Suggest a topic.** Drop a message in your team's channel with a topic you'd like covered — a system you're curious about, a decision that needs explaining, or a concept that keeps coming up in conversations.

::: callout tip
The more specific the request, the faster it gets built. "How does our auth system work?" is better than "something about security." But half-formed ideas are welcome too — the agent will follow up to flesh things out.
:::

**Request a cairn on demand.** You don't have to wait for the weekly article. If you need something specific — a deep-dive on a system, an architectural decision record, onboarding context for a new area — ask and it'll get built. The weekly cadence is a pulse to keep the project alive, not a throughput limit.

**Report a problem.** If you spot something wrong, outdated, or confusing, file an issue. Corrections, missing context, and "this doesn't match what I see in production" reports are all valuable.

**Discuss.** Most cairns end with discussion prompts. Use them — in chat, in 1:1s, wherever. The articles are conversation starters, not final words.

<!-- TODO: Add your team's specific contribution channels here.
     Examples: Slack channel name, GitHub issues URL, etc. -->

## How Content Stays Fresh

Cairns is maintained by automated processes that keep the knowledge base active and accurate:

| Process | Cadence | What it does |
|---------|---------|-------------|
| **Weekly article** | Weekly | Researches and publishes a new cairn based on team suggestions or autonomous topic selection |
| **Mid-week engagement** | Weekly | Nudges the team channel with topic ideas if it's been quiet |
| **Maintenance** | Weekly | Tag cleanup, cross-link audits, broken references, build verification |

::: callout key
The weekly cron and engagement nudges keep the project alive with a steady pulse. But Cairns is not limited to one article per week — it responds to what the team needs, when they need it. On-demand requests are always valid.
:::

<!-- TODO: Adjust the cadence table to match your actual cron configuration.
     See skill/cairns/references/maintenance.md for the full roster. -->

## Do

- **Suggest topics** — the more specific, the better
- **Report issues** when something is wrong or missing context
- **Read trails in order** — they're designed to build understanding sequentially
- **Use the search** — it indexes the full text of every cairn
- **React and discuss** — the discussion prompts are real questions, not decoration

## Don't

- **Don't edit `main` directly** — all changes go through pull requests
- **Don't assume cairns are the last word** — they're snapshots of understanding at publication time; check dates and source links if you're making decisions based on them
