const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItContainer = require("markdown-it-container");

module.exports = function (eleventyConfig) {
  // --- Markdown-it with custom containers ---
  const md = markdownIt({ html: true, linkify: true, typographer: true });

  // Heading anchors (auto-generates IDs for TOC)
  md.use(markdownItAnchor, {
    slugify: (s) =>
      s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
    permalink: false,
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

  // ```mermaid fenced blocks → <pre class="mermaid">
  const defaultFence = md.renderer.rules.fence;
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

  // Trails: group articles by trail name, sorted by trailOrder
  eleventyConfig.addCollection("trails", function (collectionApi) {
    const trails = {};
    collectionApi.getFilteredByTag("articles").forEach((item) => {
      const trail = item.data.trail;
      if (!trail) return;
      if (!trails[trail]) trails[trail] = [];
      trails[trail].push(item);
    });
    // Sort each trail by order
    for (const name of Object.keys(trails)) {
      trails[name].sort((a, b) => (a.data.trailOrder || 0) - (b.data.trailOrder || 0));
    }
    return trails;
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
  templateFormats: ["md", "njk", "html"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
