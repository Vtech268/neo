import { JID } from '@neoxr/wb'

const UPDATE_INTERVAL = 5 * 60 * 1000
const SEASON_DURATION = 7 * 24 * 60 * 60 * 1000
const MAX_HISTORY = 50

class Market {
   /**
    * Initialize Market System
    * @param {Object} client - WhatsApp Client Instance
    */
   constructor(client) {
      this.client = client
      this.market = this._initMarket()
      this.groups = []
      this.season = this._newSeason()
      this.sentiment = { mode: 'neutral', bias: 0, until: 0 }
      this.whale = { phase: 'idle', ticks: 0, target: null, cooldown: 0 }
      this._ticker()
      this._autoSentiment()
      this._seasonWatcher()
   }

   /**
    * Define initial assets and their properties
    * @returns {Object} Market dictionary
    */
   _initMarket() {
      const a = (n, t, p, v) => this._asset(n, t, p, v)
      return {
         BTC: a('Bitcoin', 'crypto', 50000, 0.15),
         ETH: a('Ethereum', 'crypto', 3000, 0.18),
         BNB: a('Binance Coin', 'crypto', 420, 0.2),
         SOL: a('Solana', 'crypto', 110, 0.25),
         XRP: a('Ripple', 'crypto', 0.6, 0.22),
         ADA: a('Cardano', 'crypto', 0.5, 0.2),
         DOGE: a('Dogecoin', 'crypto', 0.08, 0.3),
         DOT: a('Polkadot', 'crypto', 7, 0.24),
         AAPL: a('Apple', 'stock', 180, 0.08),
         TSLA: a('Tesla', 'stock', 250, 0.12),
         MSFT: a('Microsoft', 'stock', 350, 0.06),
         NVDA: a('Nvidia', 'stock', 480, 0.14),
         META: a('Meta', 'stock', 320, 0.1),
         SPX: a('S&P 500', 'index', 4800, 0.03),
         NASDAQ: a('NASDAQ', 'index', 16000, 0.035),
         DOWJ: a('Dow Jones', 'index', 38000, 0.025),
         NXR: a('Neoxr Creative', 'index', 57000, 0.079),
         GOLD: a('Gold', 'commodity', 1900, 0.04),
         SILVER: a('Silver', 'commodity', 23, 0.06),
         OIL: a('Crude Oil', 'commodity', 78, 0.07),
         GAS: a('Natural Gas', 'commodity', 3.1, 0.09),
         EURUSD: a('EUR/USD', 'forex', 1.09, 0.015),
         USDJPY: a('USD/JPY', 'forex', 148, 0.02),
         GBPUSD: a('GBP/USD', 'forex', 1.27, 0.018),
         AUDUSD: a('AUD/USD', 'forex', 0.66, 0.02),
         USDCAD: a('USD/CAD', 'forex', 1.36, 0.017)
      }
   }

   /**
    * Create single asset object
    * @param {String} name 
    * @param {String} type 
    * @param {Number} price 
    * @param {Number} vol 
    */
   _asset(name, type, price, vol) {
      return {
         name, type,
         price, open: price,
         high: price, low: price,
         volatility: vol,
         halted: false,
         change: 0,
         history: []
      }
   }

   /**
    * Retrieve or initialize user market data
    * @param {Object} users - User database object
    */
   _getUser(users) {
      users.market ||= {
         portfolio: {},
         orders: [],
         staking: [],
         pnl: 0,
         season: this.season.id
      }
      return users.market
   }

   /**
    * Set eligible groups for notifications
    * @param {Array} groups 
    */
   setGroups(groups = []) {
      this.groups = groups.filter(g => g.game)
   }

   /**
    * Select random group for notifications
    */
   _randomGroup() {
      if (!this.groups.length) return null
      return this.groups[Math.floor(Math.random() * this.groups.length)].jid
   }

   /**
    * Automatically change market sentiment randomly
    */
   _autoSentiment() {
      setInterval(() => {
         const r = Math.random()
         if (r < 0.3) this.setSentiment('bull', 24)
         else if (r < 0.6) this.setSentiment('bear', 24)
         else this.setSentiment('neutral', 12)
      }, 12 * 60 * 60 * 1000)
   }

   /**
    * Manually set market sentiment
    * @param {String} mode - bull, bear, neutral
    * @param {Number} hours - Duration
    */
   setSentiment(mode, hours) {
      this.sentiment.mode = mode
      this.sentiment.bias = mode === 'bull' ? 0.03 : mode === 'bear' ? -0.03 : 0
      this.sentiment.until = Date.now() + hours * 60 * 60 * 1000
   }

   /**
    * Calculate current price bias based on sentiment
    */
   _sentimentBias() {
      if (Date.now() > this.sentiment.until) {
         this.sentiment.mode = 'neutral'
         this.sentiment.bias = 0
      }
      return this.sentiment.bias
   }

   /**
    * Handle Whale pump and dump logic
    */
   _whaleTick() {
      if (this.whale.cooldown-- > 0) return
      if (this.whale.phase === 'idle' && Math.random() < 0.15) {
         const cryptos = Object.keys(this.market).filter(k => this.market[k].type === 'crypto')
         this.whale.target = cryptos[Math.floor(Math.random() * cryptos.length)]
         this.whale.phase = 'pump'
         this.whale.ticks = 0
         this._notify(`🐳 Whale mulai akumulasi ${this.whale.target}`)
      }
      const a = this.market[this.whale.target]
      if (!a) return
      this.whale.ticks++
      if (this.whale.phase === 'pump') {
         a.price *= 1.1
         if (this.whale.ticks > 4) this.whale.phase = 'dump'
      } else {
         a.price *= 0.75
         this._notify(`💥 Whale dump ${this.whale.target}`)
         this.whale.phase = 'idle'
         this.whale.cooldown = 6
         this.whale.target = null
      }
   }

   /**
    * Simulate fake news event halting trading
    */
   _fakeNews() {
      if (Math.random() < 0.08) {
         const sym = Object.keys(this.market)[Math.floor(Math.random() * 25)]
         this.market[sym].halted = true
         this._notify(`📰 Breaking News: Trading ${sym} dihentikan sementara!`)
         setTimeout(() => (this.market[sym].halted = false), 30 * 60 * 1000)
      }
   }

   /**
    * Main market loop interval
    */
   _ticker() {
      this._updatePrices()
      setInterval(() => {
         this._updatePrices()
      }, UPDATE_INTERVAL)
   }

   /**
    * Update prices for all assets and process game events
    */
   _updatePrices() {
      const bias = this._sentimentBias()
      const { hostJid, clientJid, findJid } = JID(this.client)
      const dbUsers = !hostJid && findJid.bot(clientJid) ? findJid.bot(clientJid).data : global.db || {}
      const allUsers = Object.values(dbUsers)

      for (const k in this.market) {
         const a = this.market[k]
         if (a.halted) continue
         const oldPrice = a.price
         const swing = (Math.random() * 2 - 1) * a.volatility + bias
         const next = Math.max(0.0001, +(a.price * (1 + swing)).toFixed(4))
         a.price = next
         a.high = Math.max(a.high, next)
         a.low = Math.min(a.low, next)
         a.change = ((next - oldPrice) / oldPrice) * 100
         a.history.push(next)
         if (a.history.length > MAX_HISTORY) a.history.shift()
      }

      this._whaleTick()
      this._fakeNews()
      this._checkPendingOrders(allUsers)
      this._checkStaking(allUsers)
   }

   /**
    * Execute Spot Buy
    * @param {Object} users 
    * @param {String} sym 
    * @param {Number} qty 
    */
   buy(users, sym, qty) {
      const u = this._getUser(users)
      const a = this.market[sym]
      if (!a || a.halted) return { ok: false, msg: '⚠ Aset halted/tidak ditemukan.' }
      if (qty <= 0 || isNaN(qty)) return { ok: false, msg: '⚠ Qty tidak valid.' }
      if (u.portfolio[sym] && u.portfolio[sym].type !== 'SPOT') return { ok: false, msg: `⚠ Kamu punya posisi Futures di ${sym}. Gunakan close.` }

      const cost = a.price * qty
      if (users.balance < cost) return { ok: false, msg: `❌ Saldo kurang. Butuh $${cost.toFixed(2)}` }

      users.balance -= cost
      if (!u.portfolio[sym]) {
         u.portfolio[sym] = { qty, avg: a.price, lev: 1, type: 'SPOT' }
      } else {
         const p = u.portfolio[sym]
         const totalOld = p.qty * p.avg
         const totalNew = qty * a.price
         p.avg = (totalOld + totalNew) / (p.qty + qty)
         p.qty += qty
      }

      let msg = `✅ *SPOT BUY* @ ${sym}\n\n`
      msg += `◦ Price : $${a.price.toFixed(2)}\n`
      msg += `◦ Qty : ${qty}\n`
      msg += `◦ Cost : $${cost.toFixed(2)}`

      return { ok: true, msg }
   }

   /**
    * Execute Spot Sell
    * @param {Object} users 
    * @param {String} sym 
    * @param {Number} qty 
    */
   sell(users, sym, qty) {
      const u = this._getUser(users)
      const a = this.market[sym]
      if (!a || a.halted) return { ok: false, msg: '⚠ Aset halted/tidak tersedia.' }
      const p = u.portfolio[sym]
      if (!p || p.type !== 'SPOT') return { ok: false, msg: `⚠ Tidak ada aset Spot ${sym}.` }
      if (qty > p.qty) return { ok: false, msg: `⚠ Aset tidak cukup.` }

      const revenue = a.price * qty
      const profit = (a.price - p.avg) * qty

      users.balance += revenue
      p.qty -= qty
      if (p.qty <= 0.0000001) delete u.portfolio[sym]

      let msg = `✅ *SPOT SELL* @ ${sym}\n\n`
      msg += `◦ Price : $${a.price.toFixed(2)}\n`
      msg += `◦ Reveneu : $${revenue.toFixed(2)}\n`
      msg += `◦ PnL : ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`

      return { ok: true, msg }
   }

   /**
    * Open Long Position (Futures)
    * @param {Object} users 
    * @param {String} sym 
    * @param {Number} qty 
    * @param {Number} leverage 
    */
   long(users, sym, qty, leverage = 5) {
      const u = this._getUser(users)
      const a = this.market[sym]
      if (!a || a.halted) return { ok: false, msg: '⚠ Aset halted/tidak tersedia.' }
      if (u.portfolio[sym]) return { ok: false, msg: `⚠ Kamu sudah punya posisi di ${sym}.` }

      const margin = (a.price * qty) / leverage
      if (users.balance < margin) return { ok: false, msg: `❌ Margin kurang. Butuh $${margin.toFixed(2)}` }

      users.balance -= margin
      u.portfolio[sym] = { qty, avg: a.price, lev: leverage, type: 'LONG' }

      let msg = `✅ *OPEN LONG* @ ${sym}\n\n`
      msg += `◦ Price : $${a.price.toFixed(2)}\n`
      msg += `◦ Leverage : x${leverage}\n`
      msg += `◦ Margin : $${margin.toFixed(2)}`

      return { ok: true, msg }
   }

   /**
    * Open Short Position (Futures)
    * @param {Object} users 
    * @param {String} sym 
    * @param {Number} qty 
    * @param {Number} leverage 
    */
   short(users, sym, qty, leverage = 5) {
      const u = this._getUser(users)
      const a = this.market[sym]
      if (!a || a.halted) return { ok: false, msg: '⚠ Aset halted/tidak tersedia.' }
      if (u.portfolio[sym]) return { ok: false, msg: `⚠ Kamu sudah punya posisi di ${sym}.` }

      const margin = (a.price * qty) / leverage
      if (users.balance < margin) return { ok: false, msg: `❌ Margin kurang. Butuh $${margin.toFixed(2)}` }

      users.balance -= margin
      u.portfolio[sym] = { qty, avg: a.price, lev: leverage, type: 'SHORT' }

      let msg = `✅ *OPEN SHORT* @ ${sym}\n\n`
      msg += `◦ Price : $${a.price.toFixed(2)}\n`
      msg += `◦ Leverage : x${leverage}\n`
      msg += `◦ Margin : $${margin.toFixed(2)}`

      return { ok: true, msg }
   }

   /**
    * Close any position (Spot/Futures)
    * @param {Object} users 
    * @param {String} sym 
    */
   close(users, sym) {
      const u = this._getUser(users)
      const a = this.market[sym]
      const p = u.portfolio[sym]
      if (!p) return { ok: false, msg: '⚠ Tidak ada posisi.' }
      if (p.type === 'SPOT') return this.sell(users, sym, p.qty)

      let payout = 0
      let netProfit = 0
      const currentVal = a.price * p.qty
      const entryVal = p.avg * p.qty
      const margin = entryVal / p.lev

      if (p.type === 'LONG') {
         const loan = entryVal - margin
         payout = currentVal - loan
         if (payout < 0) payout = 0
         netProfit = payout - margin
      } else if (p.type === 'SHORT') {
         const diff = entryVal - currentVal
         payout = margin + diff
         if (payout < 0) payout = 0
         netProfit = payout - margin
      }

      users.balance += payout
      delete u.portfolio[sym]

      let msg = `✅ *EXIT ${p.type}* @ ${sym}\n\n`
      msg += `◦ Price : $${a.price.toFixed(2)}\n`
      msg += `◦ Payout : $${payout.toFixed(2)}\n`
      msg += `◦ PnL : ${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)}`

      return { ok: true, msg }
   }

   /**
    * Create a pending order (Limit/TP/SL)
    * @param {Object} users 
    * @param {String} type 
    * @param {String} sym 
    * @param {Number} price 
    * @param {Number} qty 
    * @param {Number} leverage 
    */
   addOrder(users, type, sym, price, qty, leverage = 1) {
      const u = this._getUser(users)
      const a = this.market[sym]
      if (!a) return { ok: false, msg: '❌ Aset tidak valid.' }

      if (type.includes('LIMIT')) {
         const isFutures = type.includes('LONG') || type.includes('SHORT')
         const lev = isFutures ? leverage : 1
         const cost = (price * qty) / lev
         if (users.balance < cost) return { ok: false, msg: '❌ Saldo tidak cukup.' }
         users.balance -= cost
      }

      const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
      u.orders.push({ id, type, sym, price, qty, lev: leverage, date: Date.now() })
      return { ok: true, msg: `✅ Order Created: ${type} ${sym} @ $${price}` }
   }

   /**
    * Cancel specific order by ID
    * @param {Object} users 
    * @param {String} id 
    */
   cancelOrder(users, id) {
      const u = this._getUser(users)
      const idx = u.orders.findIndex(o => o.id === id)
      if (idx === -1) return { ok: false, msg: '❌ Order ID tidak ditemukan.' }
      const ord = u.orders[idx]
      if (ord.type.includes('LIMIT')) {
         const cost = (ord.price * ord.qty) / ord.lev
         users.balance += cost
      }
      u.orders.splice(idx, 1)
      return { ok: true, msg: '✅ Order dibatalkan.' }
   }

   /**
    * Check and execute pending orders for all users
    * @param {Array} allUsers 
    */
   _checkPendingOrders(allUsers) {
      try {
         for (const u of allUsers) {
            if (!u.market || !u.market.orders || u.market.orders.length === 0) continue
            for (let i = u.market.orders.length - 1; i >= 0; i--) {
               const o = u.market.orders[i]
               const mkt = this.market[o.sym]
               if (!mkt) continue
               let executed = false

               if (o.type === 'LIMIT_BUY' && mkt.price <= o.price) {
                  this._executeOrder(u, 'SPOT', o.sym, o.qty, 1, o.price)
                  executed = true
               } else if (o.type === 'LIMIT_LONG' && mkt.price <= o.price) {
                  this._executeOrder(u, 'LONG', o.sym, o.qty, o.lev, o.price)
                  executed = true
               } else if (o.type === 'LIMIT_SHORT' && mkt.price >= o.price) {
                  this._executeOrder(u, 'SHORT', o.sym, o.qty, o.lev, o.price)
                  executed = true
               } else if (o.type === 'TP' || o.type === 'SL') {
                  const p = u.market.portfolio[o.sym]
                  if (!p) { executed = true; continue; }
                  const isLong = p.type === 'LONG' || p.type === 'SPOT'
                  let trigger = false
                  if (isLong) {
                     if (o.type === 'TP' && mkt.price >= o.price) trigger = true
                     if (o.type === 'SL' && mkt.price <= o.price) trigger = true
                  } else {
                     if (o.type === 'TP' && mkt.price <= o.price) trigger = true
                     if (o.type === 'SL' && mkt.price >= o.price) trigger = true
                  }
                  if (trigger) {
                     this.close(u, o.sym)
                     executed = true
                  }
               }
               if (executed) u.market.orders.splice(i, 1)
            }
         }
      } catch { }
   }

   /**
    * Internal helper to execute order and update portfolio
    */
   _executeOrder(u, type, sym, qty, lev, price) {
      if (!u.market.portfolio[sym]) {
         u.market.portfolio[sym] = { qty, avg: price, lev, type }
      } else {
         const p = u.market.portfolio[sym]
         if (p.type !== type) return
         const totalOld = p.qty * p.avg
         const totalNew = qty * price
         p.avg = (totalOld + totalNew) / (p.qty + qty)
         p.qty += qty
      }
   }

   /**
    * Stake Spot Assets
    * @param {Object} users 
    * @param {String} sym 
    * @param {Number} qty 
    * @param {Number} durationHours 
    */
   stake(users, sym, qty, durationHours) {
      const u = this._getUser(users)
      const p = u.portfolio[sym]
      if (!p || p.qty < qty) return { ok: false, msg: '⚠ Aset portfolio kurang.' }
      if (p.type === 'SHORT' || p.type === 'LONG') return { ok: false, msg: '⚠ Hanya aset Spot yang bisa di-stake.' }

      const apy = 0.001
      p.qty -= qty
      if (p.qty <= 0) delete u.portfolio[sym]
      u.staking.push({
         sym, qty, start: Date.now(), duration: durationHours * 3600000, apy
      })
      return { ok: true, msg: `✅ Berhasil Stake ${qty} ${sym} selama ${durationHours} jam.` }
   }

   /**
    * Process staking rewards for a specific user
    * @param {Object} u - User object
    * @returns {Boolean} true if any stake was processed
    */
   processStaking(u) {
      if (!u.market || !u.market.staking || u.market.staking.length === 0) return false

      let processed = false
      for (let i = u.market.staking.length - 1; i >= 0; i--) {
         const s = u.market.staking[i]
         if (Date.now() > s.start + s.duration) {
            const reward = s.qty * (s.apy * (s.duration / 3600000))
            const total = s.qty + reward
            const priceNow = this.market[s.sym] ? this.market[s.sym].price : 0

            if (priceNow > 0) {
               if (!u.market.portfolio[s.sym]) {
                  u.market.portfolio[s.sym] = { qty: total, avg: priceNow, lev: 1, type: 'SPOT' }
               } else {
                  const p = u.market.portfolio[s.sym]
                  if (p.type === 'SPOT') p.qty += total
                  else u.balance += (total * priceNow)
               }
               u.market.staking.splice(i, 1)
               processed = true
            }
         }
      }
      return processed
   }

   /**
    * Loop through all users to check staking
    * @param {Array} allUsers 
    */
   _checkStaking(allUsers) {
      try {
         for (const u of allUsers) {
            this.processStaking(u)
         }
      } catch { }
   }

   /**
    * Analyze RSI for an asset
    * @param {String} sym 
    */
   analyze(sym) {
      const a = this.market[sym]
      if (!a) return null
      const data = a.history
      if (data.length < 14) return '❌ Data belum cukup.'
      let gains = 0, losses = 0
      for (let i = data.length - 14; i < data.length; i++) {
         const diff = data[i] - data[i - 1]
         if (diff >= 0) gains += diff
         else losses -= diff
      }
      const rs = gains / (losses || 1)
      const rsi = 100 - (100 / (1 + rs))
      let signal = 'NEUTRAL'
      if (rsi > 70) signal = 'OVERBOUGHT (Sell Signal)'
      if (rsi < 30) signal = 'OVERSOLD (Buy Signal)'
      return { rsi: rsi.toFixed(2), signal, price: a.price }
   }

   /**
    * Initialize new season object
    */
   _newSeason() { return { id: Date.now(), ends: Date.now() + SEASON_DURATION } }

   /**
    * Check if season has ended
    */
   _seasonWatcher() {
      setInterval(() => {
         if (Date.now() > this.season.ends) {
            this._rewardSeason()
            this.season = this._newSeason()
         }
      }, 60 * 1000)
   }

   /**
    * Get Season Prizes
    */
   get PRIZES() { return [100000, 50000, 25000] }

   /**
    * Distribute season rewards
    */
   _rewardSeason() {
      const { hostJid, clientJid, findJid } = JID(this.client)
      const dbUsers = !hostJid && findJid.bot(clientJid) ? findJid.bot(clientJid).data : global.db || {}
      const allUsers = Object.values(dbUsers)
      if (allUsers.length === 0) return
      const winners = this.leaderboard(allUsers, 3)
      if (winners.length === 0) return

      let text = `🏆 *SEASON ENDED - HALL OF FAME*\n_Hadiah telah dikirim & Portofolio di-reset ke saldo tunai._\n\n`
      winners.forEach((w, index) => {
         const prize = this.PRIZES[index] || 100000
         const user = dbUsers[w.jid]
         if (user) {
            user.balance += prize
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
            text += `${medal} @${w.jid.split('@')[0]}\n └ Reward : +$${prize.toLocaleString()}\n\n`
         }
      })
      text += global.footer
      this._notify(text.trim())
      this._liquidateAndReset(allUsers)
   }

   /**
    * Liquidate positions and reset for new season
    * @param {Array} allUsers 
    */
   _liquidateAndReset(allUsers) {
      for (const u of allUsers) {
         if (!u.market || !u.market.portfolio) continue
         let totalCashback = 0
         u.market.orders = []
         u.market.staking = []

         for (const [sym, p] of Object.entries(u.market.portfolio)) {
            const marketAsset = this.market[sym]
            if (marketAsset) {
               const currentPrice = marketAsset.price
               const entryPrice = p.avg || currentPrice
               const qty = p.qty
               const lev = p.lev || 1
               let equity = 0

               if (p.type === 'SPOT') {
                  equity = qty * currentPrice
               } else if (p.type === 'LONG') {
                  const margin = (entryPrice * qty) / lev
                  const loan = (entryPrice * qty) - margin
                  equity = (currentPrice * qty) - loan
               } else if (p.type === 'SHORT') {
                  const margin = (entryPrice * qty) / lev
                  const profit = (entryPrice - currentPrice) * qty
                  equity = margin + profit
               }

               if (equity < 0) equity = 0
               totalCashback += equity
            }
         }
         u.balance += Math.floor(totalCashback)
         u.market.portfolio = {}
         u.market.season = this.season.id
      }
   }

   /**
    * Send notification to random group
    * @param {String} text 
    */
   _notify(text) {
      // setTimeout(() => {
      //    const jid = this._randomGroup()
      //    if (!jid) return
      //    try { this.client?.reply(jid, text) } catch { }
      // }, Math.random() * 30000)
   }

   /**
    * Get top traders by net worth
    * @param {Array} allUsers 
    * @param {Number} top 
    */
   leaderboard(allUsers, top = 10) {
      const result = []
      for (const u of allUsers) {
         if (!u.market) continue
         let totalNetWorth = u.balance || 0
         if (u.market.portfolio) {
            for (const [sym, p] of Object.entries(u.market.portfolio)) {
               const marketAsset = this.market[sym]
               if (!marketAsset) continue
               const currentPrice = marketAsset.price
               const qty = p.qty
               const lev = p.lev || 1
               const entryPrice = p.avg || currentPrice
               let equity = 0

               if (p.type === 'SPOT') {
                  equity = qty * currentPrice
               } else if (p.type === 'LONG') {
                  const loan = (entryPrice * qty) * (1 - 1 / lev)
                  equity = (currentPrice * qty) - loan
               } else if (p.type === 'SHORT') {
                  const margin = (entryPrice * qty) / lev
                  const profit = (entryPrice - currentPrice) * qty
                  equity = margin + profit
               }
               if (equity < 0) equity = 0
               totalNetWorth += equity
            }
         }
         if (u.market.staking) {
            u.market.staking.forEach(s => {
               totalNetWorth += s.qty * this.market[s.sym].price
            })
         }
         result.push({
            jid: u.jid,
            name: u.name || 'Trader',
            net: Math.floor(totalNetWorth),
            role: totalNetWorth > 1000000 ? '🐳 Whale' : '🐟 Fish'
         })
      }
      return result.sort((a, b) => b.net - a.net).slice(0, top)
   }

   /**
    * Format leaderboard string
    * @param {Array} allUsers 
    */
   getLeaderboardString(allUsers) {
      const top = this.leaderboard(allUsers, 10)
      if (!top.length) return '❌ Belum ada data trader.'
      let text = `🏆 *TOP 10 TRADERS (NET WORTH)*\n_Saldo + Aset Portofolio (Equity)_\n\n`
      top.forEach((u, i) => {
         const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
         const netFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(u.net)
         text += `${medal} @${u.jid.replace(/@.+/, '')} *(${u.name})*\n └ ${u.role} | *Net* : ${netFormatted}\n\n`
      })
      return text + global.footer
   }

   /**
    * Format market snapshot string
    */
   getMarketString() {
      let text = `〄 *GLOBAL MARKET SNAPSHOT*\n\n`
      text += `[ ▲ ] : Harga naik (Bullish)\n`
      text += `[ ▼ ] : Harga turun (Bearish)\n`
      text += `[ ⥦ ] : Harga stabil (Sideway)\n\n`
      for (const [sym, d] of Object.entries(this.market)) {
         let icon = '⥦'
         if (d.change > 0.1) icon = '▲'
         else if (d.change < -0.1) icon = '▼'
         const sign = d.change > 0 ? '+' : ''
         text += `${icon} \`${sym}\` : $${d.price.toFixed(2)} (${sign}${d.change.toFixed(2)}%)\n`
      }
      return text.trim()
   }
}

export default Market