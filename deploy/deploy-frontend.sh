#!/bin/bash
#
# Drawback Frontend Deployment Script
# Run this script to deploy frontend updates
#
# Usage: ./deploy/deploy-frontend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

ensure_git_upstream() {
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD)
    if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} &>/dev/null; then
        log_warn "No upstream set for $branch. Setting to origin/$branch"
        git branch --set-upstream-to="origin/$branch" "$branch"
    fi
}

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
FRONTEND_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
FRONTEND_DIR="$FRONTEND_ROOT"

log_info "=== Drawback Frontend Deployment ==="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    log_error "Install via NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash"
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    log_error "Yarn is not installed"
    log_error "Install via: npm install -g yarn"
    exit 1
fi

log_info "Node: $(node --version)"
log_info "Yarn: $(yarn --version)"

echo ""
log_info "=== Deploying Frontend ==="

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Pull latest code
log_info "Pulling latest frontend code from repository..."
ensure_git_upstream
git pull --ff-only origin "$(git rev-parse --abbrev-ref HEAD)"

# Install dependencies
log_info "Installing frontend dependencies..."
yarn install

# Build application
log_info "Building frontend application..."
yarn build

# Copy frontend app to web root
# NOTE: One-time setup required on the server:
#   sudo chown -R $(whoami):www-data /var/www/html
#   sudo chmod -R 775 /var/www/html
log_info "Copying frontend app to web root..."
rm -rf /var/www/html/*
mkdir -p /var/www/html
cp -r dist/* /var/www/html/

log_info "Frontend deployment complete"
echo ""
log_info "Frontend app is available at:"
echo "  http://your-domain.com/"
echo ""
log_warn "If routes like /confirm return 404 in production, enable SPA fallback in your web server:"
echo "  location / {"
echo "    try_files \$uri \$uri/ /index.html;"
echo "  }"
echo ""
log_info "Nginx reference config: deploy/nginx/drawback.chat.conf"
echo ""

log_info "=== Deployment Complete ==="
