import { foodsPet } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['buyfood'],
   use: 'food quantity',
   category: 'rpg',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      players,
      users,
      Utils
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Utils.example(isPrefix, command, 'bone 3'))
         const food = args[0].toLowerCase()
         if (!foodsPet.map(v => v.name).includes(food)) return m.reply(`🚩 ${Utils.ucword(food)} tidak ada dalam daftar makanan.`)
         const isPrice = foodsPet.find(v => v.name === food)
         if (users.pocket < (isPrice.price * (args[1] || 1))) return m.reply(`🚩 Uang yang kamu miliki tidak cukup untuk membeli *${(args[1] || 1)}* ${Utils.ucword(food)}.`)
         m.reply(`✅ Berhasil membeli *${(args[1] || 1)}* ${Utils.ucword(args[0])}.`).then(() => {
            players.resource[food] += parseInt((args[1] || 1))
            users.pocket -= parseInt(isPrice.price * (args[1] || 1))
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true
}