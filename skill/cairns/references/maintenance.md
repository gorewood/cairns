# Maintenance Workflows

Run these periodically to keep the knowledge base healthy and well-connected.

## After Publishing

After each new cairn is published:

1. **Cross-link check** — Does the new cairn relate to existing cairns? Add `related` slugs to both the new and existing articles' frontmatter.
2. **Tag review** — Are the tags on the new cairn consistent with how those tags are used elsewhere? Check `grep -rh "^tags:" src/articles/`.
3. **Memory index** — If you have a memory system, index the new cairn: title, subtitle, tags, key takeaways, permalink, and sources.
4. **Build verify** — Run `npm run build` and check that Pagefind indexes the new content.

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
