# Cairns — agent-powered knowledge trail system

# ── Combined Build (for deployment) ──

# Build both sites and combine for Pages deployment
deploy-build:
    npm run build
    cd site && npm run build
    rm -rf _combined
    mkdir -p _combined
    cp -r _site/* _combined/
    cp -r site/_site/* _combined/

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
    rm -rf _site _combined site/_site
