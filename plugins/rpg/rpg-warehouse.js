export const run = {
   usage: ['warehouse'],
   hidden: ['gudang'],
   category: 'rpg',
   async: async (m, {
      client,
      isPrefix,
      players,
      Utils
   }) => {
      try {
         players.inventory.farming = players.inventory.farming ? players.inventory.farming: []
         const items = players.inventory.farming
         if (items.length < 1) return m.reply(`⚠️ Gudang kosong, kamu tidak mempunyai buah hasil bertani.\n\n> Kirim *${isPrefix}farming* untuk bertani.`)
         let pr = `乂  *W A R E H O U S E*\n\n`
         pr += `“Berikut ini adalah daftar buah hasil bertani yang bisa kamu jual untuk mendapatkan uang.”\n\n`
         pr += items.sort((a, b) => b.name - a.name).map((v, i) => `    ◦  ${v.emoji}  ${Utils.ucword(v.name)} : ${Utils.formatter(v.count)}`).join('\n')
         pr += `\n\n> Kirim *${isPrefix}sell <item>* untuk menjual buah dan *${isPrefix}sellall warehouse* untuk menjual semua buah yang ada digudang.`
         m.reply(pr)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}