#!/bin/bash

# Deploy Script for Bash (Git Bash / Linux / macOS)
# Usage: ./deploy.sh

# Configuration
REMOTE_USER="root"
REMOTE_HOST="116.118.45.67"
REMOTE_SOURCE_DIR="/var/www/vgvina-erp-source"

echo "Starting deployment process (TKMG-AMZ Flow)..."

# 1. Push code to GitHub
echo "Pushing latest changes to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "Git push failed! Aborting deployment."
    exit 1
fi

# 2. Trigger build and deploy on VPS via SSH
echo "Connecting to VPS to pull and rebuild project..."
ssh $REMOTE_USER@$REMOTE_HOST "bash $REMOTE_SOURCE_DIR/vps_deploy.sh"

if [ $? -ne 0 ]; then
    echo "VPS deployment failed! Please check VPS logs."
    exit 1
fi

echo "Deployment completed successfully!"
echo "Visit https://baocao.vgvina.com to verify."

