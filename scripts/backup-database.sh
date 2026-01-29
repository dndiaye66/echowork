#!/bin/bash

# Backup script for EchoWork database
# Run this script regularly to backup your database

set -e

# Configuration
BACKUP_DIR="/var/backups/echowork"
DB_NAME="${DB_NAME:-echowork_db}"
DB_USER="${DB_USER:-postgres}"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}EchoWork Database Backup${NC}"
echo "================================"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/echowork_${TIMESTAMP}.sql"

# Perform backup
echo "Backing up database: $DB_NAME"
sudo -u "$DB_USER" pg_dump "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}Backup completed successfully!${NC}"
echo "File: $BACKUP_FILE"
echo "Size: $SIZE"

# Clean old backups
echo ""
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "echowork_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -n 5

echo ""
echo "================================"
echo -e "${GREEN}Backup process completed${NC}"
