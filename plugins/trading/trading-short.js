export const run = {
   usage: ['short'],
   use: 'symbol qty leverage',
   category: 'trading',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      market,
      Utils
   }) => {
      if (!args || args.length < 2) return client.reply(m.chat, Utils.example(isPrefix, command, 'BTC 0.5 5'), m)

      let [sym, qty, lev] = args
      
      sym = sym.toUpperCase()
      qty = Number(qty)
      lev = Number(lev) || 5

      if (isNaN(qty) || qty <= 0) return client.reply(m.chat, `❌ Jumlah (qty) harus angka positif greater dari 0.`, m)
      if (isNaN(lev) || lev < 1) return client.reply(m.chat, `❌ Leverage harus angka minimal 1.`, m)

      const r = market.short(users, sym, qty, lev)

      client.reply(m.chat, r.msg, m)
   },
   error: false
}