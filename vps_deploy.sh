#!/bin/bash
# VPS Deploy Script for vgvina-erp (Caddy Docker Volume Mount)
# Usage: Run this script on the VPS to pull latest code and build

SOURCE_DIR="/root/vgvina-erp-source"
WEB_ROOT="/home/admin/domains/baocao.vgvina.com/public_html"

echo "=== [1/4] Navigating to source directory ==="
cd "$SOURCE_DIR" || { echo "Source directory not found!"; exit 1; }

echo "=== [2/4] Pulling latest code from GitHub ==="
git checkout main
git pull origin main

echo "=== [3/4] Installing dependencies & Building project ==="
# Check if package-lock.json exists for clean install
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Build failed! Aborting deployment."
  exit 1
fi

echo "=== [4/4] Copying build files to Web Root ==="
mkdir -p "$WEB_ROOT"
# Clean old files
rm -rf "${WEB_ROOT:?}"/*
# Copy new build
cp -r dist/* "$WEB_ROOT/"

# Fix ownership for DirectAdmin / LiteSpeed
chown -R admin:admin "$WEB_ROOT"
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
find "$WEB_ROOT" -type f -exec chmod 644 {} \;

echo "=== Deploy Completed Successfully! ==="
