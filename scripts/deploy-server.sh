#!/usr/bin/env bash
#
# Deploy the pre-built SSR server to a low-RAM Linux server.
#
# Downloads the latest build from GitHub Releases, extracts it to a
# timestamped release directory, installs production dependencies (for
# sharp's native binary), symlinks persistent data dirs, and updates
# the "current" symlink.
#
# Usage:
#   ./scripts/deploy-server.sh
#
# First-time setup (run once on the server):
#   mkdir -p ~/forever2006/data/.store ~/forever2006/data/uploads/people
#
# Environment variables (set in ~/.env.forever2006 or export before running):
#   NUXT_SITE_PASSWORD    - visitor login password (required)
#   NUXT_ADMIN_PASSWORD   - admin password for /admin (required)
#   PORT                  - listen port (default: 2006)
#   HOST                  - bind address (default: 0.0.0.0)
#
set -euo pipefail

# --- Config ---
REPO="fuyans/forever2006"
RELEASE_TAG="server-latest"
INSTALL_DIR="${HOME}/forever2006"
DATA_DIR="${INSTALL_DIR}/data"
RELEASES_DIR="${INSTALL_DIR}/releases"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${RELEASE_TAG}/forever2006-server.tar.gz"

# --- Load env file if present ---
ENV_FILE="${INSTALL_DIR}/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${PORT:=2006}"
: "${HOST:=0.0.0.0}"

echo "=== forever2006 server deploy ==="
echo "  Repo:      ${REPO}"
echo "  Release:   ${RELEASE_TAG}"
echo "  Install:   ${INSTALL_DIR}"
echo "  Port:      ${PORT}"
echo

# --- Sanity checks ---
if ! command -v node &>/dev/null; then
  echo "✗ Node.js is not installed. Install Node 22+ first." >&2
  exit 1
fi

if [[ -z "${NUXT_SITE_PASSWORD:-}" ]]; then
  echo "⚠ Warning: NUXT_SITE_PASSWORD is not set (default 'qiushi2026' will be used)."
  echo "  Set it in ${ENV_FILE} or export before running."
fi

# --- Prepare directories ---
mkdir -p "$RELEASES_DIR" "$DATA_DIR/.store" "$DATA_DIR/uploads"

# --- Download and extract ---
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TARGET_DIR="${RELEASES_DIR}/${TIMESTAMP}"
echo "→ Downloading latest build..."
mkdir -p "$TARGET_DIR"
curl -sL "$DOWNLOAD_URL" | tar xz -C "$TARGET_DIR"

# --- Install production dependencies (sharp native binary) ---
echo "→ Installing production dependencies..."
cd "$TARGET_DIR"
if command -v pnpm &>/dev/null; then
  pnpm install --prod
elif command -v npm &>/dev/null; then
  npm install --omit=dev
else
  echo "✗ No package manager (pnpm/npm) found." >&2
  exit 1
fi

# --- Symlink persistent data dirs ---
# These survive across redeployments: guestbook messages, people roster,
# and uploaded photos.
ln -sfn "$DATA_DIR/.store" "$TARGET_DIR/.store"
ln -sfn "$DATA_DIR/uploads" "$TARGET_DIR/public/uploads"

# --- Update current symlink ---
ln -sfn "$TARGET_DIR" "${INSTALL_DIR}/current"

echo
echo "✓ Deploy complete!"
echo
echo "  Release:  ${TARGET_DIR}"
echo "  Current:  ${INSTALL_DIR}/current → ${TARGET_DIR}"
echo
echo "=== To start the server: ==="
echo "  cd ${INSTALL_DIR}/current"
echo "  NUXT_SITE_PASSWORD=xxx NUXT_ADMIN_PASSWORD=xxx PORT=${PORT} HOST=${HOST} \\"
echo "    node .output/server/index.mjs"
echo
echo "  Or with pm2:"
echo "    pm2 start .output/server/index.mjs --name forever2006 \\"
echo "      --env NUXT_SITE_PASSWORD=xxx --env NUXT_ADMIN_PASSWORD=xxx"
echo
echo "  Or with systemd (recommended for production):"
echo "    See scripts/forever2006.service for a ready-to-use unit file."
echo
echo "=== Rollback (if needed): ==="
echo "  ln -sfn ${RELEASES_DIR}/<previous-timestamp> ${INSTALL_DIR}/current"
