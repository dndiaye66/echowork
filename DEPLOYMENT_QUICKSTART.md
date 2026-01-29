# Quick Deployment Guide for Nginx on Ubuntu 24.04

This is a condensed guide for deploying EchoWork with Nginx on Ubuntu 24.04. For detailed instructions, see [DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md).

## Prerequisites

- Ubuntu 24.04 LTS server with sudo access
- Domain name (optional, but recommended for production)

## Option 1: Automated Deployment Script (Recommended)

### Single Command Deployment

```bash
# Clone the repository
git clone https://github.com/dndiaye66/echowork.git
cd echowork

# Run the automated deployment script
sudo bash deploy.sh
```

The script will:
- Install Node.js, PostgreSQL, and Nginx
- Setup database and configure services
- Deploy backend and frontend
- Configure Nginx as reverse proxy
- Optionally setup SSL with Let's Encrypt

## Option 2: Docker Deployment

### Prerequisites
- Docker and Docker Compose installed

### Quick Start

```bash
# Clone the repository
git clone https://github.com/dndiaye66/echowork.git
cd echowork

# Create environment file
cp .env.prod.example .env.prod
nano .env.prod  # Edit with your configuration

# Run deployment script
bash deploy-docker.sh
```

Access the application at http://localhost

## Option 3: Manual Deployment

### 1. Install Dependencies (5 minutes)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install build tools
sudo apt install -y build-essential git
```

### 2. Setup Database (2 minutes)

```bash
# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE echowork_db;
CREATE USER echowork_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE echowork_db TO echowork_user;
ALTER DATABASE echowork_db OWNER TO echowork_user;
\c echowork_db
GRANT ALL ON SCHEMA public TO echowork_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO echowork_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO echowork_user;
\q
EOF
```

### 3. Deploy Backend (5 minutes)

```bash
# Create directories
sudo mkdir -p /var/www/echowork/backend
sudo mkdir -p /var/log/echowork
sudo chown -R $USER:$USER /var/www/echowork

# Clone repository
git clone https://github.com/dndiaye66/echowork.git /var/www/echowork/temp
cp -r /var/www/echowork/temp/backend/* /var/www/echowork/backend/
rm -rf /var/www/echowork/temp

# Configure and build backend
cd /var/www/echowork/backend
npm install

# Create .env file
cat > .env <<EOF
DATABASE_URL="postgresql://echowork_user:your_secure_password@localhost:5432/echowork_db?schema=public"
PORT=3000
FRONTEND_URL=http://your-domain.com
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Setup database
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed  # Optional: seed with sample data

# Build backend
npm run build
npm ci --only=production
```

### 4. Deploy Frontend (3 minutes)

```bash
# Copy frontend files
cd /var/www/echowork
git clone https://github.com/dndiaye66/echowork.git temp
cp -r temp/src temp/public temp/package*.json temp/*.config.* temp/index.html .
rm -rf temp

# Configure frontend
cat > .env <<EOF
VITE_API_URL=http://your-domain.com/api
EOF

# Build frontend
npm install
npm run build

# Copy to web root
sudo mkdir -p /var/www/echowork/public_html
sudo cp -r dist/* /var/www/echowork/public_html/
sudo chown -R www-data:www-data /var/www/echowork/public_html
```

### 5. Configure Nginx (2 minutes)

```bash
# Copy nginx configuration
sudo cp /var/www/echowork/nginx.conf /etc/nginx/sites-available/echowork

# Update domain in config
sudo sed -i 's/your-domain.com/actual-domain.com/g' /etc/nginx/sites-available/echowork
sudo sed -i 's|root /var/www/echowork;|root /var/www/echowork/public_html;|g' /etc/nginx/sites-available/echowork

# Enable site
sudo ln -s /etc/nginx/sites-available/echowork /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup Backend Service (2 minutes)

```bash
# Copy systemd service file
sudo cp /var/www/echowork/echowork-backend.service /etc/systemd/system/

# Start service
sudo systemctl daemon-reload
sudo systemctl start echowork-backend
sudo systemctl enable echowork-backend

# Check status
sudo systemctl status echowork-backend
```

### 7. Setup SSL (Optional, 3 minutes)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Update frontend for HTTPS
cd /var/www/echowork
echo "VITE_API_URL=https://your-domain.com/api" > .env
npm run build
sudo cp -r dist/* /var/www/echowork/public_html/

# Update backend for HTTPS
cd /var/www/echowork/backend
sudo sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://your-domain.com|g' .env
sudo systemctl restart echowork-backend
```

## Verification

```bash
# Check backend
curl http://localhost:3000/api/categories

# Check frontend
curl http://localhost

# Check services
sudo systemctl status echowork-backend
sudo systemctl status nginx
```

## Access Your Application

- **Frontend**: http://your-domain.com (or http://localhost)
- **Backend API**: http://your-domain.com/api (or http://localhost/api)

## Management Commands

### Backend Service
```bash
sudo systemctl status echowork-backend   # Check status
sudo systemctl restart echowork-backend  # Restart
sudo journalctl -u echowork-backend -f   # View logs
```

### Nginx
```bash
sudo systemctl status nginx              # Check status
sudo systemctl reload nginx              # Reload config
sudo tail -f /var/log/nginx/error.log   # View logs
```

### Database
```bash
sudo -u postgres psql -d echowork_db    # Connect to database
```

## Troubleshooting

See [DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md#troubleshooting) for detailed troubleshooting guide.

### Quick Fixes

**Backend won't start:**
```bash
sudo journalctl -u echowork-backend -n 50
sudo systemctl restart echowork-backend
```

**Nginx errors:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Database connection issues:**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d echowork_db
```

## Support

For detailed documentation:
- [DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md) - Full deployment guide
- [README.md](README.md) - Application overview
- [SECURITY.md](SECURITY.md) - Security best practices

## Estimated Total Time

- Automated script: **10-15 minutes**
- Docker deployment: **5-10 minutes**
- Manual deployment: **20-25 minutes**
