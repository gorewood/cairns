#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pkg = require(path.join(repoRoot, "package.json"));

function normalizeVersion(value) {
  return String(value || "").replace(/^[^\d]*/, "");
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

const version = normalizeVersion(
  pkg.devDependencies?.pagefind || pkg.dependencies?.pagefind || "1.5.2"
);
const siteRoot = path.join(repoRoot, "_site");
const sourceDir = path.join(siteRoot, "pagefind");
const versionedDir = path.join(siteRoot, `pagefind-v${version}`);

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Missing Pagefind output at ${sourceDir}`);
}

copyDir(sourceDir, versionedDir);
console.log(`Copied Pagefind assets to ${path.relative(repoRoot, versionedDir)}`);
