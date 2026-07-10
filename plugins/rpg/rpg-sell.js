import { USD, fishs, vegetas, animals } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['sell'],
   use: 'item',
   category: 'rpg',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      players,
      users,
      Utils
   }) => {
      try {
         players.inventory.fishing = players.inventory.fishing ? players.inventory.fishing : []
         players.inventory.farming = players.inventory.farming ? players.inventory.farming : []
         players.inventory.hunting = players.inventory.hunting ? players.inventory.hunting : []
         if (!text) return m.reply(Utils.example(isPrefix, command, 'kepiting'))
         const item = text.toLowerCase()
         if (fishs.price.map(v => v.name).includes(item) && players.inventory.fishing.length < 1) return m.reply(`⚠️ Kolam kosong, tidak ada ikan untuk dijual.\n\n> Kirim *${isPrefix}fishing* untuk memancing.`)
         if (vegetas.price.map(v => v.name).includes(item) && players.inventory.farming.length < 1) return m.reply(`⚠️ Gudang kosong, tidak ada buah untuk dijual.\n\n> Kirim *${isPrefix}farming* untuk bertani.`)
         if (animals.price.map(v => v.name).includes(item) && players.inventory.hunting.length < 1) return m.reply(`⚠️ Kandang kosong, tidak ada hewan untuk dijual.\n\n> Kirim *${isPrefix}hunting* untuk berburu.`)
         const items = players.inventory.fishing.concat(players.inventory.farming).concat(players.inventory.hunting).find(v => v.name == item)
         if (!items) return m.reply(Utils.texted('bold', `🚩 Item tidak ada.`))
         if (items.count < 1) return m.reply(Utils.texted('italic', `🚩 Maaf, kamu tidak mempunyai ${Utils.ucword(items.name)}.`))
         const fromItems = fishs.price.concat(vegetas.price).concat(animals.price).find(v => v.name === item)
         m.reply(`✅ Berhasil menjual *${Utils.formatter(items.count)} ${Utils.ucword(items.name)}* (${items.emoji}) dengan total : ${USD.format(Number(items.count * fromItems.price))}`).then(() => {
            users.pocket += Number(items.count * fromItems.price)
            items.count = 0
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   limit: true,
   game: true
}