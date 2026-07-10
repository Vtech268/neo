#!/bin/bash

# =================================================================
# 1. Validasi dan Tangkap Argumen dari Command Line
# =================================================================

### PERUBAHAN ###
# Argumen <folder_proyek> telah dihapus. Skrip akan mendeteksinya secara otomatis.
if [ "$#" -ne 2 ]; then
    echo "Kesalahan: Argumen tidak lengkap."
    echo "Penggunaan: bash $0 <domain> <port>"
    echo "Contoh: bash $0 s.neoxr.eu 7860"
    echo "Catatan: Pastikan Anda menjalankan skrip ini dari dalam folder proyek Anda."
    exit 1
fi

# Assign argumen ke variabel yang mudah dibaca
DOMAIN="$1"
PORT="$2"

# Dapatkan path absolut dari direktori tempat skrip ini berada.
# Ini diasumsikan sebagai direktori root proyek Anda.
DOCUMENT_ROOT=$(dirname "$(realpath "$0")")

# Nama file konfigurasi Apache
CONFIG_FILE="${DOMAIN}.conf"
### AKHIR PERUBAHAN ###

# Cetak informasi untuk verifikasi
echo "================================================="
echo "  KONFIGURASI YANG AKAN DIGUNAKAN"
echo "-------------------------------------------------"
echo "  Domain        : ${DOMAIN}"
echo "  Port Aplikasi : ${PORT}"
echo "  Folder Proyek : ${DOCUMENT_ROOT}"
echo "================================================="
echo ""
# Beri jeda agar pengguna bisa membaca
sleep 3


# =================================================================
# 2. Instalasi Dependensi
# =================================================================
echo "--> Memperbarui dan menginstal dependensi sistem..."
sudo apt update -y
sudo apt upgrade -y
sudo apt install apache2 ffmpeg nano curl ca-certificates libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils --no-install-recommends -y
sudo apt clean

# =================================================================
# 3. Instalasi NVM dan Node.js
# =================================================================
echo "--> Menginstal NVM dan Node.js..."
# Periksa apakah NVM sudah ada untuk menghindari instalasi ulang
if [ -d "$HOME/.nvm" ]; then
    echo "NVM sudah terinstal. Melewati instalasi."
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Muat nvm untuk sesi skrip saat ini
source "$NVM_DIR/nvm.sh"

nvm install 20
nvm alias default 20
nvm use default

# =================================================================
# 4. Konfigurasi dan Aktivasi Apache
# =================================================================
echo "--> Membuat file konfigurasi Apache untuk domain ${DOMAIN}..."

# Gunakan "Here Document" untuk membuat file konfigurasi secara dinamis
sudo tee "/etc/apache2/sites-available/${CONFIG_FILE}" > /dev/null <<EOF
<VirtualHost *:80>
    ServerAdmin contact@neoxr.my.id
    ServerName ${DOMAIN}

    # ### PERUBAHAN ###: DocumentRoot sekarang menggunakan path dinamis
    DocumentRoot ${DOCUMENT_ROOT}

    ProxyRequests Off
    ProxyPreserveHost On
    ProxyVia Full

    <Proxy *>
        Require all granted
    </Proxy>

    ProxyPass / http://127.0.0.1:${PORT}/
    ProxyPassReverse / http://127.0.0.1:${PORT}/

    ProxyPassMatch "^/socket.io/(.*)" "ws://127.0.0.1:3001/socket.io/$1"
    ProxyPassReverse "/socket.io/" "ws://127.0.0.1:3001/socket.io/"

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

echo "--> Mengaktifkan site ${CONFIG_FILE}..."
sudo a2dissite 000-default.conf > /dev/null 2>&1 # Sembunyikan output jika sudah nonaktif
sudo a2ensite "${CONFIG_FILE}"

echo "--> Mengaktifkan modul proxy Apache..."
sudo a2enmod proxy proxy_http proxy_balancer proxy_wstunnel lbmethod_byrequests

echo "--> Merestart Apache..."
sudo systemctl restart apache2

# =================================================================
# 5. Instalasi dependensi proyek dan menjalankan dengan PM2
# =================================================================
echo "--> Menginstal Yarn dan PM2 secara global..."
npm i -g yarn pm2

### PERUBAHAN ###
# Pindah ke direktori proyek sebelum menginstal dependensi Node.js
echo "--> Pindah ke direktori proyek: ${DOCUMENT_ROOT}"
cd "${DOCUMENT_ROOT}" || { echo "Gagal pindah ke direktori proyek. Membatalkan."; exit 1; }

echo "--> Menginstal dependensi proyek dengan Yarn..."
yarn install

### AKHIR PERUBAHAN ###

# =================================================================
# 6. Instruksi Final untuk Konfigurasi DNS
# =================================================================
echo ""
echo "--> Mengambil alamat IP Publik server..."
PUBLIC_IP=$(curl -s ifconfig.me)

echo "======================================================================="
echo "  PENTING: LANGKAH TERAKHIR - KONFIGURASI DNS"
echo "======================================================================="
echo "Jalankan bot menggunakan $ pm2 start pm2.config.js --only gateway && pm2 logs"
echo "Setup di server telah selesai. Aplikasi sudah berjalan."
echo "Agar domain ${DOMAIN} bisa diakses dari internet,"
echo "Tambahkan A Record pada panel manajemen DNS domain."
echo ""
echo "Gunakan detail berikut:"
echo "---------------------------------------------------"
echo "  - Tipe Record : A"
echo "  - Nama / Host : @ (atau ${DOMAIN})"
echo "  - Alamat IP   : ${PUBLIC_IP}"
echo "  - TTL         : Biarkan otomatis"
echo "---------------------------------------------------"
echo ""
echo "Setelah DNS terpropagasi (biasanya beberapa menit),"
echo "Dashbard akan bisa di akses melalui http://${DOMAIN}"
echo "======================================================================="