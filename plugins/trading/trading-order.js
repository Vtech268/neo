import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['order', 'cancelorder', 'myorder'],
   use: 'type symbol price qty',
   category: 'trading',
   async: async (m, {
      args,
      isPrefix,
      command,
      users,
      market,
      Utils
   }) => {
      const u = users.market || {}
      u.orders ||= []

      if (command === 'myorder') {
         if (!u.orders.length) return m.reply('❌ Tidak ada pending order.')
         let text = `〄 *PENDING ORDERS*\n\n`
         u.orders.forEach((o, i) => {
            text += `◦ [${o.type}] ${o.sym} x${o.qty}\n`
            text += `◦ Target : ${USD.format(o.price)} | ID : ${o.id}\n\n`
         })
         return m.reply(text.trim())
      }

      if (command === 'cancelorder') {
         if (!args[0]) return m.reply(Utils.example(isPrefix, 'cancelorder', '1zieudh7yw'))
         const r = market.cancelOrder(users, args[0])
         return m.reply(r.msg)
      }

      let pr = `• *Usage Example* :\n\n`
      pr += `${isPrefix}order <type> <sym> <price> <qty>\n`
      pr += `\n_Type: lb, ls, tp, sl_`
      if (args.length < 3) return m.reply(pr)

      const type = args[0].toUpperCase()
      const sym = args[1].toUpperCase()
      const price = Number(args[2])
      const qty = Number(args[3]) || 0

      const validTypes = {
         LB: 'LIMIT_BUY',
         LS: 'LIMIT_SELL',
         TP: 'TP',
         SL: 'SL'
      }
      
      if (!Object.keys(validTypes).includes(type)) return m.reply('❌ Tipe tidak valid. Gunakan: lb, ls, tp, sl')

      let finalQty = qty
      if ((type === 'TP' || type === 'SL') && qty === 0) {
         if (!u.portfolio[sym]) return m.reply('❌ Kamu tidak punya aset ini untuk pasang TP/SL.')
         finalQty = u.portfolio[sym].qty
      }

      const r = market.addOrder(users, type, sym, price, finalQty)
      m.reply(r.msg)
   },
   error: false
}