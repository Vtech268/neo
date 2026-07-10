### BOT SETUP

Before installing modules, etc., make sure the server used meets the following requirements:

- [x] The server supports NodeJS >= 20 installation
- [x] The server supports the installation of FFMPEG, Git, Canvas, Sharp, and SQLite
- [x] The server can send emails (SMTP)
- [x] Server vCPU/RAM 1/1GB (Min)

Next, edit the configuration in the [config.json](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/config.json) file and the [.env](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/.env) file.

This script contains 2 automatic configuration files for Apache and Cloudflare Tunneling (choose one):

#### 1. APACHE

```bash
$ bash apache.sh domain port
```

#### 2. CLOUDFLARE TUNNELING

```bash
$ bash tunnel.sh domain port
```

Perform the license verification with the following command until the "Passcode" prompt appears and enter the pin:

```bash
$ node .
```

If all plugins have been loaded successfully, press CTRL+C and run the bot using PM2 to keep it always on:

```bash
$ pm2 start pm2.config.cjs --only bot && pm2 logs bot
```

### BOT + GATEWAY (DASHBOARD) SETUP

The bot setup process is identical to the one described above. This section focuses specifically on the gateway (dashboard) setup.

Before you begin, ensure the following prerequisites are met:
1. The server port you intend to use is not blocked by a firewall.
2. You have a domain name that is already linked to your Cloudflare account.

First, you need to configure your domain in two files:
- [nuxt/nuxt.config.ts](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/nuxt/nuxt.config.ts)
- [.env](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/.env)

After setting your domain, run the setup script with your domain and port as arguments:

```bash
$ bash tunnel.sh your_domain your_port
```

For example, if your .env file is configured like this:

```env
DOMAIN = 'https://wapify.neoxr.eu'
PORT = 3001
JWT_SECRET = 'neoxr'
JWT_EXPIRY = '72h'
```

You would execute the setup script as follows:

```bash
$ bash tunnel.sh wapify.neoxr.eu 3001
```

Then generate a build template:

```bash
$ yarn run build
```

Next, go to your Cloudflare dashboard and create a new A record. Point this record to the IPv4 address of your VPS.

```bash
$ pm2 start pm2.config.cjs --only gateway && pm2 logs gateway
```

Default operator login credentials :

```
username: admin
password: root
```

### BOT HOSTING CONFIGURATION

Adjust the bot slot count according to your server specifications. If the bots get stuck during booting, check CPU/RAM usage. This [config.json](https://github.com/neoxrjs/v5.1-optima/blob/5.1-ESM/config.json) configuration is used to control how the system performs auto-reconnect or mass booting for Sub/Child Bots:

- `slot`: The maximum number of bots that can be hosted.
- `batch_size`: The number of bots processed in one group (batch). Limiting this helps prevent CPU usage from suddenly reaching 100%.
- `batch_delay`: The delay time (in milliseconds) between bots within a batch. This gives disk I/O time to write session files one by one.
- `rest_delay`: The delay time (in milliseconds) between batches. This gives RAM and CPU time to stabilize before processing the next group of bots.
- `silent_boot`: If **true**, Child Bots will not respond to incoming messages until all bots are fully connected. This helps prevent crashes caused by message buildup during simultaneous booting and also reduces CPU and RAM usage.

### CHATBOT SETUP

The chatbot in this script uses a Multi-Modal LLM setup with three AI providers and multiple models: one primary provider and two fallback providers.

The three providers are Groq (https://groq.com), Cloudflare (https://cloudflare.com), and Gemini (https://aistudio.google.com).

Below are the steps to obtain access so the chatbot feature can be used:

#### 1. GROQ CLOUD

- Visit https://groq.com
- Log in or sign up if you don’t have an account yet.
- Look for the "Create API Keys" button.
- Create an API key and save it securely.

#### 2. GEMINI

- Visit https://aistudio.google.com
- The remaining steps are the same as for Groq (create and save an API key).

#### 3. CLOUDFLARE AI

- Visit https://cloudflare.com
- Log in or sign up if you don’t have an account yet.
- Open the menu and go to "Compute & AI", then click "Workers AI".
- On the Workers AI page, click "REST API" and find the "Create a Workers AI API Token" button.
- Create an API token and save it along with the displayed Account ID.
