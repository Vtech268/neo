import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['portfolio'],
   hidden: ['portofolio', 'pf'],
   category: 'trading',
   async: async (m, {
      users,
      isPrefix,
      market
   }) => {
      const u = users.market || { portfolio: {}, staking: [] }
      const portfolio = u.portfolio || {}
      const staking = u.staking || []

      const keys = Object.keys(portfolio)
      if (keys.length === 0 && staking.length === 0) {
         return m.reply(`❌ Portofolio kamu masih kosong.\n\n> Gunakan *${isPrefix}spotbuy* atau *${isPrefix}long/short* untuk memulai.`)
      }

      let text = `〄 *TRADING PORTFOLIO*\n\n`
      text += `◦ Trader : ${m.pushName || '-'}\n`
      text += `◦ Cash : ${USD.format(users?.balance)}\n`
      text += `\n`

      let totalEquity = 0
      let totalFloatingPnL = 0

      for (const sym of keys) {
         const p = portfolio[sym]
         const mkt = market.market[sym]

         if (!mkt) continue

         const currentPrice = mkt.price
         const entryPrice = p.avg || currentPrice
         const leverage = p.lev || 1
         const type = p.type || 'SPOT'

         let margin = 0
         let equity = 0
         let pnl = 0
         let loan = 0

         if (type === 'SPOT') {
            margin = entryPrice * p.qty
            equity = currentPrice * p.qty
            pnl = equity - margin
            loan = 0
         } else if (type === 'LONG') {
            const totalEntryVal = entryPrice * p.qty
            margin = totalEntryVal / leverage
            loan = totalEntryVal - margin

            const grossValue = currentPrice * p.qty
            equity = grossValue - loan
            pnl = equity - margin
         } else if (type === 'SHORT') {
            const totalEntryVal = entryPrice * p.qty
            margin = totalEntryVal / leverage

            const diff = (entryPrice - currentPrice) * p.qty
            equity = margin + diff
            pnl = diff
            loan = 0
         }

         let isLiquidated = false
         if (equity <= 0) {
            equity = 0
            isLiquidated = true
         }

         const pnlPercent = margin > 0 ? (pnl / margin) * 100 : 0

         let icon = '⥦'
         if (isLiquidated) icon = '💀'
         else if (pnlPercent > 0.1) icon = '▲'
         else if (pnlPercent < -0.1) icon = '▼'

         const sign = pnl > 0 ? '+' : ''
         const priceStr = entryPrice < 1 ? entryPrice.toFixed(2) : entryPrice.toFixed(2)
         const currStr = currentPrice < 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(2)
         const displayQty = p.qty.toLocaleString('en-US', { maximumFractionDigits: 1 })

         const typeTag = type === 'SPOT' ? 'SPOT' : type === 'LONG' ? 'LONG' : 'SHORT'

         text += `*${sym}* [${typeTag}] ${displayQty}x (Lev ${leverage}x)\n`
         text += `◦ Price : ${USD.format(priceStr)} ➜ ${USD.format(currStr)}\n`

         if (isLiquidated) {
            text += `⚠️ *LIQUIDATED (REKT)*\n`
         } else {
            text += `◦ PnL : ${icon} ${sign}${USD.format(pnl)} (${sign}${pnlPercent.toFixed(2)}%)\n`
            text += `◦ Equity : ${USD.format(equity)}\n`
            if (type === 'LONG') text += `◦ Loan : ${USD.format(loan)}\n`
         }
         text += `\n`

         totalEquity += equity
         totalFloatingPnL += pnl
      }

      let stakingValue = 0
      if (staking.length > 0) {
         text += `〄 *STAKING ASSETS*\n`
         for (const s of staking) {
            const mktS = market.market[s.sym]
            if (mktS) {
               const val = s.qty * mktS.price
               stakingValue += val
               text += `◦ ${s.sym} : ${s.qty.toFixed(2)} (${USD.format(val)})\n`
            }
         }
         text += `\n`
      }

      const netWorth = users.balance + totalEquity + stakingValue
      const totalSign = totalFloatingPnL >= 0 ? '+' : ''

      text += `〄 *SUMMARY*\n`
      text += `◦ Floating PnL : ${totalSign}${USD.format(totalFloatingPnL)}\n`
      if (stakingValue > 0) text += `◦ Staked Value : ${USD.format(stakingValue)}\n`
      text += `◦ Net Worth : *${USD.format(netWorth)}*\n\n`

      text += global.footer

      m.reply(text.trim())
   },
   error: false
}