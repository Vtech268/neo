#!/bin/bash

# =======================================================
# Usage : bash tunnel.sh <domain> <port>
# Example: bash tunnel.sh example.com 3000
# =======================================================

if [ "$#" -ne 2 ]; then
    echo "Usage: bash $0 <domain> <port>"
    exit 1
fi

DOMAIN=$1
PORT=$2
CONFIG_DIR="/etc/cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"
CERT_FILE="/root/.cloudflared/cert.pem"

echo "========================================"
echo "    Cloudflared Auto Tunnel Generator   "
echo "========================================"
sleep 1

# =======================================================
# INSTALL CLOUDFLARED
# =======================================================
if ! command -v cloudflared &> /dev/null; then
    echo "[+] Installing Cloudflared..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
        -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
fi

mkdir -p $CONFIG_DIR

# =======================================================
# LOGIN ONLY ONCE
# =======================================================
if [ ! -f "$CERT_FILE" ]; then
    echo "[+] First-time login, opening browser..."
    cloudflared login
else
    echo "[+] Already logged in, skipping login."
fi

# =======================================================
# CREATE TUNNEL (UUID REGEX UNIVERSAL)
# =======================================================
echo "[+] Creating new tunnel..."

TUNNEL_RAW=$(cloudflared tunnel create "auto-$(date +%s)" 2>&1)
echo "$TUNNEL_RAW"

# Extract tunnel name
TUNNEL_NAME=$(echo "$TUNNEL_RAW" | grep -oP 'Created tunnel \K[^ ]+')
# Extract tunnel UUID
TUNNEL_ID=$(echo "$TUNNEL_RAW" | grep -oP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)

if [ -z "$TUNNEL_ID" ]; then
    echo "[ERROR] Failed to get Tunnel ID!"
    exit 1
fi

echo "[+] Tunnel Created:"
echo "    Name : $TUNNEL_NAME"
echo "    ID   : $TUNNEL_ID"

# =======================================================
# COPY CREDENTIALS TO /etc/cloudflared
# =======================================================
CRED_SOURCE="/root/.cloudflared/$TUNNEL_ID.json"
CRED_DEST="$CONFIG_DIR/$TUNNEL_ID.json"

if [ -f "$CRED_SOURCE" ]; then
    cp "$CRED_SOURCE" "$CRED_DEST"
    chmod 600 "$CRED_DEST"
    chown root:root "$CRED_DEST"
    echo "[+] Credentials copied to $CRED_DEST"
else
    echo "[ERROR] Credentials file $CRED_SOURCE not found!"
    exit 1
fi

# =======================================================
# CREATE CONFIG FILE
# =======================================================
echo "[+] Creating config.yml..."

cat <<EOF > $CONFIG_FILE
tunnel: $TUNNEL_ID
credentials-file: $CRED_DEST

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$PORT
  - service: http_status:404
EOF

# =======================================================
# DELETE OLD DNS (SAFE METHOD)
# =======================================================
echo "[+] Deleting old DNS (if any)..."
cloudflared tunnel route dns delete "$DOMAIN" 2>/dev/null

# =======================================================
# CREATE DNS CNAME
# =======================================================
echo "[+] Creating DNS CNAME..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

# =======================================================
# INSTALL SERVICE ONLY IF NOT EXISTS
# =======================================================
if systemctl list-units --full -all | grep -q "cloudflared.service"; then
    echo "[+] Cloudflared service already exists, skipping install."
else
    echo "[+] Installing cloudflared service..."
    cloudflared service install
fi

echo ""
echo "========================================"
echo " Tunnel successfully created!"
echo " Domain : https://$DOMAIN"
echo " Port   : $PORT"
echo " Tunnel : $TUNNEL_NAME"
echo " ID     : $TUNNEL_ID"
echo ""
echo " To start the service:"
echo "   systemctl restart cloudflared"
echo "   systemctl status cloudflared"
echo "========================================"