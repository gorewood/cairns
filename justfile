# Cairns — agent-powered knowledge trail system

# ── Marketing Site ──

# Preview marketing site locally
site-serve:
    cd site && npm run serve

# Build marketing site
site-build:
    cd site && npm run build

# ── Content Site (Eleventy) ──

# Build content site + Pagefind index
build:
    npm run build

# Dev server with live reload
serve:
    npm run serve

# Clean build output
clean:
    npm run clean
