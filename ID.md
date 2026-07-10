### SETUP BOT

Sebelum melakukan instalasi modul dll, pastikan server yang digunakan memenuhi syarat sebagai berikut:

- [x] Server mendukung instalasi NodeJS >= 20
- [x] Server mendukung instalasi FFMPEG, Git, Canvas, Sharp dan SQLite
- [x] Server bisa untuk mengirim email (SMTP)
- [x] Server vCPU/RAM 1/1GB (Min)

Selanjutnya edit konfigurasi yang ada pada file [config.json](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/config.json) dan file [.env](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/.env)

Jika semua sudah, lakukan instalasi dengan menjalankan file [setup.sh](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/install.sh) menggunakan perintah:

```bash
$ bash setup.sh
```

Lakukan verifikasi lisensi dengan perintah berikut sampai muncul prompt "Passcode" dan masukkan pin

```bash
$ node .
```

Apabila sudah berhasil load semua plugin tekan **CTRL+C** dan jalankan bot menggunakan PM2 agar always on:

```bash
$ pm2 start pm2.config.cjs --only bot && pm2 logs bot
```

### SETUP BOT + GATEWAY (DASHBOARD)

Untuk setup bot sama seperti diatas jadi ini adalah tutorial setup gateway, sebelum melakukan hal lain pastikan port server tidak terhalang firewall dan mempunyai domain yang sudah di kaitkan dengan cloudflare.

Pasang domain di file [nuxt/nuxt.config.ts](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/nuxt/nuxt.config.ts) dan di file [.env](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/.env)

Di script ini terdapat 2 file konfigurasi otomatis untuk Apache dan Cloudflare Tunneling (silahkah pilih salah satu) :

#### 1. APACHE

```bash
$ bash apache.sh domain port
```

#### 2. CLOUDFLARE TUNNELING

```bash
$ bash tunnel.sh domain port
```

Sebagai contoh konfigurasi .env nya seperti ini :

```.env
DOMAIN = 'https://wapify.neoxr.eu'
PORT = 3001
JWT_SECRET = 'neoxr'
JWT_EXPIRY = '72h'
```

maka jalankan :

```bash
$ bash tunnel.sh wapify.neoxr.eu 3001
```

kemudian generate template :

```bash
$ yarn run build
```

Selanjutnya buat A record di cloudflare dengan pointing ke IPv4 VPS nya

> [!NOTE]
> Jika menggunakan VPS hostdata tambahkan domain forwarding untuk http dan https

Apabila semua sudah, jalankan dengan perintah:

```bash
$ pm2 start pm2.config.cjs --only gateway && pm2 logs gateway
```

Default kredensial login operator :

```
username: admin
password: root
```

### KONFIGURASI BOT HOSTING

Sesuaikan slot (jumlah) bot dengan spesifikasi server jika stuck saat booting cek penggunakan CPU/RAM. Konfigurasi [config.json](https://github.com/neoxrjs/v5.1-optima/blob/5.1-ESM/config.json) ini digunakan untuk mengatur bagaimana sistem melakukan auto-reconnect atau booting massal terhadap Sub/Child Bot :

- `slot` : Batas jumlah bot untuk di host.
- `batch_size` : Jumlah bot yang akan diproses dalam satu kelompok (batch). Membatasi ini mencegah penggunaan CPU 100% secara tiba-tiba.
- `batch_delay` : Jeda waktu (milidetik) antar bot di dalam satu batch. Memberi waktu bagi I/O disk untuk menulis file sesi satu per satu.
- `rest_delay` : Jeda waktu (milidetik) antar kelompok (batch). Memberi waktu bagi RAM dan CPU untuk kembali stabil sebelum memproses kelompok bot berikutnya.
- `silent_boot` : Jika **true**, Child Bot tidak akan merespon pesan masuk sampai seluruh bot selesai terkoneksi. Ini mencegah crash akibat tumpukan pesan saat booting sekaligus menghemat pengguanaan CPU dan RAM.

### SETUP CHATBOT

Chatbot pada script ini menggunakan Multi-Modal LLM yaitu menggunakan 3 provider dan macam macam model, 1 main dan 2 fallback.
 
Ke-3 provider tersebut terdiri dari [Groq](https://groq.com), [Gemini](https://aistudio.google.com) dan [Cloudflare](http://cloudflare.com). 

Berikut adalah cara mendapatkan akses agar fitur chatbot bisa untuk digunakan :

#### 1. GROQ CLOUD

- Kunjungi website [https://groq.com](https://groq.com).
- Login atau daftar jika belum mempunyai akun.
- Cari tombol "Create API Keys".
- Kemudian lanjut membuat API Key setelah itu simpan API Key yang dibuat.

#### 2. GEMINI

- Kunjungi website [https://aistudio.google.com](https://aistudio.google.com).
- (Step selajutnya sama seperti Groq).

#### 3. Cloudflare AI

- Kunjungi website [http://cloudflare.com](http://cloudflare.com).
- Login atau daftar jika belum mempunyai akun.
- Buka menu kemudian cari dan buka opsi "Compute & AI" kemudian klik "Workers AI".
- Di halaman Workers AI klik "Rest API" dan cari button bertuliskan "Create a Workers AI API Token".
- Buat API Token dan simpan beserta Account ID yang tertera.