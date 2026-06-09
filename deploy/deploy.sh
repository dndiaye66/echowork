#!/bin/bash
# =============================================================
# EchoWork — Deployment Script
# Run on the server: bash deploy.sh
# Assumes code is already uploaded to /var/www/echowork/
# =============================================================
set -e

APP_DIR="/var/www/echowork"
FRONTEND_DIR="${APP_DIR}"
BACKEND_DIR="${APP_DIR}/backend"
NGINX_CONF="/etc/nginx/sites-available/echowork"

echo "======================================"
echo " EchoWork — Deploying..."
echo "======================================"

# ── Frontend ──────────────────────────────────────────────────
echo "[1/7] Installing frontend dependencies..."
cd ${FRONTEND_DIR}
npm install

echo "[2/7] Building frontend..."
npm run build
echo "       → dist/ generated at ${FRONTEND_DIR}/dist"

# ── Backend ──────────────────────────────────────────────────
echo "[3/7] Installing backend dependencies..."
cd ${BACKEND_DIR}
npm install --omit=dev

echo "[4/7] Running Prisma migrations..."
npx prisma migrate deploy
# Uncomment below to re-seed (only on first deploy):
# npx prisma db seed

echo "[5/7] Building backend..."
npm run build

echo "[6/7] (Re)starting backend with PM2..."
if pm2 list | grep -q "echowork-api"; then
    pm2 reload echowork-api
else
    pm2 start ${APP_DIR}/deploy/ecosystem.config.cjs
fi
pm2 save

# ── Nginx (production config) ─────────────────────────────────
echo "[7/7] Updating Nginx config..."
cp ${APP_DIR}/deploy/nginx-echowork.conf ${NGINX_CONF}
nginx -t && systemctl reload nginx

echo ""
echo "======================================"
echo " Deployment complete!"
echo " Backend : pm2 logs echowork-api"
echo " Site    : https://www.echowork.net"
echo "======================================"
