#!/bin/bash
set -e

WEB_PARENT="/home/admin/domains/baocao.vgvina.com"
WEB_ROOT="$WEB_PARENT/public_html"
TEMP_DIR="$WEB_PARENT/public_html_new"
OLD_DIR="$WEB_PARENT/public_html_old"

HKD_PARENT="/home/admin/domains/hkd.vgvina.com"
HKD_ROOT="$HKD_PARENT/public_html"
HKD_TEMP="$HKD_PARENT/public_html_new"
HKD_OLD="$HKD_PARENT/public_html_old"

echo "=== Starting safe deployment to baocao + hkd ==="

# Clean any leftover temporary dirs
for d in "$TEMP_DIR" "$OLD_DIR" "$HKD_TEMP" "$HKD_OLD"; do
  [ -d "$d" ] && rm -rf "$d"
done

# Extract to temp for baocao
mkdir -p "$TEMP_DIR"
tar -xzf /tmp/dist.tar.gz -C "$TEMP_DIR/"

# Swap baocao directories
[ -d "$WEB_ROOT" ] && mv "$WEB_ROOT" "$OLD_DIR"
mv "$TEMP_DIR" "$WEB_ROOT"
[ -d "$OLD_DIR" ] && rm -rf "$OLD_DIR"

# Set ownership/permissions for baocao
chown -R admin:admin "$WEB_ROOT"
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
find "$WEB_ROOT" -type f -exec chmod 644 {} \;

echo "=== baocao deployed ==="

# Deploy to HKD (same code, different brand controlled by JS)
if [ -d "$HKD_PARENT" ]; then
  echo "=== Syncing to hkd.vgvina.com ==="

  # Backup .well-known if exists
  WELL_KNOWN_BACKUP=""
  if [ -d "$HKD_ROOT/.well-known" ]; then
    WELL_KNOWN_BACKUP="/tmp/well-known-backup-$(date +%s)"
    cp -r "$HKD_ROOT/.well-known" "$WELL_KNOWN_BACKUP"
  fi

  # Extract fresh copy for HKD
  mkdir -p "$HKD_TEMP"
  tar -xzf /tmp/dist.tar.gz -C "$HKD_TEMP/" 2>/dev/null || true

  # Swap HKD directories
  [ -d "$HKD_ROOT" ] && mv "$HKD_ROOT" "$HKD_OLD"
  mv "$HKD_TEMP" "$HKD_ROOT"
  [ -d "$HKD_OLD" ] && rm -rf "$HKD_OLD"

  # Restore .well-known for SSL renewal
  if [ -n "$WELL_KNOWN_BACKUP" ] && [ -d "$WELL_KNOWN_BACKUP" ]; then
    cp -r "$WELL_KNOWN_BACKUP" "$HKD_ROOT/.well-known"
    rm -rf "$WELL_KNOWN_BACKUP"
  fi

  # Set ownership/permissions for HKD
  chown -R admin:admin "$HKD_ROOT"
  find "$HKD_ROOT" -type d -exec chmod 755 {} \;
  find "$HKD_ROOT" -type f -exec chmod 644 {} \;

  echo "=== hkd deployed ==="
fi

# Clean package
rm -f /tmp/dist.tar.gz

echo "=== Safe deployment completed (baocao + hkd) ==="
