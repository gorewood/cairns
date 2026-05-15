# Cairns Log

Append-only chronological record of changes to the corpus. Newest entries at the top.

The agent appends a line every time it adds, updates, moves, removes, or performs
maintenance on a cairn. Grep this file to answer "when did we last touch X?",
"what was added this week?", or "what maintenance ran in the last month?".

For the auto-generated point-in-time catalog of every published cairn, see
`INDEX.md` (regenerated on each build).

## Conventions

Each entry is a single h2 line:

```
## [YYYY-MM-DD] kind | identifier | optional note
```

- **kind** — one of: `add`, `update`, `move`, `remove`, `maint`
- **identifier** — slug (for cairn-scoped entries) or short label (for `maint`)
- **note** — terse, human-readable; the *why* matters more than the *what*

Bundle related work on the same day under a single entry when reasonable; split
into multiple entries when the activities are distinct.

---

## [2026-05-14] maint | scaffolding | Add INDEX.md generator and LOG.md; teach the skill to consult INDEX before drafting and to append here on every change. Inspired by Karpathy's LLM Wiki gist (https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — we adopted the two agent-facing affordances (a grep-friendly catalog file and an append-only event log) without taking the broader entity/concept-page restructure.

## [2026-04-02] update | understanding-cairns | Fix trail description (remove hardcoded part count)

## [2026-04-02] update | cairns-feedback-loop, cairns-in-practice | Add trust boundaries section

## [2026-04-02] add | cairns-feedback-loop | Trail part 4 — The Feedback Loop (inline annotations + GitHub Issues)

## [2026-04-02] move | what-is-cairns → understanding-cairns + cairns-toolkit + cairns-in-practice | Split the kitchen-sink cairn into a three-part "What Is Cairns?" trail

## [2026-04-02] update | what-is-cairns | Reframe as multi-source knowledge hub, add feedback loop framing

## [2026-04-02] add | what-is-cairns | Kitchen-sink cairn introducing the system (later split into the trail above)

## [2026-03-20] update | the-quiet-teammate | Prepare for public release

## [2026-03-20] update | the-quiet-teammate | Taxonomy & navigation pass (Library, Archives, tag pages)

## [2026-03-20] add | the-quiet-teammate | Phase 0: Eleventy migration — first cairn, working build from markdown
