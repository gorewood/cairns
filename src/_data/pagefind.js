const pkg = require("../../package.json");

function normalizeVersion(value) {
  return String(value || "").replace(/^[^\d]*/, "");
}

const version = normalizeVersion(
  pkg.devDependencies?.pagefind || pkg.dependencies?.pagefind || "1.5.2"
);

module.exports = {
  version,
  assetPath: `/pagefind-v${version}/`,
};
