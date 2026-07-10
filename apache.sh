#!/bin/bash

# ================================================================
# 1. Validate and Capture Command Line Arguments
# ================================================================

if [ "$#" -ne 2 ]; then
    echo "Error: Missing arguments."
    echo "Usage: bash $0 <domain> <port>"
    echo "Example: bash $0 s.neoxr.eu 7860"
    echo "Note: Run this script from inside your project directory."
    exit 1
fi

DOMAIN="$1"
PORT="$2"

DOCUMENT_ROOT=$(dirname "$(realpath "$0")")
CONFIG_FILE="${DOMAIN}.conf"

echo "================================================="
echo "  CONFIGURATION SUMMARY"
echo "-------------------------------------------------"
echo "  Domain        : ${DOMAIN}"
echo "  App Port      : ${PORT}"
echo "  Project Folder: ${DOCUMENT_ROOT}"
echo "================================================="
echo ""
sleep 2

# ================================================================
# 2. Install System Dependencies
# ================================================================

echo "--> Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

echo "--> Installing required packages..."
sudo apt install apache2 certbot python3-certbot-apache ffmpeg nano curl ca-certificates \
libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 \
libxrandr2 xdg-utils --no-install-recommends -y

sudo apt clean

# ================================================================
# 3. Install NVM & Node.js
# ================================================================

echo "--> Installing NVM & Node.js..."

if [ -d "$HOME/.nvm" ]; then
    echo "NVM already installed. Skipping..."
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

nvm install 20
nvm alias default 20
nvm use default

# ================================================================
# 4. Configure Apache VirtualHost
# ================================================================

echo "--> Creating Apache config for ${DOMAIN}..."

sudo tee "/etc/apache2/sites-available/${CONFIG_FILE}" > /dev/null <<EOF
<VirtualHost *:443>
    ServerAdmin contact@neoxr.my.id
    ServerName ${DOMAIN}

    DocumentRoot ${DOCUMENT_ROOT}

    ProxyRequests Off
    ProxyPreserveHost On
    ProxyVia Full

    <Proxy *>
        Require all granted
    </Proxy>

    ProxyPass / http://127.0.0.1:${PORT}/
    ProxyPassReverse / http://127.0.0.1:${PORT}/

    ProxyPassMatch "^/socket.io/(.*)" "ws://127.0.0.1:3001/socket.io/\$1"
    ProxyPassReverse "/socket.io/" "ws://127.0.0.1:3001/socket.io/"

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

echo "--> Enabling Apache modules..."
sudo a2enmod proxy proxy_http proxy_wstunnel proxy_balancer lbmethod_byrequests

echo "--> Enabling site ${CONFIG_FILE}..."
sudo a2dissite 000-default.conf > /dev/null 2>&1
sudo a2ensite "${CONFIG_FILE}"

echo "--> Restarting Apache..."
sudo systemctl restart apache2

# ================================================================
# 5. Obtain SSL Certificate (Let's Encrypt)
# ================================================================

echo "--> Requesting SSL certificate for ${DOMAIN}..."

sudo certbot --apache -d "${DOMAIN}" \
--non-interactive \
--agree-tos \
-m contact@neoxr.my.id \
--redirect

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠ SSL certificate issuance failed."
    echo "If you are using Cloudflare:"
    echo "1. Set DNS record to DNS Only (grey cloud)"
    echo "2. Ensure domain points to this server IP"
    exit 1
fi

# ================================================================
# 6. Setup Auto Renewal
# ================================================================

echo "--> Configuring automatic SSL renewal..."

(crontab -l 2>/dev/null | grep -q certbot) || (
    crontab -l 2>/dev/null
    echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload apache2'"
) | crontab -

# ================================================================
# 7. Install Project Dependencies & PM2
# ================================================================

echo "--> Installing Yarn & PM2..."
npm install -g yarn pm2

echo "--> Switching to project directory..."
cd "${DOCUMENT_ROOT}" || { echo "Failed to enter project directory."; exit 1; }

echo "--> Installing project dependencies..."
yarn install

# ================================================================
# 8. Final Instructions
# ================================================================

PUBLIC_IP=$(curl -s ifconfig.me)

echo ""
echo "==============================================================="
echo "  SETUP COMPLETE"
echo "==============================================================="
echo "Domain  : ${DOMAIN}"
echo "Server IP: ${PUBLIC_IP}"
echo ""
echo "Make sure your DNS record is configured correctly:"
echo ""
echo "Type : A"
echo "Name : ${DOMAIN%%.*}   (or use @ if this is root domain)"
echo "IP   : ${PUBLIC_IP}"
echo ""
echo "After DNS propagation, your app will be available at:"
echo ""
echo "https://${DOMAIN}"
echo "==============================================================="
