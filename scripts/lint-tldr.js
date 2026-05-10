#!/usr/bin/env node
/**
 * lint-tldr.js
 *
 * Structural lint for TL;DR blocks. Runs as `prebuild` so the build fails
 * fast on divergence between Full and TL;DR views. Specifically checks:
 *
 *   1. H2 parity — TL;DR h2 titles must prefix-match Full's h2 titles
 *      (same titles, same order). The TL;DR may stop before Full's last
 *      few h2s (typically "Summary"), but no h2 may diverge or reorder.
 *
 *   2. Forbidden elements inside :::: tldr blocks — summary-list,
 *      discussion-prompts, scenarios, sidenotes, mermaid. The spec drops
 *      all of these.
 *
 *   3. Heuristic coverage — warns when a cairn is missing a TL;DR despite
 *      duration >= 12 OR being in a trail (trail consistency).
 *
 *   4. Fence structure — exactly zero or one :::: tldr block; balanced
 *      open/close.
 *
 * Errors fail the build. Warnings print but allow the build to proceed.
 *
 * Usage: node scripts/lint-tldr.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ARTICLES_ROOT = path.join(__dirname, '..', 'src', 'articles');

function* walkMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(full);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield full;
  }
}

function parseFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { frontmatter: {}, bodyOffset: 0 };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { frontmatter: fm, bodyOffset: m[0].length };
}

function extractTldrBlock(body) {
  // Match the outer :::: tldr fence and its contents. Allow only one block.
  const opens = [...body.matchAll(/^:::: tldr\s*$/gm)];
  const closes = [...body.matchAll(/^::::\s*$/gm)];
  if (opens.length === 0) return { tldr: null, errors: [] };
  if (opens.length > 1) {
    return { tldr: null, errors: [`multiple :::: tldr blocks (found ${opens.length})`] };
  }
  if (closes.length !== opens.length) {
    return { tldr: null, errors: [`unbalanced :::: fences (${opens.length} open, ${closes.length} close)`] };
  }
  const open = opens[0];
  const close = closes.find((c) => c.index > open.index);
  if (!close) {
    return { tldr: null, errors: ['unclosed :::: tldr block'] };
  }
  const inner = body.slice(open.index + open[0].length, close.index).trim();
  return { tldr: inner, errors: [] };
}

function extractH2s(text) {
  // Match h2 lines (## title). Skip h2s that appear inside fenced code blocks
  // or HTML — for the markdown-source level lint this is a reasonable
  // approximation since h2 titles are always at column 0 outside code.
  const h2s = [];
  let inCode = false;
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const m = line.match(/^## (.+)$/);
    if (m) h2s.push(m[1].trim());
  }
  return h2s;
}

function stripTldrFromBody(body) {
  return body.replace(/^:::: tldr\s*\n[\s\S]*?\n::::\s*$/m, '').trim();
}

function checkH2Parity(tldr, full) {
  const tldrH2s = extractH2s(tldr);
  const fullH2s = extractH2s(full);
  const errors = [];
  for (let i = 0; i < tldrH2s.length; i++) {
    if (tldrH2s[i] !== fullH2s[i]) {
      errors.push(
        `h2 mismatch at position ${i + 1}: TL;DR has "${tldrH2s[i]}", ` +
        `Full has "${fullH2s[i] || '(none)'}"`
      );
      break; // one mismatch is enough to flag
    }
  }
  return errors;
}

const FORBIDDEN_PATTERNS = [
  { pattern: /<ol class="summary-list">/, label: '<ol class="summary-list">' },
  { pattern: /<ul class="discussion-prompts">/, label: '<ul class="discussion-prompts">' },
  { pattern: /<div class="scenario">/, label: '<div class="scenario"> (use Full only)' },
  { pattern: /^::: scenario\s/m, label: '::: scenario fence (use Full only)' },
  { pattern: /<label for="sn-\d/, label: 'sidenote markup (use Full only)' },
  { pattern: /^```mermaid/m, label: 'mermaid block (use Full only)' },
];

function checkForbidden(tldr) {
  const errors = [];
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(tldr)) errors.push(`forbidden in TL;DR: ${label}`);
  }
  return errors;
}

function lintFile(filePath) {
  const rel = path.relative(path.join(__dirname, '..'), filePath);
  const source = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, bodyOffset } = parseFrontmatter(source);
  const body = source.slice(bodyOffset);

  const duration = parseInt(frontmatter.duration || '0', 10);
  const inTrail = !!frontmatter.trail;

  const { tldr, errors: fenceErrors } = extractTldrBlock(body);
  const errors = [...fenceErrors];
  const warnings = [];

  if (!tldr) {
    if (duration >= 12 || inTrail) {
      warnings.push(`missing TL;DR (duration=${duration}, trail=${inTrail})`);
    }
    return { rel, errors, warnings };
  }

  const fullBody = stripTldrFromBody(body);
  errors.push(...checkH2Parity(tldr, fullBody));
  errors.push(...checkForbidden(tldr));

  return { rel, errors, warnings };
}

function main() {
  if (!fs.existsSync(ARTICLES_ROOT)) {
    console.error(`articles root not found: ${ARTICLES_ROOT}`);
    process.exit(2);
  }

  const results = [];
  for (const file of walkMarkdown(ARTICLES_ROOT)) {
    results.push(lintFile(file));
  }

  let errorCount = 0;
  let warningCount = 0;
  for (const r of results) {
    if (r.errors.length === 0 && r.warnings.length === 0) continue;
    console.log(r.rel);
    for (const e of r.errors) {
      console.log(`  error: ${e}`);
      errorCount++;
    }
    for (const w of r.warnings) {
      console.log(`  warn:  ${w}`);
      warningCount++;
    }
  }

  const total = results.length;
  console.log('');
  console.log(`tldr-lint: ${total} cairns scanned, ${errorCount} error(s), ${warningCount} warning(s)`);
  if (errorCount > 0) process.exit(1);
}

main();
