# EchoWork Management Scripts

This directory contains utility scripts for managing your EchoWork deployment.

## Scripts Overview

### backup-database.sh
Backs up the PostgreSQL database and compresses it.

**Usage:**
```bash
sudo bash scripts/backup-database.sh
```

**Features:**
- Creates timestamped backup files
- Compresses backups with gzip
- Automatically removes backups older than 7 days
- Stores backups in `/var/backups/echowork/`

**Configuration:**
Edit the script to customize:
- `BACKUP_DIR`: Where to store backups
- `DB_NAME`: Database name
- `DB_USER`: PostgreSQL user
- `RETENTION_DAYS`: How long to keep old backups

**Automation:**
Set up a cron job for automatic backups:
```bash
# Edit crontab
sudo crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /var/www/echowork/scripts/backup-database.sh >> /var/log/echowork/backup.log 2>&1
```

### health-check.sh
Checks if all EchoWork services are running properly.

**Usage:**
```bash
sudo bash scripts/health-check.sh
```

**Checks:**
- ✓ Backend service status
- ✓ Nginx service status
- ✓ PostgreSQL service status
- ✓ Backend API port (3000)
- ✓ Nginx ports (80, 443)
- ✓ API endpoint accessibility
- ✓ Frontend accessibility
- ✓ Disk space usage
- ✓ Memory usage

**Exit codes:**
- `0`: All checks passed
- `>0`: Number of failed checks

**Automation:**
Set up monitoring with cron:
```bash
# Check every 15 minutes and send email on failure
*/15 * * * * /var/www/echowork/scripts/health-check.sh || mail -s "EchoWork Health Check Failed" admin@example.com
```

### update.sh
Updates the EchoWork application to the latest version.

**Usage:**
```bash
sudo bash scripts/update.sh
```

**Process:**
1. Creates backup of current installation
2. Pulls latest changes from git
3. Updates backend dependencies
4. Runs database migrations
5. Rebuilds backend
6. Rebuilds frontend
7. Restarts services
8. Verifies services are running

**Safety:**
- Always creates backup before updating
- Prompts for confirmation before starting
- Can be rolled back using backup if needed

**Rollback:**
If update fails, restore from backup:
```bash
cd /var/www
sudo rm -rf echowork
sudo tar -xzf /var/backups/echowork/echowork_backup_TIMESTAMP.tar.gz
sudo systemctl restart echowork-backend nginx
```

## Common Tasks

### Daily Database Backup
```bash
sudo bash scripts/backup-database.sh
```

### Check System Health
```bash
sudo bash scripts/health-check.sh
```

### Update Application
```bash
sudo bash scripts/update.sh
```

### View Service Logs
```bash
# Backend logs
sudo journalctl -u echowork-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
sudo systemctl restart echowork-backend

# Restart nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Check Service Status
```bash
# Check backend
sudo systemctl status echowork-backend

# Check nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

## Troubleshooting

### Script Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Database Backup Fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep echowork
```

### Health Check Shows Errors
```bash
# Check individual services
sudo systemctl status echowork-backend
sudo systemctl status nginx

# Check logs for errors
sudo journalctl -u echowork-backend -n 50
```

### Update Script Fails
```bash
# Check git status
cd /var/www/echowork
git status

# Check for conflicts
git pull origin main

# Restore from backup if needed
sudo tar -xzf /var/backups/echowork/echowork_backup_LATEST.tar.gz -C /var/www
```

## Best Practices

1. **Regular Backups**: Run database backups daily
2. **Health Checks**: Monitor services regularly
3. **Updates**: Keep application up to date with security patches
4. **Log Monitoring**: Review logs periodically for errors
5. **Disk Space**: Ensure adequate disk space for backups and logs
6. **Documentation**: Keep track of any custom configurations

## Automation Examples

### Comprehensive Cron Setup
```bash
# Edit root crontab
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /var/www/echowork/scripts/backup-database.sh >> /var/log/echowork/backup.log 2>&1

# Health check every 15 minutes
*/15 * * * * /var/www/echowork/scripts/health-check.sh >> /var/log/echowork/health.log 2>&1

# Weekly update on Sunday at 3 AM (optional, be careful!)
# 0 3 * * 0 /var/www/echowork/scripts/update.sh >> /var/log/echowork/update.log 2>&1
```

## Support

For more information, see:
- [DEPLOYMENT_NGINX.md](../DEPLOYMENT_NGINX.md) - Full deployment guide
- [DEPLOYMENT_QUICKSTART.md](../DEPLOYMENT_QUICKSTART.md) - Quick start guide
- [README.md](../README.md) - Application overview
