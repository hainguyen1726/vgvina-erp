# Deploy Script for Windows PowerShell (TKMG-AMZ Flow)
# Usage: .\deploy.ps1

# Configuration
$REMOTE_USER = "root"
$REMOTE_HOST = "116.118.45.67"
$REMOTE_SOURCE_DIR = "/root/vgvina-erp-source"
$DOMAIN = "baocao.vgvina.com"

Write-Host "Starting deployment process (TKMG-AMZ Flow)..." -ForegroundColor Cyan

# 1. Push code to GitHub
Write-Host "Pushing latest changes to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Git push failed! Aborting deployment." -ForegroundColor Red
    exit 1
}

# 2. Trigger build and deploy on VPS via SSH
Write-Host "Connecting to VPS to pull and rebuild project..." -ForegroundColor Yellow
ssh $REMOTE_USER@$REMOTE_HOST "bash $REMOTE_SOURCE_DIR/vps_deploy.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "VPS deployment failed! Please check VPS logs." -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Visit https://$DOMAIN to verify." -ForegroundColor Cyan

