#!/bin/bash

# Update script for EchoWork application
# Run this to update the application to the latest version

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}EchoWork Update Script${NC}"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo bash scripts/update.sh"
    exit 1
fi

# Configuration
APP_DIR="/var/www/echowork"
BACKUP_DIR="/var/backups/echowork"

# Get current user (the one who ran sudo)
CURRENT_USER="${SUDO_USER:-$USER}"

echo "This script will:"
echo "1. Backup current installation"
echo "2. Pull latest changes from git"
echo "3. Update dependencies"
echo "4. Rebuild application"
echo "5. Restart services"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo "Step 1: Creating backup..."
# Backup current version
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/echowork_backup_${TIMESTAMP}.tar.gz" -C /var/www echowork 2>/dev/null || true
echo -e "${GREEN}✓${NC} Backup created"

echo ""
echo "Step 2: Pulling latest changes..."
cd "$APP_DIR"
sudo -u "$CURRENT_USER" git pull origin main
echo -e "${GREEN}✓${NC} Code updated"

echo ""
echo "Step 3: Updating backend..."
cd "$APP_DIR/backend"
sudo -u "$CURRENT_USER" npm install
sudo -u "$CURRENT_USER" npm run prisma:generate
npx prisma migrate deploy
sudo -u "$CURRENT_USER" npm run build
npm ci --only=production
echo -e "${GREEN}✓${NC} Backend updated"

echo ""
echo "Step 4: Updating frontend..."
cd "$APP_DIR"
sudo -u "$CURRENT_USER" npm install
sudo -u "$CURRENT_USER" npm run build
cp -r dist/* /var/www/echowork/public_html/
chown -R www-data:www-data /var/www/echowork/public_html
echo -e "${GREEN}✓${NC} Frontend updated"

echo ""
echo "Step 5: Restarting services..."
systemctl restart echowork-backend
systemctl reload nginx
echo -e "${GREEN}✓${NC} Services restarted"

echo ""
echo "Step 6: Verifying services..."
sleep 3

if systemctl is-active --quiet echowork-backend; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${YELLOW}⚠${NC} Backend might not be running properly"
    echo "Check logs: sudo journalctl -u echowork-backend -n 50"
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx is running"
else
    echo -e "${YELLOW}⚠${NC} Nginx might not be running properly"
    echo "Check logs: sudo tail -f /var/log/nginx/error.log"
fi

echo ""
echo "================================"
echo -e "${GREEN}Update completed!${NC}"
echo ""
echo "Run health check: sudo bash scripts/health-check.sh"
echo "View logs: sudo journalctl -u echowork-backend -f"
echo "================================"
