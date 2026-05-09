#!/bin/bash
# Kon Database Backup Script
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_USER="${DB_USER:-nguyenhuudinh}"
DB_NAME="${DB_NAME:-kon_erp_northwind}"
BACKUP_FILE="${BACKUP_DIR}/kon_backup_${TIMESTAMP}.sql.gz"

mkdir -p $BACKUP_DIR

echo "Starting backup: $BACKUP_FILE"
docker exec kon_postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Keep only last 7 backups
ls -t ${BACKUP_DIR}/kon_backup_*.sql.gz | tail -n +8 | xargs -r rm

echo "Backup complete: $BACKUP_FILE"
echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
