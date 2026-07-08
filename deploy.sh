#!/bin/bash

# Deploy Script for Bash (Git Bash / Linux / macOS)
# Usage: ./deploy.sh

# Configuration
REMOTE_USER="root"
REMOTE_HOST="116.118.45.67"
REMOTE_DIR="/var/www/baocao.vgvina.com/dist" # Update this path if needed
LOCAL_BUILD_DIR="dist"

echo "Starting deployment process..."

# 1. Build the project
echo "Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed! Aborting deployment."
    exit 1
fi

# 2. Check if build directory exists
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    echo "Build directory '$LOCAL_BUILD_DIR' not found!"
    exit 1
fi

# 3. Upload files to VPS
echo "Uploading files to $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR ..."

# Create remote directory if it doesn't exist
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# Upload
scp -r $LOCAL_BUILD_DIR/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

if [ $? -ne 0 ]; then
    echo "Upload failed! Please check your SSH connection and permissions."
    exit 1
fi

echo "Deployment completed successfully!"
echo "Visit https://baocao.vgvina.com to verify."
