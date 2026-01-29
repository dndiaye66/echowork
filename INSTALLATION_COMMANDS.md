# Installation Commands Reference for Nginx Deployment on Ubuntu 24.04

This document provides all the necessary commands to install and deploy EchoWork on Ubuntu 24.04 with Nginx.

## Table of Contents
- [Prerequisites](#prerequisites)
- [System Update](#system-update)
- [Install Node.js](#install-nodejs)
- [Install PostgreSQL](#install-postgresql)
- [Install Nginx](#install-nginx)
- [Configure Firewall](#configure-firewall)
- [Setup Database](#setup-database)
- [Clone Repository](#clone-repository)
- [Deploy Backend](#deploy-backend)
- [Deploy Frontend](#deploy-frontend)
- [Configure Nginx](#configure-nginx)
- [Setup Systemd Service](#setup-systemd-service)
- [Configure SSL (Optional)](#configure-ssl-optional)
- [Verify Installation](#verify-installation)

---

## Prerequisites

Ensure you have:
- Ubuntu 24.04 LTS
- Root or sudo access
- Basic knowledge of Linux commands

---

## System Update

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y build-essential curl wget git openssl net-tools
```

---

## Install Node.js

```bash
# Download and run Node.js 20.x setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

Expected output: Node v20.x.x and npm v10.x.x

---

## Install PostgreSQL

```bash
# Install PostgreSQL 16 and contrib packages
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

---

## Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx service
sudo systemctl start nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

## Configure Firewall

```bash
# Enable UFW firewall
sudo ufw --force enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check firewall status
sudo ufw status verbose
```

---

## Setup Database

```bash
# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE echowork_db;
CREATE USER echowork_user WITH ENCRYPTED PASSWORD 'your_secure_password_change_this';
GRANT ALL PRIVILEGES ON DATABASE echowork_db TO echowork_user;
ALTER DATABASE echowork_db OWNER TO echowork_user;
\c echowork_db
GRANT ALL ON SCHEMA public TO echowork_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO echowork_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO echowork_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO echowork_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO echowork_user;
\q
EOF
```

Configure PostgreSQL for password authentication:
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Find and change this line:
# local   all             all                                     peer
# To:
# local   all             all                                     md5

# Save and exit (Ctrl+X, Y, Enter)

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/echowork
sudo mkdir -p /var/log/echowork

# Set ownership to current user
sudo chown -R $USER:$USER /var/www/echowork
sudo chown -R www-data:www-data /var/log/echowork

# Clone repository
cd /var/www
git clone https://github.com/dndiaye66/echowork.git echowork

# Navigate to project directory
cd echowork
```

---

## Deploy Backend

```bash
# Navigate to backend directory
cd /var/www/echowork/backend

# Install dependencies
npm install --production=false

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://echowork_user:your_secure_password_change_this@localhost:5432/echowork_db?schema=public"
PORT=3000
FRONTEND_URL=http://localhost
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production

# Email configuration (optional - update with your SMTP details)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="EchoWork <noreply@echowork.com>"
EOF

# Secure the .env file
chmod 600 .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate deploy

# Seed database with sample data (optional)
npm run prisma:seed

# Build the backend
npm run build

# Install production dependencies only
npm ci --only=production
```

---

## Deploy Frontend

```bash
# Navigate to project root
cd /var/www/echowork

# Create frontend .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost/api
EOF

# Install frontend dependencies
npm install

# Build frontend for production
npm run build

# Create public HTML directory
sudo mkdir -p /var/www/echowork/public_html

# Copy built files to web root
sudo cp -r dist/* /var/www/echowork/public_html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/echowork/public_html
sudo chmod -R 755 /var/www/echowork/public_html
```

---

## Configure Nginx

```bash
# Copy nginx configuration file
sudo cp /var/www/echowork/nginx.conf /etc/nginx/sites-available/echowork

# Update domain in config (replace 'localhost' with your domain)
sudo sed -i 's/your-domain.com/localhost/g' /etc/nginx/sites-available/echowork

# Update root path
sudo sed -i 's|root /var/www/echowork;|root /var/www/echowork/public_html;|g' /etc/nginx/sites-available/echowork

# Test Nginx configuration
sudo nginx -t

# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/echowork /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

---

## Setup Systemd Service

```bash
# Copy systemd service file
sudo cp /var/www/echowork/echowork-backend.service /etc/systemd/system/

# Reload systemd daemon
sudo systemctl daemon-reload

# Start backend service
sudo systemctl start echowork-backend

# Enable service to start on boot
sudo systemctl enable echowork-backend

# Check service status
sudo systemctl status echowork-backend

# View service logs
sudo journalctl -u echowork-backend -f
```

---

## Configure SSL (Optional)

Only proceed if you have a domain name pointed to your server.

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain and email)
sudo certbot --nginx \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Update frontend for HTTPS
cd /var/www/echowork
cat > .env << 'EOF'
VITE_API_URL=https://your-domain.com/api
EOF

# Rebuild frontend
npm run build
sudo cp -r dist/* /var/www/echowork/public_html/

# Update backend for HTTPS
cd /var/www/echowork/backend
sudo nano .env
# Change FRONTEND_URL=http://localhost to FRONTEND_URL=https://your-domain.com

# Restart backend service
sudo systemctl restart echowork-backend

# Test automatic SSL renewal
sudo certbot renew --dry-run
```

---

## Verify Installation

```bash
# Check backend API (direct)
curl http://localhost:3000/api/categories

# Check backend API (via Nginx)
curl http://localhost/api/categories

# Check frontend
curl http://localhost

# Check all services status
sudo systemctl status echowork-backend
sudo systemctl status nginx
sudo systemctl status postgresql

# Run health check script
sudo bash /var/www/echowork/scripts/health-check.sh
```

---

## Post-Installation

### Access Your Application

- **Frontend**: http://localhost or http://your-domain.com
- **Backend API**: http://localhost/api or http://your-domain.com/api

### Management Commands

```bash
# Backend service
sudo systemctl status echowork-backend      # Check status
sudo systemctl restart echowork-backend     # Restart
sudo systemctl stop echowork-backend        # Stop
sudo journalctl -u echowork-backend -f      # View logs

# Nginx
sudo systemctl status nginx                 # Check status
sudo systemctl reload nginx                 # Reload config
sudo systemctl restart nginx                # Restart
sudo nginx -t                              # Test config
sudo tail -f /var/log/nginx/error.log      # View error logs

# PostgreSQL
sudo systemctl status postgresql            # Check status
sudo -u postgres psql -d echowork_db       # Connect to database
```

### Regular Maintenance

```bash
# Backup database
sudo bash /var/www/echowork/scripts/backup-database.sh

# Check system health
sudo bash /var/www/echowork/scripts/health-check.sh

# Update application
sudo bash /var/www/echowork/scripts/update.sh
```

---

## Troubleshooting Commands

### Backend Issues
```bash
# Check backend logs
sudo journalctl -u echowork-backend -n 100
sudo tail -f /var/log/echowork/backend-error.log

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart backend
sudo systemctl restart echowork-backend
```

### Nginx Issues
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart nginx
sudo systemctl restart nginx
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -d echowork_db -c "SELECT version();"

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Permission Issues
```bash
# Fix backend permissions
sudo chown -R www-data:www-data /var/www/echowork/backend
sudo chmod -R 755 /var/www/echowork/backend

# Fix frontend permissions
sudo chown -R www-data:www-data /var/www/echowork/public_html
sudo chmod -R 755 /var/www/echowork/public_html
```

---

## Alternative: Automated Installation

Instead of running all commands manually, use the automated script:

```bash
cd /var/www/echowork
sudo bash deploy.sh
```

Or use Docker deployment:

```bash
cd /var/www/echowork
cp .env.prod.example .env.prod
# Edit .env.prod with your settings
nano .env.prod

bash deploy-docker.sh
```

---

## Support

For more detailed information:
- [DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md) - Complete deployment guide
- [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) - Quick start guide
- [README.md](README.md) - Application overview
- [scripts/README.md](scripts/README.md) - Management scripts documentation

---

**Note**: Replace placeholder values like `your_secure_password_change_this`, `your-domain.com`, and email addresses with your actual values.
