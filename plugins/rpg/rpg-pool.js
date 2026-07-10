export const run = {
   usage: ['pool'],
   hidden: ['kolam'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      Utils
   }) => {
      try {
         players.inventory.fishing = players.inventory.fishing ? players.inventory.fishing : []
         const items = players.inventory.fishing
         if (items.length < 1) return m.reply(`⚠️ Kolam kosong, kamu tidak mempunyai ikan hasil pancingan.\n\n> Kirim *${isPrefix}fishing* untuk memancing.`)
         let pr = `乂  *P O O L*\n\n`
         pr += `“Berikut ini adalah daftar ikan hasil pancingan yang bisa kamu jual untuk mendapatkan uang.”\n\n`
         pr += items.sort((a, b) => b.name - a.name).map((v, i) => `    ◦  ${v.emoji}  ${Utils.ucword(v.name)} : ${Utils.formatter(v.count)}`).join('\n')
         pr += `\n\n> Kirim *${isPrefix}sell <item>* untuk menjual ikan dan *${isPrefix}sellall pool* untuk menjual semua ikan yang ada dikolam.`
         m.reply(pr)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}