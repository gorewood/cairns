const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItContainer = require("markdown-it-container");
const markdownItPrism = require("markdown-it-prism");

module.exports = function (eleventyConfig) {
  // --- Markdown-it with custom containers ---
  const md = markdownIt({ html: true, linkify: true, typographer: true });

  // Heading anchors (auto-generates IDs for TOC)
  md.use(markdownItAnchor, {
    slugify: (s) =>
      s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
    permalink: false,
  });

  // :::: tldr — condensed view of the article. Rendered as a hidden div inside
  // the article body and surfaced by the Full/TL;DR toggle. data-pagefind-ignore
  // keeps it out of the search index so the TL;DR doesn't produce duplicate hits.
  // Uses a four-colon outer fence so any inner ::: callout (three-colon) blocks
  // nest cleanly — markdown-it-container matches by colon count.
  md.use(markdownItContainer, "tldr", {
    validate(params) {
      return params.trim() === "tldr";
    },
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div class="cairn-tldr" hidden data-pagefind-ignore>\n';
      }
      return "</div>\n";
    },
  });

  // ::: callout key / tip / warn / def
  md.use(markdownItContainer, "callout", {
    validate(params) {
      return params.trim().match(/^callout\s+(key|tip|warn|def)$/);
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^callout\s+(key|tip|warn|def)$/);
      if (tokens[idx].nesting === 1) {
        const labels = { key: "Key Takeaway", tip: "Tip", warn: "Warning", def: "Definition" };
        return `<div class="callout callout-${m[1]}">\n<span class="callout-label">${labels[m[1]]}</span>\n`;
      }
      return "</div>\n";
    },
  });

  // ::: scenario "Title"
  md.use(markdownItContainer, "scenario", {
    validate(params) {
      return params.trim().match(/^scenario\s+/);
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^scenario\s+"?(.+?)"?$/);
      if (tokens[idx].nesting === 1) {
        return `<div class="scenario">\n<div class="scenario-header">${md.utils.escapeHtml(m[1])}</div>\n`;
      }
      return "</div>\n";
    },
  });

  // ::: newthought
  md.use(markdownItContainer, "newthought", {
    validate(params) {
      return params.trim() === "newthought";
    },
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<span class="newthought">';
      }
      return "</span>";
    },
  });

  // ::: slack-msg bot|human "Name"
  md.use(markdownItContainer, "slack-msg", {
    validate(params) {
      return params.trim().match(/^slack-msg\s+/);
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^slack-msg\s+(bot|human)\s+"?(.+?)"?$/);
      if (tokens[idx].nesting === 1) {
        const type = m[1];
        const name = md.utils.escapeHtml(m[2]);
        return `<div class="slack-msg"><span class="sender ${type}">${name}</span> `;
      }
      return "</div>\n";
    },
  });

  // Syntax highlighting via Prism (build-time, adds token classes)
  md.use(markdownItPrism, { defaultLanguage: "plaintext" });

  // Mermaid: convert ```mermaid fenced blocks into <pre class="mermaid"> for client-side rendering
  const defaultFence = md.renderer.rules.fence || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.info.trim() === "mermaid") {
      return `<pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre>\n`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", md);

  // --- Passthrough copy ---
  eleventyConfig.addPassthroughCopy({ "src/_includes/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // --- Collections ---
  // "articles" tag is applied by src/articles/articles.json
  // Additional topic tags (ai, tools, etc.) create per-tag collections automatically

  // All unique tags (excluding "articles")
  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => {
        if (tag !== "articles") tagSet.add(tag);
      });
    });
    return [...tagSet].sort();
  });

  // Slug helper used by trail collections
  const slugifyTrail = (s) =>
    (s || "").toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");

  // Trails (object keyed by name): legacy shape consumed by article.njk for prev/next
  eleventyConfig.addCollection("trails", function (collectionApi) {
    const trails = {};
    collectionApi.getFilteredByTag("articles").forEach((item) => {
      const trail = item.data.trail;
      if (!trail) return;
      if (!trails[trail]) trails[trail] = [];
      trails[trail].push(item);
    });
    for (const name of Object.keys(trails)) {
      trails[name].sort((a, b) => (a.data.trailOrder || 0) - (b.data.trailOrder || 0));
    }
    return trails;
  });

  // trailList: array of trail objects with derived metadata, sorted by most-recent
  // article date descending. Used for /trails/, per-trail pages, and "Latest Trails"
  // on the trailhead.
  eleventyConfig.addCollection("trailList", function (collectionApi) {
    const trails = {};
    collectionApi.getFilteredByTag("articles").forEach((item) => {
      const trail = item.data.trail;
      if (!trail) return;
      if (!trails[trail]) trails[trail] = [];
      trails[trail].push(item);
    });
    const out = [];
    for (const name of Object.keys(trails)) {
      const articles = trails[name].sort(
        (a, b) => (a.data.trailOrder || 0) - (b.data.trailOrder || 0)
      );
      const descArticle = articles.find((a) => a.data.trailDescription);
      const totalDuration = articles.reduce(
        (s, a) => s + (a.data.duration || 0),
        0
      );
      const latestDate = articles.reduce((d, a) => {
        const ad = new Date(a.date);
        return ad > d ? ad : d;
      }, new Date(0));
      const audiences = [
        ...new Set(articles.flatMap((a) => a.data.audience || [])),
      ];
      const contributors = [
        ...new Set(
          articles
            .flatMap((a) => [a.data.submitter, ...(a.data.contributors || [])])
            .filter(Boolean)
        ),
      ];
      const tags = [
        ...new Set(
          articles.flatMap((a) =>
            (a.data.tags || []).filter((t) => t !== "articles")
          )
        ),
      ];
      out.push({
        name,
        slug: slugifyTrail(name),
        description: descArticle ? descArticle.data.trailDescription : "",
        articles,
        parts: articles.length,
        totalDuration,
        latestDate,
        latestDateISO: latestDate.toISOString(),
        audiences,
        contributors,
        tags,
      });
    }
    out.sort((a, b) => b.latestDate - a.latestDate);
    return out;
  });

  // --- Filters ---

  // Find related articles by slug list
  eleventyConfig.addFilter("findBySlug", function (collection, slug) {
    return collection.find((item) => item.fileSlug === slug);
  });
  // Tag display: uppercase short tags (ai, devops), title-case others
  const SHORT_TAGS = { ai: "AI", devops: "DevOps", api: "API", css: "CSS", ui: "UI", ux: "UX" };
  eleventyConfig.addFilter("tagDisplay", function (tag) {
    return SHORT_TAGS[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
  });

  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("slugify", function (str) {
    return (str || "").toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("isoDate", function (date) {
    return new Date(date).toISOString();
  });
};

module.exports.config = {
  dir: {
    input: "src",
    includes: "_includes",
    data: "_data",
    output: "_site",
  },
  pathPrefix: process.env.SITE_PATH_PREFIX || "/",
  templateFormats: ["md", "njk", "html"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
