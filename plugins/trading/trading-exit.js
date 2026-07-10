export const run = {
   usage: ['exit'],
   use: 'symbol',
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
      if (!args || args.length < 1) return client.reply(m.chat, Utils.example(isPrefix, command, 'BTC'), m)
      
      let [sym] = args
      sym = sym.toUpperCase()

      const r = market.close(users, sym)
      
      client.reply(m.chat, r.msg, m)
   },
   error: false
}