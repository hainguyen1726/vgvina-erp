#!/bin/bash

# VPS Setup Script for baocao.vgvina.com
# Usage: Run this script on the VPS as root

DOMAIN="baocao.vgvina.com"
ROOT_DIR="/var/www/$DOMAIN/dist"

echo "Step 1: Updating system packages..."
apt-get update -y
apt-get upgrade -y

echo "Step 2: Installing Nginx..."
apt-get install -y nginx

# Enable Nginx to start on boot
systemctl enable nginx
systemctl start nginx

echo "Step 3: Creating directory structure..."
mkdir -p "$ROOT_DIR"

# Set permissions
chown -R www-data:www-data "/var/www/$DOMAIN"
chmod -R 755 "/var/www/$DOMAIN"

echo "Step 4: Configuring Nginx for $DOMAIN..."
CONFIG_FILE="/etc/nginx/sites-available/$DOMAIN"

cat > "$CONFIG_FILE" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $ROOT_DIR;
    index index.html;

    # React Router handling
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Gzip settings for performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";
}
EOF

echo "Step 5: Enabling site configuration..."
ln -sf "$CONFIG_FILE" "/etc/nginx/sites-enabled/"

# Remove default site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm "/etc/nginx/sites-enabled/default"
fi

echo "Step 6: Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration valid. Reloading Nginx..."
    systemctl reload nginx
    echo "VPS Setup Complete!"
    echo "Your server is now ready to receive files."
    echo "Upload directory: $ROOT_DIR"
else
    echo "Nginx configuration failed. Please check the error listed above."
fi
