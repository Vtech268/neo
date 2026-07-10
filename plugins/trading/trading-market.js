export const run = {
   usage: ['market'],
   category: 'trading',
   async: async (m, {
      isPrefix,
      market
   }) => {
      let list = market.getMarketString()
      list += `\n\n`
      list += `> Data auto-update setiap 5 menit.\n`
      list += `> Kirim ${isPrefix}spotbuy, ${isPrefix}long atau ${isPrefix}short untuk membeli aset dan ${isPrefix}spotsell / ${isPrefix}exit untuk menjual/menutup asset.`
      m.reply(list)
   },
   error: false
}
