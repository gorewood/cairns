     Cairns — Architecture & Roadmap Plan

     Context

     Cairns is a lightweight static CMS for agent-generated knowledge articles. An OpenClaw agent researches topics, writes
     long-form articles ("cairns"), and publishes them to a static site that becomes a living knowledge base for a team. The
     framework handles structure, templates, styling, taxonomy, and search — the agent focuses purely on content.

     The metaphor: a cairn marks a trail. A single article is a cairn. A multi-part series is a trail. The archive index is
     the trailhead.

     Architecture Decision: Skill, Not Plugin

     OpenClaw plugins register custom tools, channels, and providers via TypeScript. They run in-process and are appropriate
     when you need new capabilities the agent doesn't have.

     OpenClaw skills are markdown instruction files (SKILL.md) that teach the agent how to use its existing tools for a
     specific workflow. They require no code, no build step, and no runtime dependencies.

     Cairns needs the agent to:
     1. Write markdown files in a specific frontmatter format → file system tools (already exist)
     2. Research topics via web search → web search tool (already exists)
     3. Run npx @11ty/eleventy to build → exec tool (already exists)
     4. Organize/cross-link content → file system + grep tools (already exist)

     Conclusion: Cairns = open source Eleventy framework repo + OpenClaw skill that teaches the agent the content format and
     workflows. No plugin needed.

     Repo Structure (Target)

     cairns/
     ├── .eleventy.js                    ← Eleventy config
     ├── package.json
     ├── CLAUDE.md                       ← Project context for Claude Code users
     │
     ├── skill/                          ← OpenClaw skill (copy to ~/.openclaw/skills/)
     │   └── cairns/
     │       ├── SKILL.md                ← Main skill: content creation workflow
     │       └── references/
     │           ├── frontmatter-spec.md ← Frontmatter field reference
     │           ├── content-format.md   ← Markdown extensions (callouts, scenarios, etc.)
     │           └── maintenance.md      ← Periodic maintenance workflows
     │
     ├── src/                            ← Eleventy input
     │   ├── _includes/
     │   │   ├── layouts/
     │   │   │   ├── base.njk           ← HTML shell, shared CSS, dark/light toggle
     │   │   │   ├── article.njk        ← Article page (extends base)
     │   │   │   └── index.njk          ← Index/trailhead page (extends base)
     │   │   ├── partials/
     │   │   │   ├── header.njk         ← Shared nav (Cairns brand, Modules/Library/Archives)
     │   │   │   ├── footer.njk
     │   │   │   ├── toc-sidebar.njk    ← Left TOC for articles
     │   │   │   └── callout.njk        ← Callout shortcode
     │   │   └── css/
     │   │       ├── base.css           ← Shared palette, reset, typography, nav, footer
     │   │       ├── article.css        ← Article components (callouts, scenarios, sidenotes)
     │   │       └── index.css          ← Index page (hero card, entries, sidebars)
     │   │
     │   ├── _data/
     │   │   └── site.json              ← Site config (title, description, base URL)
     │   │
     │   ├── articles/                  ← Agent writes markdown here
     │   │   └── 2026-03-20-the-quiet-teammate.md
     │   │
     │   ├── index.njk                  ← Trailhead (featured + recent)
     │   ├── library.njk                ← Tag-organized view
     │   └── archives.njk               ← Chronological listing
     │
     ├── _site/                         ← Build output (gitignored)
     │
     ├── .github/workflows/
     │   └── build.yml                  ← Build + deploy on push
     │
     └── docs/                          ← Specs, design references

     Roadmap

     Phase 0: Working Foundation

     Goal: Eleventy builds the site from markdown. Existing content migrated.

     - npm init + install eleventy
     - .eleventy.js config (input: src/, output: _site/)
     - Extract shared CSS from current inline <style> blocks into src/_includes/css/
       - base.css — palette variables, reset, typography, nav, footer
       - article.css — callouts, scenarios, sidenotes, TOC, code blocks
       - index.css — hero card, entries, sidebars, search bar
     - base.njk layout — HTML shell, CSS imports, header partial, footer partial
     - article.njk layout — extends base, adds TOC sidebar, article body, colophon
     - Convert "The Quiet Teammate" from HTML → markdown + frontmatter
     - index.njk — renders from article collection frontmatter
     - Build works: npx @11ty/eleventy produces working site in _site/
     - site.json with title ("Cairns"), description, etc.

     Files to modify/create: .eleventy.js, package.json, src/ tree, migrate content from index.html and presentations/
     Verify: npx @11ty/eleventy --serve renders both index and article correctly

     Phase 1: Content Components

     Goal: All article components work in markdown via custom markdown-it plugins.

     - Callout boxes via fenced container syntax: ::: callout key / ::: callout tip / etc.
     - Scenario blocks: ::: scenario "Title" with Slack message markup
     - Newthought: ::: newthought for small-caps opening phrases
     - Sidenotes via footnote-style syntax (rendered as margin notes on wide screens, click-to-expand on narrow)
     - Auto-generated TOC from h2 headings (Eleventy plugin or JS)
     - Summary lists with numbered purple circles (CSS counter)
     - Discussion prompts with speech bubble icons
     - Section reveal animation (CSS + IntersectionObserver, respects prefers-reduced-motion)

     Verify: The Quiet Teammate article renders identically to the current hand-crafted HTML

     Phase 2: Taxonomy & Navigation

     Goal: Articles are discoverable by tag, date, and browsing.

     - Tag system via frontmatter tags: [ai, tools, culture]
     - Library page — grouped by tag, each tag links to a tag index
     - Archives page — chronological list with search filter
     - Auto-generated tag index pages (Eleventy pagination)
     - Breadcrumb or back-to-trailhead link on articles
     - "Related cairns" sidebar (articles sharing tags)

     Verify: Adding a new markdown file with tags auto-appears in all three views

     Phase 3: Search

     Goal: Users can find content without browsing.

     - Integrate Pagefind (static search, zero-JS index, built at build time)
     - Search bar on trailhead and library pages
     - Search indexes article title, body text, tags, and frontmatter description

     Why Pagefind: Zero runtime dependencies, builds index at Eleventy build time, supports faceted filtering by tags, tiny
     JS payload, works with any static host. Better than Lunr.js for this use case.

     Verify: Search for a term that appears in article body returns the correct article

     Phase 4: Trails (Series & Cross-linking)

     Goal: Multi-part content and inter-article links.

     - Trail frontmatter: trail: { name: "Agent Patterns", order: 1, total: 3 }
     - Trail navigation (prev/next) auto-rendered on articles in a trail
     - Trail index page auto-generated showing all parts
     - Cross-link shortcode: {% link "the-quiet-teammate" %} renders title + link
     - "See also" section at article bottom (manual via frontmatter related: [slug, slug])
     - Backlink detection: if article A links to article B, B shows A in its "referenced by" section

     Verify: Create a 2-part trail, verify navigation renders. Cross-link between articles, verify backlinks appear.

     Phase 5: OpenClaw Skill

     Goal: An OpenClaw agent can create, publish, and maintain cairns autonomously.

     - skill/cairns/SKILL.md — main skill with:
       - Frontmatter spec (all fields, validation rules)
       - Content creation workflow: research → outline → draft → build → commit
       - Content format reference (callout syntax, scenario syntax, etc.)
       - Build/preview commands (npx @11ty/eleventy, npx @11ty/eleventy --serve)
       - Publishing workflow (commit, push, CI deploys)
     - skill/cairns/references/frontmatter-spec.md — detailed field reference
     - skill/cairns/references/content-format.md — markdown extension syntax
     - skill/cairns/references/maintenance.md — periodic maintenance workflows:
       - Tag cleanup (normalize, remove unused)
       - Cross-link suggestions (find articles that should reference each other)
       - Content freshness audit (flag articles older than N months for review)
       - Orphan detection (articles with no tags or no inbound links)
       - Trail continuity check (trails with missing parts)
     - Installation docs: copy skill/cairns/ to ~/.openclaw/skills/ or workspace
     - Example cron job configs for:
       - Weekly cairn generation (research + write + publish)
       - Monthly maintenance pass (taxonomy, cross-links, freshness)

     Verify: Install skill in OpenClaw, ask agent to "create a cairn about X", verify it produces valid markdown that builds
     correctly

     Phase 6: Deploy & Polish

     Goal: CI/CD pipeline, access control, dark/light mode.

     - GitHub Action: build with Eleventy, deploy to Cloudflare Pages
     - Dark/light mode toggle in header (localStorage + prefers-color-scheme)
     - Print stylesheet
     - Cloudflare Access setup documentation
     - README with setup instructions for new instances

     Verify: Push to main triggers build and deploy. Toggle dark/light mode. Print an article.

     Key Design Decisions

     Why Eleventy (not Hugo, Astro, etc.)

     - Zero-config for simple sites, Node ecosystem
     - Markdown-it extensible for custom containers
     - Data cascade for frontmatter → template
     - Pagefind integrates cleanly
     - The agent already has Node via exec

     Why Pagefind (not Lunr.js)

     - Build-time indexing, no client-side index download
     - Faceted search by tags out of the box
     - Smaller JS payload
     - Better for growing content libraries

     Why Skill (not Plugin)

     - No custom tools needed — agent has file system, exec, web search
     - Skills are zero-code, zero-build, just markdown
     - Can be installed by copying a directory
     - Can ship inside the repo itself
     - Plugins would add TypeScript build complexity for no benefit

     Content Format: Why Markdown + Custom Containers

     - Agent produces markdown natively and well
     - Custom containers (::: callout key) map cleanly to the visual components
     - Frontmatter handles all metadata (tags, dates, series, related)
     - Eleventy's data cascade makes frontmatter queryable for index/library/archives

     What This Is NOT

     - Not a general-purpose CMS — it's purpose-built for agent-generated knowledge articles
     - Not a slide deck system — articles are long-form scrolling content
     - Not a wiki — articles are authored by an agent, not collaboratively edited
     - Not an OpenClaw plugin — it's a framework repo with a companion skill
