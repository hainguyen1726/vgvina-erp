# Deploy Script for Windows PowerShell
# Usage: .\deploy.ps1

# Configuration
$REMOTE_USER = "root"
$REMOTE_HOST = "116.118.45.67"
# IMPORTANT: Update 'admin' to your actual DirectAdmin username if different
$DA_USER = "admin" 
$DOMAIN = "baocao.vgvina.com"
$REMOTE_DIR = "/home/$DA_USER/domains/$DOMAIN/public_html" 
$LOCAL_BUILD_DIR = "dist"

Write-Host "Starting deployment process..." -ForegroundColor Cyan

# 1. Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting deployment." -ForegroundColor Red
    exit 1
}

# 2. Check if build directory exists
if (-not (Test-Path $LOCAL_BUILD_DIR)) {
    Write-Host "Build directory '$LOCAL_BUILD_DIR' not found!" -ForegroundColor Red
    exit 1
}

# 3. Upload files to VPS
Write-Host "Uploading files to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR} ..." -ForegroundColor Yellow

# Ensure permissions are correct after upload is handled by DA usually, 
# but uploading as root might mess up ownership.
# We will fix ownership after upload.

# Using scp to copy recursively
scp -r $LOCAL_BUILD_DIR/* "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed! Please check your SSH connection and permissions." -ForegroundColor Red
    exit 1
}

# 3.1 Upload .htaccess specifically (wildcard * often misses hidden files)
if (Test-Path "$LOCAL_BUILD_DIR/.htaccess") {
    Write-Host "Uploading .htaccess..." -ForegroundColor Yellow
    scp "$LOCAL_BUILD_DIR/.htaccess" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/.htaccess"
}

# 4. Fix Permissions and Restart Server (Crucial for OLS)
Write-Host "Fixing permissions and restarting OpenLiteSpeed..." -ForegroundColor Yellow
# 1. Ownership to admin
# 2. Directory permissions to 755
# 3. File permissions to 644
# 4. Restart LiteSpeed to load .htaccess
ssh $REMOTE_USER@$REMOTE_HOST "chown -R ${DA_USER}:${DA_USER} ${REMOTE_DIR} && find ${REMOTE_DIR} -type d -exec chmod 755 {} \; && find ${REMOTE_DIR} -type f -exec chmod 644 {} \; && systemctl restart lsws"

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Visit https://$DOMAIN to verify." -ForegroundColor Cyan
