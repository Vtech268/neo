export const run = {
   usage: ['spotbuy'],
   use: 'symbol qty',
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
      if (!args || args.length < 2) return client.reply(m.chat, Utils.example(isPrefix, command, 'BTC 0.1'), m)

      let [sym, qty] = args

      sym = sym.toUpperCase()
      qty = Number(qty)

      if (isNaN(qty) || qty <= 0) return client.reply(m.chat, `❌ Jumlah (qty) harus angka positif.`, m)

      const r = market.buy(users, sym, qty)

      client.reply(m.chat, r.msg, m)
   },
   error: false
}