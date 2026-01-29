# EchoWork Deployment Guide for Nginx on Ubuntu 24.04

This guide provides step-by-step instructions to deploy the EchoWork application using Nginx on Ubuntu 24.04 LTS.

## Table of Contents
- [Prerequisites](#prerequisites)
- [System Setup](#system-setup)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Nginx Configuration](#nginx-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Ubuntu 24.04 LTS server
- Root or sudo access
- Domain name pointed to your server (optional but recommended for SSL)
- At least 2GB RAM and 20GB disk space

## System Setup

### 1. Update System Packages

```bash
# Update package list and upgrade installed packages
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install -y build-essential curl wget git
```

### 2. Install Node.js 20.x LTS

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

### 3. Install PostgreSQL 16

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

### 4. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx service
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### 5. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check firewall status
sudo ufw status
```

## Database Setup

### 1. Create PostgreSQL Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE echowork_db;
CREATE USER echowork_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE echowork_db TO echowork_user;
ALTER DATABASE echowork_db OWNER TO echowork_user;

# Grant schema privileges (PostgreSQL 15+)
\c echowork_db
GRANT ALL ON SCHEMA public TO echowork_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO echowork_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO echowork_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO echowork_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO echowork_user;

# Exit PostgreSQL
\q
```

### 2. Configure PostgreSQL for Local Connections

Edit PostgreSQL configuration to allow password authentication:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Find the line:
# local   all             all                                     peer

# Change it to:
# local   all             all                                     md5

# Save and exit (Ctrl+X, Y, Enter)

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Backend Deployment

### 1. Create Application Directory

```bash
# Create directory structure
sudo mkdir -p /var/www/echowork/backend
sudo mkdir -p /var/log/echowork

# Set ownership
sudo chown -R $USER:$USER /var/www/echowork
sudo chown -R www-data:www-data /var/log/echowork
```

### 2. Clone and Build Backend

```bash
# Clone repository
cd /var/www/echowork
git clone https://github.com/dndiaye66/echowork.git temp
mv temp/backend/* backend/
mv temp/backend/.* backend/ 2>/dev/null || true
rm -rf temp

# Install dependencies
cd /var/www/echowork/backend
npm install --production=false

# Create production environment file
cat > .env << EOF
DATABASE_URL="postgresql://echowork_user:your_secure_password_here@localhost:5432/echowork_db?schema=public"
PORT=3000
FRONTEND_URL=http://your-domain.com
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production

# Email configuration (optional)
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

# Seed database with companies (optional)
npm run prisma:seed

# Build the application
npm run build

# Install production dependencies only
npm ci --only=production
```

### 3. Create Backend Systemd Service

```bash
# Copy service file
sudo cp /var/www/echowork/backend/../echowork-backend.service /etc/systemd/system/

# Or create it manually:
sudo nano /etc/systemd/system/echowork-backend.service
# Paste the content from echowork-backend.service file

# Reload systemd
sudo systemctl daemon-reload

# Start the backend service
sudo systemctl start echowork-backend

# Enable service to start on boot
sudo systemctl enable echowork-backend

# Check service status
sudo systemctl status echowork-backend

# View logs
sudo journalctl -u echowork-backend -f
```

## Frontend Deployment

### 1. Build Frontend

```bash
# Navigate to project root
cd /var/www/echowork

# Clone frontend files if not already done
git clone https://github.com/dndiaye66/echowork.git temp
cp -r temp/src .
cp -r temp/public .
cp temp/package*.json .
cp temp/vite.config.js .
cp temp/index.html .
cp temp/postcss.config.mjs .
cp temp/.env.example .
rm -rf temp

# Create production environment file
cat > .env << EOF
VITE_API_URL=http://your-domain.com/api
EOF

# Install dependencies
npm install

# Build for production
npm run build

# Copy built files to web root
sudo mkdir -p /var/www/echowork/public_html
sudo cp -r dist/* /var/www/echowork/public_html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/echowork/public_html
sudo chmod -R 755 /var/www/echowork/public_html
```

## Nginx Configuration

### 1. Configure Nginx Site

```bash
# Copy nginx configuration
sudo cp /var/www/echowork/nginx.conf /etc/nginx/sites-available/echowork

# Or create it manually:
sudo nano /etc/nginx/sites-available/echowork
# Paste the content from nginx.conf file

# Update the configuration with your domain
sudo sed -i 's/your-domain.com/actual-domain.com/g' /etc/nginx/sites-available/echowork

# Update the root path
sudo sed -i 's|root /var/www/echowork;|root /var/www/echowork/public_html;|g' /etc/nginx/sites-available/echowork

# Test nginx configuration
sudo nginx -t

# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/echowork /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Reload Nginx
sudo systemctl reload nginx
```

### 2. Verify Deployment

```bash
# Check if backend is running
curl http://localhost:3000/api/categories

# Check if frontend is accessible
curl http://localhost

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain and email)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --no-eff-email

# Certbot will automatically configure Nginx for HTTPS
# Test automatic renewal
sudo certbot renew --dry-run
```

### 3. Update Frontend Environment for HTTPS

```bash
# Update frontend .env for HTTPS
cd /var/www/echowork
cat > .env << EOF
VITE_API_URL=https://your-domain.com/api
EOF

# Rebuild frontend
npm run build
sudo cp -r dist/* /var/www/echowork/public_html/

# Update backend .env for HTTPS
cd /var/www/echowork/backend
sudo nano .env
# Change FRONTEND_URL to https://your-domain.com

# Restart backend service
sudo systemctl restart echowork-backend
```

## Monitoring and Maintenance

### Backend Service Management

```bash
# Check backend status
sudo systemctl status echowork-backend

# View backend logs
sudo journalctl -u echowork-backend -n 100
sudo tail -f /var/log/echowork/backend.log

# Restart backend
sudo systemctl restart echowork-backend

# Stop backend
sudo systemctl stop echowork-backend
```

### Nginx Management

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload Nginx (for config changes)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Maintenance

```bash
# Backup database
sudo -u postgres pg_dump echowork_db > /var/backups/echowork_db_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql echowork_db < /var/backups/echowork_db_20240129.sql

# Vacuum database (maintenance)
sudo -u postgres psql -d echowork_db -c "VACUUM ANALYZE;"
```

### Application Updates

```bash
# Pull latest changes
cd /var/www/echowork
git pull origin main

# Update backend
cd backend
npm install
npm run build
sudo systemctl restart echowork-backend

# Update frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/echowork/public_html/
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u echowork-backend -n 50
sudo tail -f /var/log/echowork/backend-error.log

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Check database connection
sudo -u postgres psql -d echowork_db -c "SELECT version();"

# Verify .env file
cd /var/www/echowork/backend
cat .env
```

### Nginx Errors

```bash
# Test configuration syntax
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check if Nginx is running
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -d echowork_db

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Verify pg_hba.conf settings
sudo cat /etc/postgresql/16/main/pg_hba.conf | grep -v "^#"
```

### Permission Issues

```bash
# Fix backend permissions
sudo chown -R www-data:www-data /var/www/echowork/backend
sudo chmod -R 755 /var/www/echowork/backend

# Fix frontend permissions
sudo chown -R www-data:www-data /var/www/echowork/public_html
sudo chmod -R 755 /var/www/echowork/public_html

# Fix log permissions
sudo chown -R www-data:www-data /var/log/echowork
sudo chmod -R 755 /var/log/echowork
```

### API Not Responding

```bash
# Check if backend is running
curl http://localhost:3000/api/categories

# Check backend service
sudo systemctl status echowork-backend

# Check Nginx proxy configuration
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/echowork | grep -A 20 "location /api/"

# Test direct backend connection
curl -v http://localhost:3000/api/categories
```

## Security Best Practices

1. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Firewall Configuration**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Secure .env Files**
   ```bash
   chmod 600 /var/www/echowork/backend/.env
   ```

4. **Database Backups**
   ```bash
   # Create automated backup script
   sudo nano /usr/local/bin/backup-echowork-db.sh
   ```

5. **Monitor Logs**
   ```bash
   sudo logrotate -f /etc/logrotate.d/nginx
   ```

## Performance Optimization

### 1. Enable Gzip Compression

Already configured in nginx.conf, but verify:

```bash
sudo nano /etc/nginx/nginx.conf
# Ensure gzip is on
```

### 2. Configure PM2 for Backend (Alternative to Systemd)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend with PM2
cd /var/www/echowork/backend
pm2 start dist/main.js --name echowork-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

### 3. Database Connection Pooling

Already configured in Prisma, but you can optimize in `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Conclusion

Your EchoWork application is now deployed on Ubuntu 24.04 with Nginx! 

- **Frontend**: Accessible at http://your-domain.com or https://your-domain.com (with SSL)
- **Backend API**: Accessible at http://your-domain.com/api or https://your-domain.com/api
- **Database**: PostgreSQL running locally

For additional support, refer to:
- [README.md](README.md) - General application documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [SECURITY.md](SECURITY.md) - Security best practices
