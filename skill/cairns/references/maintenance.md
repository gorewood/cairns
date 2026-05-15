# Maintenance Workflows

Run these periodically to keep the knowledge base healthy and well-connected.

Every maintenance run should end with a single `## [YYYY-MM-DD] maint | <kind> | <note>` line appended to `LOG.md` at the repo root. Future runs grep this to know what's been checked recently.

## After Publishing

After each new cairn is published:

1. **Cross-link check** — Does the new cairn relate to existing cairns? Add `related` slugs to both the new and existing articles' frontmatter. Treat this as expected ripple, not optional cleanup — a new cairn that touches nothing is suspicious.
2. **Tag review** — Are the tags on the new cairn consistent with how those tags are used elsewhere? Check `grep -rh "^tags:" src/articles/`.
3. **INDEX refresh** — The prebuild step regenerates `INDEX.md` automatically. If you skipped the build, run `npm run build:index` manually so the corpus catalog stays accurate.
4. **Build verify** — Run `npm run build` and check that Pagefind indexes the new content.
5. **Memory index** — If you have a memory system, index the new cairn: title, subtitle, tags, key takeaways, permalink, and sources.
6. **Log entry** — Append an `add` (or `update`) line to `LOG.md`. Do this last so the log records work that built cleanly, not work that aborted at the build step.

## Weekly: Knowledge Base Health

### Tag Cleanup

List all tags with article counts:

```bash
grep -rh "^tags:" src/articles/ | sed 's/tags: \[//;s/\]//' | tr ',' '\n' | sed 's/^ //' | sort | uniq -c | sort -rn
```

Look for:
- **Near-duplicates**: `devops` vs `dev-ops`, `ai` vs `artificial-intelligence`
- **Underused tags**: Tags with only 1 article — consider merging into a broader tag
- **Missing tags**: Articles that should be tagged but aren't

To rename a tag across all articles:
```bash
find src/articles -name "*.md" -exec sed -i '' 's/old-tag/new-tag/g' {} +
```

### Cross-Link Audit

For each article, identify potential related cairns that aren't yet linked:

1. Read each article's tags and topic
2. Find other articles sharing tags or covering complementary topics
3. Add missing `related` entries to frontmatter on both sides

Goal: no article should be an island. Every cairn should have at least one inbound or outbound link.

### Content Freshness

Flag articles for review based on age:

```bash
# Articles older than 6 months
find src/articles -name "*.md" -mtime +180
```

For flagged articles, check:
- Are external links still live?
- Have the tools/technologies discussed been updated?
- Is the advice still current?
- Should the article be updated or marked as historical?

### Orphan Detection

Find articles with no inbound references from other articles:

```bash
for f in src/articles/*.md; do
  slug=$(basename "$f" .md | sed 's/^[0-9]*-[0-9]*-[0-9]*-//')
  if ! grep -rl "$slug" src/articles/ --include="*.md" | grep -v "$f" > /dev/null 2>&1; then
    echo "Orphan: $slug"
  fi
done
```

Orphans should get `related` links added, or be considered for a trail grouping.

### TL;DR Coverage

Cairns are expected to ship with a TL;DR view when `duration: 12` or higher, or when the cairn is part of a trail (consistency across a trail matters more than per-cairn savings). See `tldr-format.md` for the full heuristic.

Find cairns that should have a TL;DR but don't:

```bash
for f in src/articles/**/*.md src/articles/*/*/*.md; do
  [ -f "$f" ] || continue
  has_tldr=$(grep -c '^:::: tldr$' "$f")
  duration=$(grep -m1 '^duration:' "$f" | awk '{print $2}')
  has_trail=$(grep -c '^trail:' "$f")
  if [ "$has_tldr" = "0" ] && { [ "${duration:-0}" -ge 12 ] || [ "$has_trail" -gt 0 ]; }; then
    echo "missing TL;DR: $f (duration=$duration, trail=$has_trail)"
  fi
done
```

The build's `prebuild` step (`npm run lint:tldr`) emits the same warnings non-blockingly. For each missing TL;DR, draft one per the spec (`tldr-format.md`) and insert at the top of the body. The toggle hides itself for cairns without a TL;DR, so missing ones do not break the page — they just leave the affordance unrealized.

### Contradiction Surfacing

When two cairns make conflicting claims about the same fact, recommendation, or definition, surface the conflict rather than silently picking a winner:

1. Quote both passages with their cairn slugs.
2. Note the date of each so the reader can see which is older.
3. If you know which is correct (e.g., one cites a now-out-of-date source), propose the fix — but let the human confirm before editing the surviving cairn.
4. If you genuinely don't know, flag it for the next human review and stop.

Contradictions are usually the most valuable thing a sweep finds: they're hidden by the per-article reading flow and only show up when something walks the whole corpus. Log them in `LOG.md` as `maint | contradictions | <note>` even when you don't fix them yet.

### Trail Continuity

For each trail, verify:
1. All parts exist (no gaps in `trailOrder`)
2. Order is sequential starting from 1
3. All parts share the same `trail` value exactly

```bash
grep -rn "^trail:" src/articles/ | sort
```

### Link Checking

Verify external links in published articles are still accessible:

```bash
grep -roh 'https\?://[^ )"]*' src/articles/*.md | sort -u | while read url; do
  status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$url")
  if [ "$status" != "200" ]; then
    echo "$status $url"
  fi
done
```

Fix or annotate broken links.

## Quarterly: Strategic Review

1. **Coverage gaps** — What topics does the team work with daily that have no cairns? Create topic suggestions.
2. **Stale trails** — Are there incomplete trails (series with missing parts)? Either complete them or mark as standalone.
3. **Reading patterns** — If analytics are available, identify which cairns are most/least read and adjust future topic selection.
4. **Tag taxonomy** — Is the tag vocabulary still serving discovery well? Consider restructuring if the library has grown significantly.

## Cron Job Configuration

Example OpenClaw cron configurations for automated maintenance:

### Weekly cairn generation (Thursday morning)
```bash
openclaw cron add --name "Weekly cairn" \
  --cron "0 9 * * 4" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the topic queue and produce this week's cairn. Research the topic, write the article, build the site, commit and push." \
  --announce --channel slack --to "channel:CAIRNS_CHANNEL_ID"
```

### Weekly maintenance (Friday afternoon)
```bash
openclaw cron add --name "Cairns maintenance" \
  --cron "0 14 * * 5" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Run weekly cairns maintenance: tag cleanup, cross-link audit, orphan detection, trail continuity check. Index any new content into memory. Report findings and push fixes." \
  --announce --channel slack --to "channel:CAIRNS_CHANNEL_ID"
```

### Mid-week engagement check (Tuesday morning)
```bash
openclaw cron add --name "Cairns engagement" \
  --cron "0 10 * * 2" --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check if this week's cairn topic has been decided. If not, scan recent team activity for relevant topics and suggest 2-3 candidates. If a topic is set, begin early research." \
  --announce --channel slack --to "channel:CAIRNS_CHANNEL_ID"
```
