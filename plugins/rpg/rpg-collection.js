export const run = {
   usage: ['collection'],
   category: 'rpg',
   async: async (m, {
      client,
      users,
      players,
      Utils
   }) => {
      try {
         players.inventory.fishing = players?.inventory?.fishing || []
         players.inventory.farming = players?.inventory?.farming || []
         players.inventory.hunting = players?.inventory?.hunting || []
         if (players.inventory.fishing.length < 1 && players.inventory.farming.length < 1 && players.inventory.hunting.length < 1) return m.reply(Utils.texted('bold', `🚩 Maaf, kamu tidak mempunyai item apapun di dalam collection inventory.`))
         let p = `乂  *C O L L E C T I O N*\n\n`
         p += `“Berikut ini adalah koleksi item yang bisa kamu jual untuk mendapatkan uang, uang yang kamu dapat bisa digunakan untuk membeli premium, limit, dll.”\n\n`
         p += `+ ${Utils.Styles('Fishing')} :\n\n`
         p += (players.inventory.fishing.length < 1) ? 'Item kosong' : players.inventory.fishing.sort((a, b) => b.name - a.name).map((v, i) => `    ◦  ${v.emoji}  ${Utils.ucword(v.name)} : ${Utils.formatter(v.count)}`).join('\n')
         p += `\n\n`
         p += `+ ${Utils.Styles('Farming')} :\n\n`
         p += (players.inventory.farming.length < 1) ? 'Item kosong' : players.inventory.farming.sort((a, b) => b.name - a.name).map((v, i) => `    ◦  ${v.emoji}  ${Utils.ucword(v.name)} : ${Utils.formatter(v.count)}`).join('\n')
         p += `\n\n`
         p += `+ ${Utils.Styles('Hunting')} :\n\n`
         p += (players.inventory.hunting.length < 1) ? 'Item kosong' : players.inventory.hunting.sort((a, b) => b.name - a.name).map((v, i) => `    ◦  ${v.emoji}  ${Utils.ucword(v.name)} : ${Utils.formatter(v.count)}`).join('\n')
         p += `\n\n${global.footer}`
         m.reply(p)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   game: true
}