export const run = {
   usage: ['cage'],
   hidden: ['kandang'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      Utils
   }) => {
      try {
         players.inventory.hunting = players.inventory.hunting ? players.inventory.hunting : []
         const items = players.inventory.hunting
         if (items.length < 1) return m.reply(`⚠️ Kandang kosong, kamu tidak mempunyai hewan hasil buruan.\n\n> Kirim *${isPrefix}hunting* untuk berburu.`)
         let pr = `乂  *C A G E*\n\n`
         pr += `“Berikut ini adalah daftar hewan hasil buruan yang bisa kamu jual untuk mendapatkan uang.”\n\n`
         pr += items.sort((a, b) => b.name - a.name).map((v, i) => `    ◦  ${v.emoji}  ${Utils.ucword(v.name)} : ${Utils.formatter(v.count)}`).join('\n')
         pr += `\n\n> Kirim *${isPrefix}sell <item>* untuk menjual hewan dan *${isPrefix}sellall cage* untuk menjual semua hewan yang ada dikandang.`
         m.reply(pr)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}