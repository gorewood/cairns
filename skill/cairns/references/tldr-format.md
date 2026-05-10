# TL;DR Format Reference

Cairns ship with two views: **Full** (the long-form, default) and **TL;DR** (a condensed, scan-friendly secondary view). The TL;DR is for readers who want the substance without the wall of text — skimmers, ADHD readers, time-pressed reviewers, returning readers refreshing their memory before referencing a cairn elsewhere.

This document is the format spec. The build pipeline extracts the TL;DR into a separate view; the article template renders one or the other behind a Full/TL;DR toggle.

## When a TL;DR is required

Apply this heuristic when authoring or auditing:

- **Required**: cairns with `duration: 12` or higher.
- **Required**: every cairn that is part of a trail. Consistency across a trail matters more than per-cairn savings — readers shouldn't see the toggle on some parts and not others.
- **Optional**: cairns with `duration: 8-11`. Judgment call: dense topic worth condensing → write one; simple short take → don't bother.
- **Discouraged**: cairns with `duration: 7` or lower. The source is already a quick scan; a TL;DR adds maintenance cost without saving the reader meaningful time.

A cairn without a TL;DR builds normally — the toggle hides itself. Don't author a TL;DR just to fill the slot; the spec only earns its keep when the discipline of compression makes the cairn more usable, not less.

## Storage: a single `:::tldr` block at the top of the body

The TL;DR lives in the same markdown file as the full article, inside a fenced container at the very top of the body (immediately after frontmatter). Use **four** colons for the outer fence so that any `::: callout` blocks (three colons) nest cleanly inside:

```markdown
---
title: "Article Title"
... rest of frontmatter ...
---

:::: tldr
{TL;DR content here — see "What goes inside" below}
::::

<span class="newthought">Opening phrase</span> {full article begins here}
```

### Rules

- Exactly one `:::: tldr` block per cairn, at the top of the body.
- The block must come **before** the first paragraph of the full article.
- Anything outside the block is the Full view; anything inside is the TL;DR view.
- Use four colons (`::::`) for the outer fence and three (`:::`) for any inner callouts. Markdown-it-container matches by colon count — mixing them is what makes nesting work.
- A cairn without a `:::: tldr` block builds normally — the toggle is hidden, the article shows only the Full view.

## What goes inside

The TL;DR is **not** a bulleted abstract. It is a condensed essay that mirrors the structure of the source and preserves the voice. A good TL;DR can stand alone — a reader who only ever sees the TL;DR walks away with the cairn's argument, not just its headlines.

### Length target

Aim for ~25-35% of the Full word count. The discipline of trimming is what matters; the exact percentage is downstream. For a 14-minute cairn (~2800 words), expect a TL;DR of ~700-1000 words and ~3-4 minutes of reading. The build computes TL;DR reading time automatically; do not put it in frontmatter.

In practice, structural overhead (h2 openers, the trailing summary list, discussion prompts, references) imposes a fixed cost that pushes shorter cairns toward the high end of the range. Long integration cairns with many h2s (15+ sections) may legitimately land at 35-40% — the through-line is what compresses, not the structure. Don't pad to hit a target; don't gut load-bearing detail to undershoot one.

### Structure

- **Mirror the h2 headings of the source.** Same section titles, same order. This lets a reader pivot between Full and TL;DR mid-read and stay oriented.
- Each section is **2-4 sentences** of distilled prose. Not a bullet list. Sentences carry voice; bullets do not.
- Keep `<span class="newthought">` openers on the first sentence of each section, exactly as in the Full version. The opener is part of the cairn's voice.
- **At most one callout per section**, and only if the callout carries a singular insight that the prose alone would lose. Most TL;DR sections will have zero callouts.
- **No scenario blocks.** If the Full version uses a scenario to illustrate a point, replace it in the TL;DR with one inline example sentence ("In practice: …").
- **No sidenotes.** Skim view is hostile to click-to-expand asides. Fold the load-bearing content of a sidenote into the prose if it matters; otherwise drop it.
- **No mermaid diagrams.** A reader who needs a diagram should be in Full view.

### Endings: keep what earns its keep

- **Summary list** — **drop it.** The TL;DR is itself a numbered summary by another name. A trailing `<ol class="summary-list">` after a TL;DR is summary-of-a-summary, and the redundancy makes both feel less essential. The Full view's summary list stays; the TL;DR view skips it.
- **Discussion prompts** — **drop them too.** The prompts are designed to land at the end of a long-form read where the reader has just sat with the argument for fifteen minutes. After a 4-minute scan, they show up as a tonal jolt — the reader is in skim mode, not discussion mode. The Full view's prompts stay; the TL;DR view skips them.
- **References** — keep them, lightly trimmed. The reader who only read the TL;DR may still want primary sources, and inline links in the prose may not surface every reference. 3-5 essential ones is enough.

### What to drop

- Long set-up paragraphs that establish stakes the reader will accept on faith.
- Anecdotes that exist for color rather than evidence.
- Quotations from longer sources where a paraphrase will do.
- Framing sentences that gesture at what the next paragraph will say.
- Anything you wrote because it was *interesting* rather than *load-bearing*. (This is the hard one. Be ruthless.)

## Authoring workflow

1. **Write the Full cairn first.** The TL;DR is downstream of the long form, not a parallel draft.
2. **Wait until the Full version feels done.** Drafting a TL;DR against a still-shifting Full version wastes effort.
3. **Open a `:::tldr` block at the top of the body.** Working title: copy the h2 headings from the Full version into the block as a skeleton.
4. **Section by section, distill.** For each h2 in the skeleton, write 2-4 sentences that carry the section's argument. Keep the newthought opener.
5. **Read it cold.** Does the TL;DR alone tell someone what the cairn is about and what to do with it? If not, you've over-trimmed.
6. **Trim again.** If you're at 35% of the source, take another pass. The target is 25-30% and the discipline is what makes the view valuable.
7. **Build and toggle.** `npm run build`, open the article, toggle to TL;DR, verify reading time, structure, banner, persistence.

## Voice and tone

The TL;DR is the same author writing for the same reader, just respecting their time more. Same vocabulary, same asides (when they pay rent), same opinions. A TL;DR that sounds like an AI-generated abstract has failed.

Imagine the reader is a colleague who asked you for "the short version" over coffee. You'd give them sentences, not bullets. You'd cut the wind-up and the throat-clearing. You'd keep the punchline of every section and the through-line that connects them. That's the bar.

## Build-time lint

A structural lint runs as part of `npm run build` (and standalone via `npm run lint:tldr`). It checks:

- **H2 parity** — TL;DR h2 titles must prefix-match Full's, in order. Catches divergence when a heading is shortened in one view and not the other.
- **Forbidden elements** — no `summary-list`, `discussion-prompts`, scenarios, sidenotes, or mermaid blocks inside the TL;DR. The spec drops all of these; the lint enforces it.
- **Fence structure** — exactly zero or one `:::: tldr` block, with balanced open/close.
- **Heuristic coverage** (warning) — flags cairns missing a TL;DR despite `duration ≥ 12` or being in a trail.

Errors fail the build. Warnings print but allow the build to proceed, since the missing-TL;DR backlog is typically worked through as a separate workstream rather than blocking publishing of new content.

## Quality checks

Before publishing a TL;DR, sanity-check:

- [ ] The section titles match the Full version's h2s.
- [ ] Word count is roughly 25-35% of the source (longer integration cairns may run higher; the discipline matters more than the percentage).
- [ ] No bullet-listification of paragraphs that should be sentences.
- [ ] No surviving sidenotes or scenario blocks.
- [ ] No surviving `<ol class="summary-list">` (TL;DR is itself the summary).
- [ ] No surviving `<ul class="discussion-prompts">` (skim mode and discussion mode are different audiences).
- [ ] Newthought openers preserved on each section's first sentence.
- [ ] Reads aloud the same way the Full version does, just denser.
- [ ] A reader who only reads the TL;DR understands the argument and could explain it to someone else.

## Example: the smallest TL;DR section

A Full-version section like this:

> ## Why feedback loops matter more than process
>
> Most teams that ship reliably did not get there by adopting a heavier process. They got there by tightening the loop between *make a change* and *find out whether it worked*. A weeklong release cycle hides bugs for a week; a five-minute one finds them in five minutes. The same dynamic applies to documentation: a knowledge base that ingests reader feedback in days will improve faster than one that updates quarterly, regardless of how thoughtful the quarterly review is.
>
> [...continues for several more paragraphs and a callout...]

…becomes a TL;DR section like this:

> ## Why feedback loops matter more than process
>
> <span class="newthought">Most teams that ship reliably</span> did not get there with heavier process — they got there by tightening the loop between making a change and finding out whether it worked. A weeklong cycle hides bugs for a week; a five-minute one finds them in five minutes. The same dynamic applies to a knowledge base: fast feedback in beats thoughtful review later.

Three sentences. Same opener. Same argument. ~60 words versus ~150. The reader who skims this gets the section's load-bearing claim and can decide whether to drop into Full for the texture.
