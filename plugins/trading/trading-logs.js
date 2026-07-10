import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['logs'],
   hidden: ['history', 'tradehistory'],
   category: 'trading',
   async: async (m, {
      client,
      users,
      Utils
   }) => {
      const u = users.market || {}
      const history = u.history || []

      if (history.length === 0) return client.reply(m.chat, '❌ Belum ada riwayat transaksi.', m)

      // Hitung Statistik
      let totalWin = 0
      let totalLoss = 0
      let totalPnL = 0

      history.forEach(h => {
         if (h.pnl > 0) totalWin++
         else totalLoss++
         totalPnL += h.pnl
      })

      const totalTrades = history.length
      const winRate = totalTrades > 0 ? ((totalWin / totalTrades) * 100).toFixed(0) : 0

      let text = `〄 *TRADING HISTORY (Last ${totalTrades})*\n\n`

      // Header Statistik
      text += `◦ Win Rate : ${winRate}%\n`
      text += `◦ Realized PnL : ${totalPnL >= 0 ? '+' : ''}${USD.format(totalPnL)}\n\n`

      // Daftar Log
      history.forEach(h => {
         const date = new Date(h.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' })
         const time = new Date(h.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

         const isWin = h.pnl >= 0
         const icon = isWin ? '▲' : '▼'
         const sign = isWin ? '+' : ''

         // Format: [TGL] TYPE SYM (PNL)
         text += `${icon} [${date} ${time}] *${h.type} ${h.sym}*\n`
         text += `   ◦ Entry : $${Utils.formatter(h.entry)} ➜ Exit : $${Utils.formatter(h.close)}\n`
         text += `   ◦ PnL : ${sign}${USD.format(h.pnl)}\n`
      })

      text += `\n` + global.footer
      client.reply(m.chat, text.trim(), m)
   },
   error: false
}