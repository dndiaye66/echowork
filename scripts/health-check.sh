#!/bin/bash

# Health check script for EchoWork services
# Run this to check if all services are running properly

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================"
echo "EchoWork Health Check"
echo "================================"
echo ""

# Function to check service
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✓${NC} $name is running"
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT running"
        return 1
    fi
}

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    if curl -sf "$url" > /dev/null; then
        echo -e "${GREEN}✓${NC} $name is accessible ($url)"
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT accessible ($url)"
        return 1
    fi
}

# Function to check port
check_port() {
    local port=$1
    local name=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo -e "${GREEN}✓${NC} $name is listening on port $port"
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT listening on port $port"
        return 1
    fi
}

ERRORS=0

# Check Backend Service
echo "Checking Backend Service..."
if ! check_service "echowork-backend" "EchoWork Backend"; then
    ((ERRORS++))
    echo "  Try: sudo systemctl start echowork-backend"
fi
echo ""

# Check Nginx Service
echo "Checking Nginx Service..."
if ! check_service "nginx" "Nginx Web Server"; then
    ((ERRORS++))
    echo "  Try: sudo systemctl start nginx"
fi
echo ""

# Check PostgreSQL Service
echo "Checking PostgreSQL Service..."
if ! check_service "postgresql" "PostgreSQL Database"; then
    ((ERRORS++))
    echo "  Try: sudo systemctl start postgresql"
fi
echo ""

# Check Backend Port
echo "Checking Backend Port..."
if ! check_port "3000" "Backend API"; then
    ((ERRORS++))
    echo "  Backend might not be running properly"
fi
echo ""

# Check Nginx Ports
echo "Checking Nginx Ports..."
check_port "80" "Nginx HTTP"
check_port "443" "Nginx HTTPS" || echo -e "${YELLOW}  Note: HTTPS not configured (optional)${NC}"
echo ""

# Check Backend API Endpoint
echo "Checking API Endpoints..."
if ! check_url "http://localhost:3000/api/categories" "Backend API (direct)"; then
    ((ERRORS++))
fi

if ! check_url "http://localhost/api/categories" "Backend API (via Nginx)"; then
    ((ERRORS++))
fi
echo ""

# Check Frontend
echo "Checking Frontend..."
if ! check_url "http://localhost" "Frontend (via Nginx)"; then
    ((ERRORS++))
fi
echo ""

# Check Disk Space
echo "Checking Disk Space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${RED}✗${NC} Disk usage is high: ${DISK_USAGE}%"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} Disk usage is OK: ${DISK_USAGE}%"
fi
echo ""

# Check Memory
echo "Checking Memory..."
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEM_USAGE" -gt 90 ]; then
    echo -e "${YELLOW}⚠${NC} Memory usage is high: ${MEM_USAGE}%"
else
    echo -e "${GREEN}✓${NC} Memory usage is OK: ${MEM_USAGE}%"
fi
echo ""

# Summary
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo "Your EchoWork application is running properly."
else
    echo -e "${RED}Found $ERRORS issue(s)${NC}"
    echo "Please review the errors above and fix them."
    echo ""
    echo "Useful commands:"
    echo "  sudo systemctl status echowork-backend"
    echo "  sudo systemctl status nginx"
    echo "  sudo journalctl -u echowork-backend -n 50"
    echo "  sudo tail -f /var/log/nginx/error.log"
fi
echo "================================"

exit $ERRORS
