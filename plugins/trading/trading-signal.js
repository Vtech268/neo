export const run = {
   usage: ['signal'],
   use: 'symbol',
   category: 'trading',
   async: async (m, {
      args,
      isPrefix,
      command,
      market,
      Utils
   }) => {
      if (!args[0]) return m.reply(Utils.example(isPrefix, command, 'BTC'))
      const res = market.analyze(args[0].toUpperCase())

      if (!res) return m.reply('❌ Asset tidak ditemukan.')
      if (typeof res === 'string') return m.reply(res)

      let text = `〄 *MARKET SIGNAL : ${args[0].toUpperCase()}*\n\n`
      text += `◦ Price : $${res.price}\n`
      text += `◦ RSI (14) : ${res.rsi}\n`
      text += `◦ Signal : *${res.signal}*\n\n`
      text += global.footer

      m.reply(text)
   },
   error: false
}