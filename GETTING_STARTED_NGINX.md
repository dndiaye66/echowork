# Getting Started with Nginx Deployment on Ubuntu 24.04

Welcome! This guide will help you quickly get EchoWork deployed on Ubuntu 24.04 with Nginx.

## 🚀 Quick Start (Choose One Method)

### Method 1: Automated Deployment (Recommended) ⭐

**Best for**: Production servers, first-time deployment  
**Time**: 10-15 minutes

```bash
# Clone repository
git clone https://github.com/dndiaye66/echowork.git
cd echowork

# Run automated deployment
sudo bash deploy.sh
```

The script will:
- ✅ Install Node.js, PostgreSQL, Nginx
- ✅ Setup database
- ✅ Deploy backend and frontend
- ✅ Configure services
- ✅ Optionally setup SSL

---

### Method 2: Docker Deployment 🐳

**Best for**: Development, testing, containers  
**Time**: 5-10 minutes

```bash
# Clone repository
git clone https://github.com/dndiaye66/echowork.git
cd echowork

# Configure environment
cp .env.prod.example .env.prod
nano .env.prod  # Edit with your settings

# Deploy with Docker
bash deploy-docker.sh
```

---

### Method 3: Manual Installation 📝

**Best for**: Custom setups, learning  
**Time**: 20-25 minutes

See [INSTALLATION_COMMANDS.md](INSTALLATION_COMMANDS.md) for complete command list.

---

## 📚 Documentation Overview

### Quick References
- **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)** - Quick start guide (all 3 methods)
- **[INSTALLATION_COMMANDS.md](INSTALLATION_COMMANDS.md)** - Copy-paste ready commands
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Complete overview of all files

### Detailed Guides
- **[DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md)** - Complete step-by-step deployment
- **[scripts/README.md](scripts/README.md)** - Management scripts documentation

### Configuration Files
- **nginx.conf** - Production nginx configuration
- **echowork-backend.service** - Systemd service
- **docker-compose.prod.yml** - Docker setup
- **.env.prod.example** - Environment template

### Scripts
- **deploy.sh** - Automated deployment
- **deploy-docker.sh** - Docker deployment
- **scripts/backup-database.sh** - Backup utility
- **scripts/health-check.sh** - Health monitoring
- **scripts/update.sh** - Update utility

---

## ✅ After Deployment

### 1. Verify Installation

```bash
# Run health check
sudo bash scripts/health-check.sh
```

### 2. Access Your Application

- **Frontend**: http://your-domain.com or http://localhost
- **Backend API**: http://your-domain.com/api or http://localhost/api

### 3. Setup SSL (Recommended for Production)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. Configure Backups

```bash
# Setup daily backups at 2 AM
sudo crontab -e

# Add this line:
0 2 * * * /var/www/echowork/scripts/backup-database.sh >> /var/log/echowork/backup.log 2>&1
```

---

## 🛠️ Management

### Check Service Status

```bash
# Backend
sudo systemctl status echowork-backend

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql
```

### View Logs

```bash
# Backend logs
sudo journalctl -u echowork-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart echowork-backend

# Reload nginx
sudo systemctl reload nginx
```

### Update Application

```bash
# Run update script
sudo bash scripts/update.sh
```

### Backup Database

```bash
# Manual backup
sudo bash scripts/backup-database.sh
```

---

## 🆘 Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u echowork-backend -n 50

# Check database connection
sudo -u postgres psql -d echowork_db

# Restart service
sudo systemctl restart echowork-backend
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### API Not Responding

```bash
# Check if backend is running
curl http://localhost:3000/api/categories

# Check via Nginx
curl http://localhost/api/categories

# Run health check
sudo bash scripts/health-check.sh
```

---

## 📖 Need More Help?

### Complete Documentation
- [DEPLOYMENT_NGINX.md](DEPLOYMENT_NGINX.md) - 400+ lines of detailed instructions
- [INSTALLATION_COMMANDS.md](INSTALLATION_COMMANDS.md) - All commands reference
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Complete file overview

### Quick Guides
- [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) - Condensed deployment guide
- [scripts/README.md](scripts/README.md) - Scripts usage guide

### Application Documentation
- [README.md](README.md) - Main application documentation
- [SECURITY.md](SECURITY.md) - Security best practices

---

## 🎯 Common Tasks

### Daily Operations

```bash
# Check health
sudo bash scripts/health-check.sh

# View logs
sudo journalctl -u echowork-backend --since today

# Check disk space
df -h
```

### Weekly Maintenance

```bash
# Backup database
sudo bash scripts/backup-database.sh

# Check for updates
cd /var/www/echowork
git fetch origin

# Update if needed
sudo bash scripts/update.sh
```

### Monthly Tasks

```bash
# Review logs
sudo tail -n 100 /var/log/echowork/backend.log

# Clean old backups (keeps last 7 days)
# (Automatic in backup script)

# Update system packages
sudo apt update && sudo apt upgrade -y
```

---

## 🎉 Success!

Your EchoWork application should now be running on Ubuntu 24.04 with Nginx!

### What You Have Now

✅ Production-ready deployment  
✅ Automatic service management  
✅ SSL support  
✅ Backup utilities  
✅ Health monitoring  
✅ Update automation  
✅ Complete documentation  

### Next Steps

1. Test all features
2. Configure SSL if not done
3. Setup monitoring
4. Schedule backups
5. Customize for your needs

---

**Need help?** Check the documentation files listed above or review the troubleshooting sections.

**Ready to deploy?** Choose your method above and get started! 🚀
